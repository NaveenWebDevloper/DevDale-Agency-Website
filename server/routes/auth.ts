import express, { Request, Response } from "express";
import User from "../models/User";
import { hashPassword, verifyPassword, signJwt, rateLimiter } from "../middleware/securityMiddleware";
import { authenticate } from "../middleware/authMiddleware";
import ActivityLog from "../models/ActivityLog";
import crypto from "crypto";
import { EmailService } from "../services/emailService";
import { GoogleOAuthHelper } from "../utils/googleOAuthHelper";

const router = express.Router();

// Rate limiter for authentication endpoints: 10 attempts per 15 minutes
const loginLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many authentication attempts. Please try again after 15 minutes.",
});

/**
 * Helper to record activity logs
 */
async function logActivity(userId: string | undefined, action: string, details: any, req: Request) {
  try {
    await ActivityLog.create({
      userId,
      action,
      details,
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });
  } catch (err) {
    console.error("[ActivityLog] Error creating log:", err);
  }
}

/**
 * POST /api/auth/login
 */
router.post("/login", loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      await logActivity(undefined, "LOGIN_FAILED", { email, reason: "User not found" }, req);
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Check account lockout status
    const now = new Date();
    if (user.isLocked && user.lockUntil && user.lockUntil > now) {
      const waitMins = Math.ceil((user.lockUntil.getTime() - now.getTime()) / 60000);
      await logActivity(user._id, "LOGIN_LOCKED", { email, reason: "Account is temporarily locked" }, req);
      return res.status(423).json({
        error: `This account is temporarily locked due to excessive failed attempts. Please retry in ${waitMins} minute(s).`,
      });
    }

    // Verify Password
    // Passwords in DB are stored as "hash:salt" to fit our custom pbkdf2 helper, 
    // or let's check how the seed works. We'll store password as a single string combining hash & salt
    // (e.g. hash:salt or json format), or we can split it.
    // Let's store password format as `hash:salt` in the password field!
    const parts = user.password.split(":");
    if (parts.length !== 2) {
      // In case we hashed it in a different style, standard fallback:
      await logActivity(user._id, "LOGIN_FAILED", { email, reason: "Corrupted password format in DB" }, req);
      return res.status(500).json({ error: "Internal credentials profile error." });
    }

    const [hash, salt] = parts;
    const isValid = verifyPassword(password, hash, salt);

    if (!isValid) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.isLocked = true;
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        await user.save();
        await logActivity(user._id, "LOGIN_LOCKED", { email, reason: "Triggered account lockout" }, req);
        return res.status(423).json({
          error: "Account has been locked for 15 minutes due to 5 failed login attempts.",
        });
      }
      await user.save();
      await logActivity(user._id, "LOGIN_FAILED", { email, reason: "Invalid password", attempts: user.loginAttempts }, req);
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Login successful
    user.loginAttempts = 0;
    user.isLocked = false;
    user.lockUntil = undefined;

    // Generate tokens
    const userPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = signJwt(userPayload);
    // Refresh token is a 64-char crypto string
    const refreshToken = crypto.randomBytes(40).toString("hex");

    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push(refreshToken);
    // Keep max 5 active refresh tokens to prevent infinite growth
    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift();
    }
    
    await user.save();
    await logActivity(user._id, "LOGIN_SUCCESS", { email }, req);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    res.status(500).json({ error: "Internal authentication system error." });
  }
});

/**
 * POST /api/auth/refresh
 */
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required." });
    }

    const user = await User.findOne({ refreshTokens: refreshToken });
    if (!user) {
      return res.status(401).json({ error: "Refresh token is invalid or has been revoked." });
    }

    // Refresh token valid. Issue a new access token
    const userPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = signJwt(userPayload);
    res.json({ accessToken });
  } catch (error) {
    console.error("[Auth] Refresh token error:", error);
    res.status(500).json({ error: "Internal refresh validation error." });
  }
});

/**
 * POST /api/auth/logout
 */
router.post("/logout", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const user = await User.findOne({ refreshTokens: refreshToken });
      if (user) {
        user.refreshTokens = user.refreshTokens?.filter((t: string) => t !== refreshToken) || [];
        await user.save();
        await logActivity(user._id, "LOGOUT", { tokenRevoked: true }, req);
      }
    }

    res.json({ message: "Successfully logged out and session revoked." });
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    res.status(500).json({ error: "Internal signout process error." });
  }
});

/**
 * GET /api/auth/me
 */
router.get("/me", authenticate, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select("-password -refreshTokens");
    if (!user) {
      return res.status(404).json({ error: "Authorized profile session not found in active database." });
    }
    res.json({ user });
  } catch (error) {
    console.error("[Auth] Me error:", error);
    res.status(500).json({ error: "Internal session identity loading failure." });
  }
});

/**
 * POST /api/auth/forgot-password
 */
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Security standard: don't reveal if user exists, just say "If matching account exists..."
      return res.json({ message: "If an account with that email exists, a password reset link has been dispatched." });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    await user.save();

    const resetLink = `https://thedevdale.com/admin/reset-password?token=${resetToken}`;
    
    // Send email using Resend
    // We will build a beautiful premium template block inside the EmailService
    // Let's add a direct fetch send or standard message inside this controller if needed, or emailService method.
    // For extreme robustness, let's call EmailService.sendEmail or similar
    const htmlContent = `
      <h3>Request to Reset Password</h3>
      <p>Hello ${user.name},</p>
      <p>You are receiving this automated email because you (or someone else) requested a security credential reset for your DevDale Agency OS portal access.</p>
      <p>Please click the button below within the next hour to complete the password reset procedure:</p>
      <p><a href="${resetLink}" style="display:inline-block; background-color:#000; color:#fff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold;" target="_blank">Reset Security Password</a></p>
      <p>If you did not request this change, please ignore this communication and audit your credentials immediately.</p>
    `;

    // To prevent compile issues, let's send through the private send email wrapper:
    // But since it's private, we can make a direct call or use our custom wrappers.
    // Let's just import EmailService and see if it can handle it:
    // EmailService has a private static sendEmail, but we can do a mock dispatch or make a direct resend call.
    // Actually, we can use the EmailService.sendEmail (wait, it's private in our code. Let's look at EmailService methods. It has some public methods).
    // Let's check: we can use a direct resend client or simply export a public method in EmailService for general emails, 
    // or let's create a public method `sendPasswordReset` on EmailService! That is even cleaner.
    // But to save time and ensure it's ready, let's use the local resend import or call a general public method.
    // Wait, let's make sure the forgot-password email sends successfully. We can do a quick check and write a password reset mail.
    // Let's use the Resend client directly here, or we can use our PBKDF2 hash flow to reset.
    // Let's use Resend here:
    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("mock")) {
      const resendClient = new (await import("resend")).Resend(process.env.RESEND_API_KEY);
      await resendClient.emails.send({
        from: `DevDale Security <${process.env.FROM_EMAIL || "hello@thedevdale.com"}>`,
        to: user.email,
        subject: "[Agency OS] Password Reset Authentication Protocol",
        html: htmlContent,
      });
    } else {
      console.log(`[Auth] [PASSWORD RESET MOCK LINK]: ${resetLink}`);
    }

    await logActivity(user._id, "PASSWORD_RESET_REQUEST", { email: user.email }, req);
    res.json({ message: "If an account with that email exists, a password reset link has been dispatched." });
  } catch (error) {
    console.error("[Auth] Forgot password error:", error);
    res.status(500).json({ error: "Internal reset request pipeline error." });
  }
});

/**
 * POST /api/auth/reset-password
 */
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required." });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Reset token is invalid or has expired." });
    }

    // Set new password
    const { hash, salt } = hashPassword(newPassword);
    user.password = `${hash}:${salt}`;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Revoke all active sessions on password change!
    
    await user.save();
    await logActivity(user._id, "PASSWORD_RESET_SUCCESS", { email: user.email }, req);

    res.json({ message: "Your password has been successfully reset. All previous sessions have been revoked." });
  } catch (error) {
    console.error("[Auth] Reset password error:", error);
    res.status(500).json({ error: "Internal credential upgrade processing failure." });
  }
});

/**
 * GET /api/auth/google/url
 * Generate Google OAuth authorization URL
 */
router.get("/google/url", (req: Request, res: Response) => {
  try {
    const authUrl = GoogleOAuthHelper.generateAuthUrl();
    res.json({ url: authUrl });
  } catch (error) {
    console.error("[Auth] Google URL generation error:", error);
    res.status(500).json({ error: "Failed to generate Google authorization URL" });
  }
});

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */
router.get("/google/callback", async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is missing" });
    }

    // Exchange code for tokens
    const tokens = await GoogleOAuthHelper.exchangeCodeForTokens(code as string);

    if (!tokens.refresh_token) {
      console.warn("[Auth] No refresh token received. This may happen if the user previously authorized the app.");
      return res.status(400).json({
        error: "Failed to obtain refresh token. Please revoke app access and try again.",
        hint: "Go to https://myaccount.google.com/permissions and remove 'DevDale' access.",
      });
    }

    // For now, store the global refresh token in environment (in production, handle per-user)
    // This is the refresh token that will be used for the admin account
    console.log("\n✅ Google OAuth Token Exchange Successful!\n");
    console.log("🔐 Refresh Token:", tokens.refresh_token);
    console.log("\nAdd this to your .env file:");
    console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"\n`);

    // Optionally, if you have a user context, store it
    if (req.query.userId) {
      const userId = req.query.userId as string;
      await GoogleOAuthHelper.storeUserGoogleCredentials(userId, tokens);
      await logActivity(userId, "GOOGLE_OAUTH_CONNECTED", { email: tokens.email }, req);
    }

    res.json({
      success: true,
      message: "Google OAuth tokens received successfully",
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expiryDate: tokens.expiry_date,
    });
  } catch (error) {
    console.error("[Auth] Google callback error:", error);
    await logActivity(undefined, "GOOGLE_OAUTH_ERROR", { error: String(error) }, req);
    res.status(500).json({ error: "Failed to complete Google OAuth flow" });
  }
});

/**
 * POST /api/auth/google/disconnect
 * Disconnect Google OAuth from user account (protected route)
 */
router.post("/google/disconnect", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await GoogleOAuthHelper.revokeUserGoogleAccess(userId);
    await logActivity(userId, "GOOGLE_OAUTH_DISCONNECTED", {}, req);

    res.json({ message: "Google account has been disconnected" });
  } catch (error) {
    console.error("[Auth] Google disconnect error:", error);
    res.status(500).json({ error: "Failed to disconnect Google account" });
  }
});

export default router;
