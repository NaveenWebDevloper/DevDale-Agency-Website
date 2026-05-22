import express from "express";
import dotenv from "dotenv";
import mongoose, { Schema } from "mongoose";
import { Resend } from "resend";
import crypto from "crypto";
import { google } from "googleapis";
//#region server/models/Lead.ts
var LeadActivitySchema = new Schema({
	action: {
		type: String,
		required: true
	},
	note: { type: String },
	timestamp: {
		type: Date,
		default: Date.now
	}
}, { _id: false });
var LeadSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		lowercase: true,
		trim: true
	},
	phone: { type: String },
	company: { type: String },
	message: {
		type: String,
		required: true
	},
	status: {
		type: String,
		enum: [
			"New",
			"Contacted",
			"Qualified",
			"Proposal Sent",
			"Won",
			"Lost",
			"Archived"
		],
		default: "New"
	},
	score: {
		type: Number,
		default: 0
	},
	assignedTo: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	budgetRange: { type: String },
	projectType: { type: String },
	notes: { type: String },
	utmSource: { type: String },
	utmMedium: { type: String },
	utmCampaign: { type: String },
	activityTimeline: {
		type: [LeadActivitySchema],
		default: []
	}
}, { timestamps: true });
var Lead_default = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
//#endregion
//#region server/routes/contact.ts
dotenv.config();
var resend$2 = new Resend(process.env.RESEND_API_KEY || "re_mock_123");
var handleSubmitForm = async (req, res) => {
	try {
		console.log("Incoming Lead Data:", req.body);
		const { name, email, company, message } = req.body;
		if (!name || !email || !message) return res.status(400).json({ message: "Name, Email, and Message are required." });
		await new Lead_default({
			name,
			email,
			company,
			message
		}).save();
		const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
		try {
			console.log(`Sending user confirmation from: ${FROM_EMAIL}`);
			const { data, error } = await resend$2.emails.send({
				from: FROM_EMAIL,
				to: email,
				subject: "Phase 1: Project Inquiry Received | DevDale Agency",
				html: `
          <div style="background-color: #000; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden;">
              <div style="background: #000; padding: 60px 40px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase;">DEVDALE</h1>
                <p style="color: #666; font-size: 10px; font-weight: 700; letter-spacing: 4px; margin-top: 12px; text-transform: uppercase;">Strategic Digital Architecture</p>
              </div>
              <div style="padding: 50px 40px;">
                <p style="font-size: 18px; color: #111; line-height: 1.6; margin-top: 0;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px; color: #444; line-height: 1.8;">Your vision has reached our engineering lab. We are currently analyzing the requirements for ${company ? `<strong>${company}</strong>` : "your project"}.</p>
                
                <div style="margin: 40px 0; padding: 30px; background: #f9f9f9; border-left: 6px solid #000; border-radius: 0 16px 16px 0;">
                  <p style="margin: 0; font-size: 15px; color: #666; font-style: italic; line-height: 1.6;">"At DevDale, we don't just build software; we architect the infrastructure of tomorrow."</p>
                </div>

                <p style="font-size: 16px; color: #444; line-height: 1.8;">A lead architect will reach out to you within <strong>24 hours</strong> to discuss the next phase of development.</p>
                
                <div style="margin-top: 60px; padding-top: 40px; border-top: 1px solid #eee; text-align: center;">
                  <p style="font-size: 11px; color: #aaa; margin: 0; letter-spacing: 1px; font-weight: 600;">© 2026 DEVDALE AGENCY. ALL SYSTEMS OPTIMIZED.</p>
                </div>
              </div>
            </div>
          </div>
        `
			});
			if (error) console.error("Resend Error (User Email):", JSON.stringify(error, null, 2));
			else console.log("User Email Sent Successfully!");
		} catch (emailError) {
			console.error("Resend Exception (User Email):", emailError);
		}
		try {
			const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@devdale.com";
			console.log(`Sending admin alert from: ${FROM_EMAIL}`);
			const { data, error } = await resend$2.emails.send({
				from: FROM_EMAIL,
				to: ADMIN_EMAIL,
				subject: `🚨 MISSION ALERT: ${name} (${company || "Indie"})`,
				html: `
          <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: -apple-system, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; border: 3px solid #000; padding: 50px; box-shadow: 20px 20px 0 rgba(0,0,0,0.05);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px;">
                <h2 style="margin: 0; font-weight: 900; text-transform: uppercase; font-size: 24px;">NEW LEAD</h2>
                <div style="background: #000; color: #fff; padding: 6px 15px; font-size: 11px; font-weight: 900; letter-spacing: 1px;">PRIORITY: ALPHA</div>
              </div>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; font-weight: 700;">Client</td>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee; font-weight: 800; text-align: right; font-size: 16px;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; font-weight: 700;">Organization</td>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee; font-weight: 800; text-align: right; font-size: 16px;">${company || "Confidential"}</td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; font-weight: 700;">Channel</td>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee; font-weight: 800; text-align: right; font-size: 16px;">${email}</td>
                </tr>
              </table>

              <div style="margin-top: 40px;">
                <p style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 12px; font-weight: 900; letter-spacing: 1px;">Project Brief</p>
                <div style="background: #000; color: #fff; padding: 30px; line-height: 1.8; font-size: 15px; border-radius: 4px;">
                  ${message}
                </div>
              </div>

              <div style="margin-top: 50px; text-align: center;">
                <p style="font-size: 10px; color: #ccc; text-transform: uppercase; letter-spacing: 3px; font-weight: bold;">DevDale Lead Capture Protocol V2.0</p>
              </div>
            </div>
          </div>
        `
			});
			if (error) console.error("Resend Error (Admin Email):", JSON.stringify(error, null, 2));
			else console.log("Admin Alert Dispatched!");
		} catch (emailError) {
			console.error("Resend Exception (Admin Email):", emailError);
		}
		return res.status(200).json({ message: "Form submitted successfully!" });
	} catch (error) {
		console.error("Database Error:", error);
		return res.status(500).json({
			message: "Internal server error. Please try again later.",
			error: error?.message || String(error)
		});
	}
};
//#endregion
//#region server/routes/projectRequest.ts
dotenv.config();
var resend$1 = new Resend(process.env.RESEND_API_KEY || "re_mock_123");
var handleProjectRequest = async (req, res) => {
	try {
		console.log("Incoming Project Request Data:", req.body);
		const data = req.body;
		if (!data.fullName || !data.email || !data.projectTitle || !data.description) return res.status(400).json({ message: "Missing required fields." });
		await new Lead_default({
			name: data.fullName,
			email: data.email,
			company: data.companyName || "N/A",
			message: `Project: ${data.projectTitle}\nType: ${data.projectType}\nDescription: ${data.description}\nFeatures: ${Array.isArray(data.features) ? data.features.join(", ") : data.features}\nPlatform: ${data.platform}\nBudget: ${data.budgetRange}\nTimeline: ${data.startDate} to ${data.deadline}\n\nAdditional Notes: ${data.additionalNotes}`
		}).save();
		const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
		const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@devdale.com";
		try {
			await resend$1.emails.send({
				from: FROM_EMAIL,
				to: data.email,
				subject: "Project Strategy Received | DevDale Agency",
				html: `
          <div style="background-color: #000; padding: 40px 20px; font-family: sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 24px; padding: 50px;">
              <h1 style="color: #000; margin: 0; font-size: 28px; font-weight: 900;">DEVDALE</h1>
              <p style="font-size: 18px; color: #111; margin-top: 30px;">Hello ${data.fullName},</p>
              <p style="font-size: 16px; color: #444; line-height: 1.8;">We've received your project request for <strong>${data.projectTitle}</strong>.</p>
              <p style="font-size: 16px; color: #444; line-height: 1.8;">Our architects are already reviewing your requirements. We'll be in touch within 24 hours to schedule a deep-dive session.</p>
              <div style="margin-top: 40px; padding: 20px; background: #f9f9f9; border-radius: 12px;">
                <p style="margin: 0; font-size: 14px; color: #666;">Budget Range: ${data.budgetRange}</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Target Deadline: ${data.deadline}</p>
              </div>
            </div>
          </div>
        `
			});
		} catch (e) {
			console.error("Failed to send user confirmation email", e);
		}
		try {
			await resend$1.emails.send({
				from: FROM_EMAIL,
				to: ADMIN_EMAIL,
				subject: `🚀 NEW PROJECT: ${data.projectTitle} by ${data.fullName}`,
				html: `<pre>${JSON.stringify(data, null, 2)}</pre>`
			});
		} catch (e) {
			console.error("Failed to send admin alert email", e);
		}
		return res.status(200).json({ message: "Project request submitted successfully!" });
	} catch (error) {
		console.error("Project Request Error:", error);
		return res.status(500).json({
			message: "Internal server error.",
			error: error?.message || String(error)
		});
	}
};
//#endregion
//#region server/middleware/securityMiddleware.ts
dotenv.config();
function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
	return {
		hash: crypto.pbkdf2Sync(password, salt, 1e5, 64, "sha512").toString("hex"),
		salt
	};
}
function verifyPassword(password, hash, salt) {
	const derived = crypto.pbkdf2Sync(password, salt, 1e5, 64, "sha512").toString("hex");
	return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
}
var JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
function base64UrlEncode(str) {
	return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function base64UrlDecode(str) {
	str = str.replace(/-/g, "+").replace(/_/g, "/");
	while (str.length % 4) str += "=";
	return Buffer.from(str, "base64").toString();
}
function signJwt(payload) {
	const header = {
		alg: "HS256",
		typ: "JWT"
	};
	const iat = Math.floor(Date.now() / 1e3);
	const exp = iat + 10080 * 60;
	const tokenPayload = {
		...payload,
		iat,
		exp
	};
	const encodedHeader = base64UrlEncode(JSON.stringify(header));
	const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
	return `${encodedHeader}.${encodedPayload}.${crypto.createHmac("sha256", JWT_SECRET).update(`${encodedHeader}.${encodedPayload}`).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
}
function verifyJwt(token) {
	const [headerB64, payloadB64, signatureB64] = token.split(".");
	if (!headerB64 || !payloadB64 || !signatureB64) return { valid: false };
	if (crypto.createHmac("sha256", JWT_SECRET).update(`${headerB64}.${payloadB64}`).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") !== signatureB64) return { valid: false };
	const payload = JSON.parse(base64UrlDecode(payloadB64));
	const now = Math.floor(Date.now() / 1e3);
	if (payload.exp && now > payload.exp) return { valid: false };
	return {
		valid: true,
		payload
	};
}
var rateLimiterStore = /* @__PURE__ */ new Map();
function rateLimiter(options) {
	const { windowMs, max, message = "Too many requests, please try again later." } = options;
	return (req, res, next) => {
		const ip = req.ip || req.socket?.remoteAddress || "";
		const now = Date.now();
		const record = rateLimiterStore.get(ip) ?? {
			count: 0,
			resetTime: now + windowMs
		};
		if (now > record.resetTime) {
			record.count = 0;
			record.resetTime = now + windowMs;
		}
		record.count += 1;
		rateLimiterStore.set(ip, record);
		if (record.count > max) res.status(429).json({
			error: message,
			retryAfter: Math.ceil((record.resetTime - now) / 1e3)
		});
		else next();
	};
}
function securityHeaders(_req, res, next) {
	res.setHeader("X-DNS-Prefetch-Control", "off");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
	res.setHeader("X-Download-Options", "noopen");
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
	res.setHeader("Referrer-Policy", "no-referrer");
	res.setHeader("X-XSS-Protection", "0");
	next();
}
//#endregion
//#region server/models/User.ts
var UserSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true
	},
	password: {
		type: String,
		required: true
	},
	role: {
		type: String,
		enum: ["ADMIN", "TEAM_MEMBER"],
		default: "TEAM_MEMBER"
	},
	isLocked: {
		type: Boolean,
		default: false
	},
	loginAttempts: {
		type: Number,
		default: 0
	},
	lockUntil: { type: Date },
	refreshTokens: {
		type: [String],
		default: []
	},
	passwordResetToken: { type: String },
	passwordResetExpires: { type: Date },
	googleId: { type: String },
	googleRefreshToken: { type: String },
	googleAccessToken: { type: String },
	googleTokenExpiry: { type: Date }
}, { timestamps: true });
var User_default = mongoose.models.User || mongoose.model("User", UserSchema);
//#endregion
//#region server/middleware/authMiddleware.ts
/**
* Authentication check middleware
*/
async function authenticate(req, res, next) {
	try {
		const authHeader = req.headers["authorization"];
		const token = authHeader && authHeader.split(" ")[1];
		if (!token) return res.status(401).json({ error: "Access token is missing or malformed." });
		const { valid, payload } = verifyJwt(token);
		if (!valid || !payload) return res.status(401).json({ error: "Access token is invalid or has expired." });
		req.user = {
			id: payload.id,
			email: payload.email,
			role: payload.role,
			name: payload.name
		};
		next();
	} catch (error) {
		console.error("[AuthMiddleware] Verification error:", error);
		res.status(500).json({ error: "Internal security authorization processing failure." });
	}
}
/**
* Role-Based Access Control: restricts to ADMIN only
*/
function requireAdmin(req, res, next) {
	if (!req.user) return res.status(401).json({ error: "Unauthorized access attempt." });
	if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden: Restricted to root administrator level access." });
	next();
}
//#endregion
//#region server/models/ActivityLog.ts
var ActivityLogSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	action: {
		type: String,
		required: true
	},
	details: {
		type: Schema.Types.Mixed,
		default: {}
	},
	ipAddress: { type: String },
	userAgent: { type: String },
	createdAt: {
		type: Date,
		default: Date.now
	}
});
var ActivityLog_default = mongoose.models.ActivityLog || mongoose.model("ActivityLog", ActivityLogSchema);
//#endregion
//#region server/utils/googleOAuthHelper.ts
dotenv.config();
var GoogleOAuthHelper = class {
	/**
	* Get OAuth2 client instance
	*/
	static getOAuthClient() {
		return new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
	}
	/**
	* Generate authorization URL for OAuth flow
	*/
	static generateAuthUrl() {
		return this.getOAuthClient().generateAuthUrl({
			access_type: "offline",
			scope: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
			prompt: "consent"
		});
	}
	/**
	* Exchange authorization code for tokens
	*/
	static async exchangeCodeForTokens(code) {
		const oauth2Client = this.getOAuthClient();
		try {
			const { tokens } = await oauth2Client.getToken(code);
			return tokens;
		} catch (error) {
			console.error("[GoogleOAuthHelper] Error exchanging code:", error);
			throw error;
		}
	}
	/**
	* Store Google OAuth credentials for a user
	*/
	static async storeUserGoogleCredentials(userId, tokens) {
		try {
			await User_default.findByIdAndUpdate(userId, {
				googleRefreshToken: tokens.refresh_token,
				googleAccessToken: tokens.access_token,
				googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : void 0
			});
		} catch (error) {
			console.error("[GoogleOAuthHelper] Error storing credentials:", error);
			throw error;
		}
	}
	/**
	* Get or refresh user's Google access token
	*/
	static async getUserGoogleAccessToken(userId) {
		try {
			const user = await User_default.findById(userId);
			if (!user || !user.googleRefreshToken) return null;
			if (user.googleTokenExpiry && user.googleTokenExpiry > /* @__PURE__ */ new Date()) return user.googleAccessToken;
			const oauth2Client = this.getOAuthClient();
			oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
			const { credentials } = await oauth2Client.refreshAccessToken();
			await User_default.findByIdAndUpdate(userId, {
				googleAccessToken: credentials.access_token,
				googleTokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : void 0
			});
			return credentials.access_token || null;
		} catch (error) {
			console.error("[GoogleOAuthHelper] Error getting access token:", error);
			return null;
		}
	}
	/**
	* Revoke Google OAuth access for a user
	*/
	static async revokeUserGoogleAccess(userId) {
		try {
			const user = await User_default.findById(userId);
			if (!user || !user.googleRefreshToken) return;
			await this.getOAuthClient().revokeToken(user.googleRefreshToken);
			await User_default.findByIdAndUpdate(userId, {
				googleRefreshToken: void 0,
				googleAccessToken: void 0,
				googleTokenExpiry: void 0
			});
		} catch (error) {
			console.error("[GoogleOAuthHelper] Error revoking access:", error);
		}
	}
};
//#endregion
//#region server/routes/auth.ts
var router$8 = express.Router();
var loginLimiter = rateLimiter({
	windowMs: 900 * 1e3,
	max: 10,
	message: "Too many authentication attempts. Please try again after 15 minutes."
});
/**
* Helper to record activity logs
*/
async function logActivity$5(userId, action, details, req) {
	try {
		await ActivityLog_default.create({
			userId,
			action,
			details,
			ipAddress: req.ip || req.socket?.remoteAddress,
			userAgent: req.headers["user-agent"]
		});
	} catch (err) {
		console.error("[ActivityLog] Error creating log:", err);
	}
}
/**
* POST /api/auth/login
*/
router$8.post("/login", loginLimiter, async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
		const user = await User_default.findOne({ email: email.toLowerCase().trim() });
		if (!user) {
			await logActivity$5(void 0, "LOGIN_FAILED", {
				email,
				reason: "User not found"
			}, req);
			return res.status(401).json({ error: "Invalid credentials." });
		}
		const now = /* @__PURE__ */ new Date();
		if (user.isLocked && user.lockUntil && user.lockUntil > now) {
			const waitMins = Math.ceil((user.lockUntil.getTime() - now.getTime()) / 6e4);
			await logActivity$5(user._id, "LOGIN_LOCKED", {
				email,
				reason: "Account is temporarily locked"
			}, req);
			return res.status(423).json({ error: `This account is temporarily locked due to excessive failed attempts. Please retry in ${waitMins} minute(s).` });
		}
		const parts = user.password.split(":");
		if (parts.length !== 2) {
			await logActivity$5(user._id, "LOGIN_FAILED", {
				email,
				reason: "Corrupted password format in DB"
			}, req);
			return res.status(500).json({ error: "Internal credentials profile error." });
		}
		const [hash, salt] = parts;
		if (!verifyPassword(password, hash, salt)) {
			user.loginAttempts += 1;
			if (user.loginAttempts >= 5) {
				user.isLocked = true;
				user.lockUntil = new Date(Date.now() + 900 * 1e3);
				await user.save();
				await logActivity$5(user._id, "LOGIN_LOCKED", {
					email,
					reason: "Triggered account lockout"
				}, req);
				return res.status(423).json({ error: "Account has been locked for 15 minutes due to 5 failed login attempts." });
			}
			await user.save();
			await logActivity$5(user._id, "LOGIN_FAILED", {
				email,
				reason: "Invalid password",
				attempts: user.loginAttempts
			}, req);
			return res.status(401).json({ error: "Invalid credentials." });
		}
		user.loginAttempts = 0;
		user.isLocked = false;
		user.lockUntil = void 0;
		const accessToken = signJwt({
			id: user._id.toString(),
			email: user.email,
			role: user.role,
			name: user.name
		});
		const refreshToken = crypto.randomBytes(40).toString("hex");
		if (!user.refreshTokens) user.refreshTokens = [];
		user.refreshTokens.push(refreshToken);
		if (user.refreshTokens.length > 5) user.refreshTokens.shift();
		await user.save();
		await logActivity$5(user._id, "LOGIN_SUCCESS", { email }, req);
		res.json({
			accessToken,
			refreshToken,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role
			}
		});
	} catch (error) {
		console.error("[Auth] Login error:", error);
		res.status(500).json({ error: "Internal authentication system error." });
	}
});
/**
* POST /api/auth/refresh
*/
router$8.post("/refresh", async (req, res) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) return res.status(400).json({ error: "Refresh token is required." });
		const user = await User_default.findOne({ refreshTokens: refreshToken });
		if (!user) return res.status(401).json({ error: "Refresh token is invalid or has been revoked." });
		const accessToken = signJwt({
			id: user._id.toString(),
			email: user.email,
			role: user.role,
			name: user.name
		});
		res.json({ accessToken });
	} catch (error) {
		console.error("[Auth] Refresh token error:", error);
		res.status(500).json({ error: "Internal refresh validation error." });
	}
});
/**
* POST /api/auth/logout
*/
router$8.post("/logout", async (req, res) => {
	try {
		const { refreshToken } = req.body;
		if (refreshToken) {
			const user = await User_default.findOne({ refreshTokens: refreshToken });
			if (user) {
				user.refreshTokens = user.refreshTokens?.filter((t) => t !== refreshToken) || [];
				await user.save();
				await logActivity$5(user._id, "LOGOUT", { tokenRevoked: true }, req);
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
router$8.get("/me", authenticate, async (req, res) => {
	try {
		const user = await User_default.findById(req.user?.id).select("-password -refreshTokens");
		if (!user) return res.status(404).json({ error: "Authorized profile session not found in active database." });
		res.json({ user });
	} catch (error) {
		console.error("[Auth] Me error:", error);
		res.status(500).json({ error: "Internal session identity loading failure." });
	}
});
/**
* POST /api/auth/forgot-password
*/
router$8.post("/forgot-password", async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) return res.status(400).json({ error: "Email is required." });
		const user = await User_default.findOne({ email: email.toLowerCase().trim() });
		if (!user) return res.json({ message: "If an account with that email exists, a password reset link has been dispatched." });
		const resetToken = crypto.randomBytes(32).toString("hex");
		user.passwordResetToken = resetToken;
		user.passwordResetExpires = new Date(Date.now() + 3600 * 1e3);
		await user.save();
		const resetLink = `https://thedevdale.com/admin/reset-password?token=${resetToken}`;
		const htmlContent = `
      <h3>Request to Reset Password</h3>
      <p>Hello ${user.name},</p>
      <p>You are receiving this automated email because you (or someone else) requested a security credential reset for your DevDale Agency OS portal access.</p>
      <p>Please click the button below within the next hour to complete the password reset procedure:</p>
      <p><a href="${resetLink}" style="display:inline-block; background-color:#000; color:#fff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold;" target="_blank">Reset Security Password</a></p>
      <p>If you did not request this change, please ignore this communication and audit your credentials immediately.</p>
    `;
		if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("mock")) await new (await (import("resend"))).Resend(process.env.RESEND_API_KEY).emails.send({
			from: `DevDale Security <${process.env.FROM_EMAIL || "hello@thedevdale.com"}>`,
			to: user.email,
			subject: "[Agency OS] Password Reset Authentication Protocol",
			html: htmlContent
		});
		else console.log(`[Auth] [PASSWORD RESET MOCK LINK]: ${resetLink}`);
		await logActivity$5(user._id, "PASSWORD_RESET_REQUEST", { email: user.email }, req);
		res.json({ message: "If an account with that email exists, a password reset link has been dispatched." });
	} catch (error) {
		console.error("[Auth] Forgot password error:", error);
		res.status(500).json({ error: "Internal reset request pipeline error." });
	}
});
/**
* POST /api/auth/reset-password
*/
router$8.post("/reset-password", async (req, res) => {
	try {
		const { token, newPassword } = req.body;
		if (!token || !newPassword) return res.status(400).json({ error: "Token and new password are required." });
		const user = await User_default.findOne({
			passwordResetToken: token,
			passwordResetExpires: { $gt: /* @__PURE__ */ new Date() }
		});
		if (!user) return res.status(400).json({ error: "Reset token is invalid or has expired." });
		const { hash, salt } = hashPassword(newPassword);
		user.password = `${hash}:${salt}`;
		user.passwordResetToken = void 0;
		user.passwordResetExpires = void 0;
		user.refreshTokens = [];
		await user.save();
		await logActivity$5(user._id, "PASSWORD_RESET_SUCCESS", { email: user.email }, req);
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
router$8.get("/google/url", (req, res) => {
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
router$8.get("/google/callback", async (req, res) => {
	try {
		const { code, state } = req.query;
		if (!code) return res.status(400).json({ error: "Authorization code is missing" });
		const tokens = await GoogleOAuthHelper.exchangeCodeForTokens(code);
		if (!tokens.refresh_token) {
			console.warn("[Auth] No refresh token received. This may happen if the user previously authorized the app.");
			return res.status(400).json({
				error: "Failed to obtain refresh token. Please revoke app access and try again.",
				hint: "Go to https://myaccount.google.com/permissions and remove 'DevDale' access."
			});
		}
		console.log("\n✅ Google OAuth Token Exchange Successful!\n");
		console.log("🔐 Refresh Token:", tokens.refresh_token);
		console.log("\nAdd this to your .env file:");
		console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"\n`);
		if (req.query.userId) {
			const userId = req.query.userId;
			await GoogleOAuthHelper.storeUserGoogleCredentials(userId, tokens);
			await logActivity$5(userId, "GOOGLE_OAUTH_CONNECTED", { email: tokens.email }, req);
		}
		res.json({
			success: true,
			message: "Google OAuth tokens received successfully",
			refreshToken: tokens.refresh_token,
			accessToken: tokens.access_token,
			expiryDate: tokens.expiry_date
		});
	} catch (error) {
		console.error("[Auth] Google callback error:", error);
		await logActivity$5(void 0, "GOOGLE_OAUTH_ERROR", { error: String(error) }, req);
		res.status(500).json({ error: "Failed to complete Google OAuth flow" });
	}
});
/**
* POST /api/auth/google/disconnect
* Disconnect Google OAuth from user account (protected route)
*/
router$8.post("/google/disconnect", authenticate, async (req, res) => {
	try {
		const userId = req.user.id;
		await GoogleOAuthHelper.revokeUserGoogleAccess(userId);
		await logActivity$5(userId, "GOOGLE_OAUTH_DISCONNECTED", {}, req);
		res.json({ message: "Google account has been disconnected" });
	} catch (error) {
		console.error("[Auth] Google disconnect error:", error);
		res.status(500).json({ error: "Failed to disconnect Google account" });
	}
});
//#endregion
//#region server/models/Booking.ts
var BookingSchema = new Schema({
	serviceId: {
		type: Schema.Types.ObjectId,
		ref: "Service",
		required: true
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	customerName: {
		type: String,
		required: true
	},
	customerEmail: {
		type: String,
		required: true,
		lowercase: true,
		trim: true
	},
	customerCompany: { type: String },
	budgetRange: { type: String },
	projectType: { type: String },
	notes: { type: String },
	date: {
		type: Date,
		required: true
	},
	timeSlot: {
		type: String,
		required: true
	},
	status: {
		type: String,
		enum: [
			"Pending",
			"Confirmed",
			"Completed",
			"Cancelled",
			"Rescheduled",
			"No Show"
		],
		default: "Pending"
	},
	googleEventId: { type: String },
	googleMeetLink: { type: String },
	googleCalendarLink: { type: String },
	googleCalendarEventId: { type: String },
	duration: {
		type: Number,
		default: 60
	},
	cancellationReason: { type: String },
	rescheduleReason: { type: String },
	utmSource: { type: String },
	utmMedium: { type: String },
	utmCampaign: { type: String }
}, { timestamps: true });
var Booking_default = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
//#endregion
//#region server/models/Service.ts
var ServiceSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	slug: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true
	},
	duration: {
		type: Number,
		required: true
	},
	description: { type: String },
	price: { type: Number },
	meetingType: {
		type: String,
		enum: [
			"Google Meet",
			"Phone",
			"In Person"
		],
		default: "Google Meet"
	},
	colorTag: {
		type: String,
		default: "emerald"
	},
	bufferTime: {
		type: Number,
		default: 15
	},
	isEnabled: {
		type: Boolean,
		default: true
	}
}, { timestamps: true });
var Service_default = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
//#endregion
//#region server/models/Notification.ts
var NotificationSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	title: {
		type: String,
		required: true
	},
	message: {
		type: String,
		required: true
	},
	type: {
		type: String,
		enum: [
			"BOOKING_NEW",
			"BOOKING_CANCELLED",
			"LEAD_NEW",
			"SYSTEM"
		],
		required: true
	},
	isRead: {
		type: Boolean,
		default: false
	}
}, { timestamps: true });
var Notification_default = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
//#endregion
//#region server/models/Availability.ts
var TimeSlotSchema = new Schema({
	start: {
		type: String,
		required: true
	},
	end: {
		type: String,
		required: true
	}
}, { _id: false });
var WorkingDaySchema = new Schema({
	day: {
		type: Number,
		required: true,
		min: 0,
		max: 6
	},
	slots: {
		type: [TimeSlotSchema],
		default: []
	}
}, { _id: false });
var AvailabilitySchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	timezone: {
		type: String,
		default: "UTC"
	},
	workingDays: {
		type: [WorkingDaySchema],
		default: [
			{
				day: 1,
				slots: [{
					start: "09:00",
					end: "17:00"
				}]
			},
			{
				day: 2,
				slots: [{
					start: "09:00",
					end: "17:00"
				}]
			},
			{
				day: 3,
				slots: [{
					start: "09:00",
					end: "17:00"
				}]
			},
			{
				day: 4,
				slots: [{
					start: "09:00",
					end: "17:00"
				}]
			},
			{
				day: 5,
				slots: [{
					start: "09:00",
					end: "17:00"
				}]
			}
		]
	},
	bookingLimitsPerDay: {
		type: Number,
		default: 6
	}
}, { timestamps: true });
var Availability_default = mongoose.models.Availability || mongoose.model("Availability", AvailabilitySchema);
//#endregion
//#region server/models/BlockedDate.ts
var BlockedDateSchema = new Schema({
	date: {
		type: Date,
		required: true
	},
	reason: { type: String },
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	isGlobal: {
		type: Boolean,
		default: true
	}
}, { timestamps: true });
var BlockedDate_default = mongoose.models.BlockedDate || mongoose.model("BlockedDate", BlockedDateSchema);
//#endregion
//#region server/services/calendarService.ts
dotenv.config();
var CalendarService = class {
	/** Cache the access token and its expiry so we don't refresh on every call */
	static cachedAccessToken = null;
	static tokenExpiresAt = 0;
	/**
	* Are Google Calendar credentials fully configured?
	*/
	static get isConfigured() {
		return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);
	}
	/**
	* Refreshes OAuth2 access token using the refresh token.
	* Tokens are cached in-memory and re-used until 60s before expiry.
	*/
	static async getAccessToken() {
		const clientId = process.env.GOOGLE_CLIENT_ID;
		const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
		const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
		if (!clientId || !clientSecret || !refreshToken) return null;
		if (this.cachedAccessToken && Date.now() < this.tokenExpiresAt - 6e4) return this.cachedAccessToken;
		try {
			const response = await fetch("https://oauth2.googleapis.com/token", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: new URLSearchParams({
					client_id: clientId,
					client_secret: clientSecret,
					refresh_token: refreshToken,
					grant_type: "refresh_token"
				})
			});
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error("[CalendarService] Failed to refresh access token:", JSON.stringify(errorData));
				this.cachedAccessToken = null;
				return null;
			}
			const data = await response.json();
			this.cachedAccessToken = data.access_token;
			this.tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1e3;
			console.log("[CalendarService] Access token refreshed successfully.");
			return this.cachedAccessToken;
		} catch (error) {
			console.error("[CalendarService] Error fetching access token:", error);
			this.cachedAccessToken = null;
			return null;
		}
	}
	/**
	* Creates a Google Calendar event with a real Google Meet link
	* and sends invitations to attendees.
	* Falls back to a mock event when credentials are missing or the API fails.
	*/
	static async createEvent(input) {
		if (!this.isConfigured) {
			console.log("[CalendarService] Google credentials not configured. Using mock generator.");
			return this.generateMockEvent(input);
		}
		const accessToken = await this.getAccessToken();
		if (!accessToken) {
			console.warn("[CalendarService] Could not obtain access token. Using mock generator.");
			return this.generateMockEvent(input);
		}
		try {
			const eventBody = {
				summary: input.summary,
				description: input.description,
				start: {
					dateTime: input.startDateTime,
					timeZone: "UTC"
				},
				end: {
					dateTime: input.endDateTime,
					timeZone: "UTC"
				},
				attendees: [{
					email: input.attendeeEmail,
					displayName: input.attendeeName
				}],
				conferenceData: { createRequest: {
					requestId: `devdale-meet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
					conferenceSolutionKey: { type: "hangoutsMeet" }
				} },
				reminders: {
					useDefault: false,
					overrides: [{
						method: "email",
						minutes: 60
					}, {
						method: "popup",
						minutes: 15
					}]
				}
			};
			const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(eventBody)
			});
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error("[CalendarService] Google Calendar event creation failed:", JSON.stringify(errorData));
				console.warn("[CalendarService] Falling back to mock event.");
				return this.generateMockEvent(input);
			}
			const data = await response.json();
			let meetLink = "";
			if (data.conferenceData?.entryPoints) {
				const videoEntry = data.conferenceData.entryPoints.find((ep) => ep.entryPointType === "video");
				if (videoEntry) meetLink = videoEntry.uri;
			}
			if (!meetLink && data.hangoutLink) meetLink = data.hangoutLink;
			if (!meetLink) {
				meetLink = `https://meet.google.com/dev-${this.randomString(3)}-${this.randomString(4)}-${this.randomString(3)}`;
				console.warn("[CalendarService] Event created but no Meet link returned. Using generated link.");
			}
			console.log(`[CalendarService] ✅ Calendar event created: ${data.id}`);
			console.log(`[CalendarService] ✅ Google Meet link: ${meetLink}`);
			console.log(`[CalendarService] ✅ Invitation sent to: ${input.attendeeEmail}`);
			return {
				googleEventId: data.id,
				googleMeetLink: meetLink,
				isReal: true
			};
		} catch (error) {
			console.error("[CalendarService] Google Calendar API error. Falling back to mock:", error);
			return this.generateMockEvent(input);
		}
	}
	/**
	* Queries Google Calendar's freeBusy API for the host's primary calendar.
	* Returns busy time blocks that the availability engine uses to prevent conflicts.
	*/
	static async getBusySlots(startISO, endISO) {
		if (!this.isConfigured) return [];
		const accessToken = await this.getAccessToken();
		if (!accessToken) return [];
		try {
			const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					timeMin: startISO,
					timeMax: endISO,
					items: [{ id: "primary" }]
				})
			});
			if (!response.ok) {
				const errorText = await response.text();
				console.warn("[CalendarService] Google FreeBusy query failed:", errorText);
				return [];
			}
			const busy = (await response.json()).calendars?.primary?.busy || [];
			console.log(`[CalendarService] FreeBusy check: ${busy.length} busy block(s) found for ${startISO.split("T")[0]}`);
			return busy.map((b) => ({
				start: b.start,
				end: b.end
			}));
		} catch (error) {
			console.error("[CalendarService] Error fetching freebusy info:", error);
			return [];
		}
	}
	/**
	* Deletes a Google Calendar event. Sends cancellation notifications to attendees.
	*/
	static async deleteEvent(eventId) {
		if (eventId.startsWith("mock-")) {
			console.log("[CalendarService] Mock event deleted:", eventId);
			return true;
		}
		if (!this.isConfigured) return false;
		const accessToken = await this.getAccessToken();
		if (!accessToken) return false;
		try {
			const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${accessToken}` }
			});
			if (response.ok || response.status === 204) {
				console.log(`[CalendarService] ✅ Calendar event deleted: ${eventId}`);
				return true;
			}
			console.warn(`[CalendarService] Event deletion returned status ${response.status}`);
			return false;
		} catch (error) {
			console.error("[CalendarService] Error deleting event:", error);
			return false;
		}
	}
	/**
	* Updates an existing Google Calendar event with new times.
	* Preserves the Meet link and sends update notifications to attendees.
	*/
	static async updateEvent(eventId, input) {
		if (eventId.startsWith("mock-")) return this.generateMockEvent(input);
		if (!this.isConfigured) return this.generateMockEvent(input);
		const accessToken = await this.getAccessToken();
		if (!accessToken) return this.generateMockEvent(input);
		try {
			const patchBody = {
				summary: input.summary,
				description: input.description,
				start: {
					dateTime: input.startDateTime,
					timeZone: "UTC"
				},
				end: {
					dateTime: input.endDateTime,
					timeZone: "UTC"
				},
				attendees: [{
					email: input.attendeeEmail,
					displayName: input.attendeeName
				}]
			};
			const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`, {
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(patchBody)
			});
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error("[CalendarService] Event update failed:", JSON.stringify(errorData));
				return this.generateMockEvent(input);
			}
			const data = await response.json();
			let meetLink = "";
			if (data.conferenceData?.entryPoints) {
				const videoEntry = data.conferenceData.entryPoints.find((ep) => ep.entryPointType === "video");
				if (videoEntry) meetLink = videoEntry.uri;
			}
			if (!meetLink && data.hangoutLink) meetLink = data.hangoutLink;
			if (!meetLink) meetLink = `https://meet.google.com/dev-${this.randomString(3)}-${this.randomString(4)}-${this.randomString(3)}`;
			console.log(`[CalendarService] ✅ Calendar event updated: ${data.id}`);
			return {
				googleEventId: data.id,
				googleMeetLink: meetLink,
				isReal: true
			};
		} catch (error) {
			console.error("[CalendarService] Event update error. Falling back to mock:", error);
			return this.generateMockEvent(input);
		}
	}
	static generateMockEvent(input) {
		const mockId = `mock-ev-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
		const mockMeet = `https://meet.google.com/dd-${this.randomString(3)}-${this.randomString(4)}-${this.randomString(3)}`;
		console.log("[CalendarService] Generated mock meeting details:", {
			mockId,
			mockMeet
		});
		return {
			googleEventId: mockId,
			googleMeetLink: mockMeet,
			isReal: false
		};
	}
	static randomString(length) {
		const chars = "abcdefghijklmnopqrstuvwxyz";
		let str = "";
		for (let i = 0; i < length; i++) str += chars.charAt(Math.floor(Math.random() * 26));
		return str;
	}
};
//#endregion
//#region server/services/availabilityEngine.ts
/**
* Normalizes a date to YYYY-MM-DD at 00:00:00 UTC
*/
function normalizeToUTCDate(dateInput) {
	const d = new Date(dateInput);
	return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}
/**
* Parses "HH:MM" into minutes from start of day
*/
function parseTimeToMinutes(timeStr) {
	const [hours, minutes] = timeStr.split(":").map(Number);
	return hours * 60 + minutes;
}
/**
* Formats minutes from start of day into "HH:MM"
*/
function formatMinutesToTime(minutes) {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}
/**
* Checks if two time ranges [start1, end1] and [start2, end2] overlap
*/
function rangesOverlap(start1, end1, start2, end2) {
	return start1 < end2 && start2 < end1;
}
/**
* Dynamic Availability Engine
*/
var AvailabilityEngine = class {
	/**
	* Generates available time slots for a given service, date, and user timezone
	* @param service The Service model object
	* @param dateStr The date string (YYYY-MM-DD)
	* @param clientTimezone Timezone of the client (e.g. "America/New_York")
	* @param hostUserId Optional host/team member user ID. If null, queries the default/first available host
	*/
	static async getAvailableSlots(service, dateStr, clientTimezone = "UTC", hostUserId) {
		const targetDate = /* @__PURE__ */ new Date(`${dateStr}T00:00:00Z`);
		const normalizedDate = normalizeToUTCDate(targetDate);
		let targetHostId = null;
		if (hostUserId) targetHostId = new mongoose.Types.ObjectId(hostUserId);
		else {
			const defaultAvail = await Availability_default.findOne();
			if (defaultAvail) targetHostId = defaultAvail.userId;
		}
		if (!targetHostId) return [];
		const queryBlocked = { date: normalizedDate };
		if (targetHostId) queryBlocked.$or = [{ isGlobal: true }, { userId: targetHostId }];
		else queryBlocked.isGlobal = true;
		if (await BlockedDate_default.findOne(queryBlocked)) return [];
		const availability = await Availability_default.findOne({ userId: targetHostId });
		if (!availability) return [];
		const dayOfWeek = targetDate.getUTCDay();
		const hostSchedule = availability.workingDays.find((wd) => wd.day === dayOfWeek);
		if (!hostSchedule || !hostSchedule.slots || hostSchedule.slots.length === 0) return [];
		const existingBookings = await Booking_default.find({
			userId: targetHostId,
			date: normalizedDate,
			status: { $in: [
				"Pending",
				"Confirmed",
				"Rescheduled"
			] }
		}).populate("serviceId");
		if (availability.bookingLimitsPerDay && existingBookings.length >= availability.bookingLimitsPerDay) return [];
		const bookedBlocks = existingBookings.map((booking) => {
			const startMin = parseTimeToMinutes(booking.timeSlot);
			const duration = booking.serviceId?.duration || 30;
			const buffer = booking.serviceId?.bufferTime || 15;
			return {
				start: startMin,
				end: startMin + duration,
				buffer,
				occupiedStart: startMin - buffer,
				occupiedEnd: startMin + duration + buffer
			};
		});
		try {
			const timeMin = normalizedDate.toISOString();
			const timeMax = new Date(normalizedDate.getTime() + 1440 * 60 * 1e3).toISOString();
			const googleBusySlots = await CalendarService.getBusySlots(timeMin, timeMax);
			const targetMidnight = normalizedDate.getTime();
			const dayLengthMs = 1440 * 60 * 1e3;
			for (const busy of googleBusySlots) {
				const busyStart = new Date(busy.start).getTime();
				const busyEnd = new Date(busy.end).getTime();
				const overlapStart = Math.max(busyStart, targetMidnight);
				const overlapEnd = Math.min(busyEnd, targetMidnight + dayLengthMs);
				if (overlapStart < overlapEnd) {
					const startMin = Math.floor((overlapStart - targetMidnight) / (60 * 1e3));
					const endMin = Math.ceil((overlapEnd - targetMidnight) / (60 * 1e3));
					bookedBlocks.push({
						start: startMin,
						end: endMin,
						buffer: 0,
						occupiedStart: startMin,
						occupiedEnd: endMin
					});
				}
			}
		} catch (gcalErr) {
			console.error("[AvailabilityEngine] Google FreeBusy check failed (non-blocking fallback):", gcalErr);
		}
		const slots = [];
		const serviceDuration = service.duration;
		const serviceBuffer = service.bufferTime;
		for (const window of hostSchedule.slots) {
			const windowStartMin = parseTimeToMinutes(window.start);
			const windowEndMin = parseTimeToMinutes(window.end);
			let currentSlotStart = windowStartMin;
			while (currentSlotStart + serviceDuration <= windowEndMin) {
				const currentSlotEnd = currentSlotStart + serviceDuration;
				const proposedStart = currentSlotStart;
				const proposedEnd = currentSlotEnd;
				let isOverlapping = false;
				for (const block of bookedBlocks) {
					const newSlotRequiredEnd = proposedEnd + serviceBuffer;
					const bookedRequiredEnd = block.end + block.buffer;
					if (rangesOverlap(proposedStart, newSlotRequiredEnd, block.start, bookedRequiredEnd)) {
						isOverlapping = true;
						break;
					}
				}
				let isPast = false;
				const now = /* @__PURE__ */ new Date();
				const slotDate = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), Math.floor(proposedStart / 60), proposedStart % 60, 0, 0));
				const minBookingTime = new Date(now.getTime() + 3600 * 1e3);
				if (slotDate.getTime() < minBookingTime.getTime()) isPast = true;
				const slotTimeStr = formatMinutesToTime(proposedStart);
				slots.push({
					time: slotTimeStr,
					dateTime: slotDate.toISOString(),
					available: !isOverlapping && !isPast
				});
				currentSlotStart += 30;
			}
		}
		return slots;
	}
};
//#endregion
//#region server/services/emailService.ts
dotenv.config();
var resend = new Resend(process.env.RESEND_API_KEY || "mock_key");
var FROM_EMAIL = process.env.FROM_EMAIL || "hello@thedevdale.com";
var ADMIN_EMAIL = process.env.ADMIN_EMAIL || "devdaleagency@gmail.com";
var EmailService = class {
	/**
	* General-purpose send mail function. Gracefully logs and returns boolean representing outcome.
	*/
	static async sendEmail({ to, subject, html }) {
		if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("mock")) {
			console.log(`[EmailService] [MOCK SEND] To: ${to} | Subject: ${subject}`);
			return true;
		}
		try {
			const response = await resend.emails.send({
				from: `DevDale Agency <${FROM_EMAIL}>`,
				to,
				subject,
				html
			});
			if (response.error) {
				console.error("[EmailService] Resend API Error:", response.error);
				return false;
			}
			console.log(`[EmailService] Email sent successfully to ${to}. ID: ${response.data?.id}`);
			return true;
		} catch (error) {
			console.error("[EmailService] Exception during email send:", error);
			return false;
		}
	}
	/**
	* Premium monochrome wrapper template (inspired by Linear & Stripe)
	*/
	static wrapTemplate(title, innerHtml) {
		return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #fcfcfc;
            color: #111111;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            box-sizing: border-box;
          }
          .container {
            background-color: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            padding: 32px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          }
          .header {
            margin-bottom: 32px;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 20px;
          }
          .logo {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.03em;
            color: #000000;
            text-decoration: none;
            display: inline-block;
          }
          .title {
            font-size: 22px;
            font-weight: 600;
            letter-spacing: -0.02em;
            margin-top: 16px;
            margin-bottom: 8px;
            color: #111111;
          }
          .content {
            font-size: 15px;
            line-height: 1.6;
            color: #444444;
          }
          .meta-box {
            background-color: #f7f7f7;
            border: 1px solid #ececec;
            border-radius: 6px;
            padding: 20px;
            margin: 24px 0;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .meta-row:last-child {
            margin-bottom: 0;
          }
          .meta-label {
            font-weight: 500;
            color: #666666;
            width: 120px;
          }
          .meta-value {
            color: #111111;
            font-weight: 600;
            text-align: right;
            flex-grow: 1;
          }
          .button {
            display: inline-block;
            background-color: #000000;
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 500;
            font-size: 14px;
            padding: 12px 24px;
            border-radius: 6px;
            margin-top: 16px;
            text-align: center;
            letter-spacing: -0.01em;
            transition: background-color 0.2s ease;
          }
          .button:hover {
            background-color: #222222;
          }
          .footer {
            margin-top: 32px;
            font-size: 12px;
            color: #888888;
            border-top: 1px solid #f0f0f0;
            padding-top: 20px;
            line-height: 1.5;
          }
          .signature {
            font-weight: 600;
            color: #222222;
            margin-bottom: 4px;
          }
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #000000;
              color: #f3f4f6;
            }
            .container {
              background-color: #0a0a0a;
              border-color: #1f1f1f;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            }
            .header {
              border-bottom-color: #1a1a1a;
            }
            .logo {
              color: #ffffff;
            }
            .title {
              color: #ffffff;
            }
            .content {
              color: #a1a1aa;
            }
            .meta-box {
              background-color: #121212;
              border-color: #1c1c1e;
            }
            .meta-label {
              color: #a1a1aa;
            }
            .meta-value {
              color: #ffffff;
            }
            .button {
              background-color: #ffffff;
              color: #000000 !important;
            }
            .button:hover {
              background-color: #e4e4e7;
            }
            .footer {
              border-top-color: #1a1a1a;
              color: #71717a;
            }
            .signature {
              color: #e4e4e7;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <a href="https://thedevdale.com" class="logo">DEVDALE</a>
            </div>
            <div class="content">
              ${innerHtml}
            </div>
            <div class="footer">
              <div class="signature">DevDale Agency OS</div>
              <div>Delivering elite engineering, designs, and growth.</div>
              <div>This is an automated operational transmission. Please do not reply directly.</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
	}
	/**
	* Customer booking confirmation
	*/
	static async sendBookingConfirmation(booking, service) {
		const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			timeZone: "UTC"
		});
		const innerHtml = `
      <div class="title">Booking Confirmed</div>
      <p>Hello ${booking.customerName},</p>
      <p>Your session with DevDale has been officially scheduled. A calendar event containing meeting access coordinates has been provisioned.</p>
      
      <div class="meta-box">
        <div class="meta-row">
          <div class="meta-label">Service</div>
          <div class="meta-value">${service.name}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Date</div>
          <div class="meta-value">${formattedDate}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Time</div>
          <div class="meta-value">${booking.timeSlot} (Host Local)</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Duration</div>
          <div class="meta-value">${service.duration} mins</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Format</div>
          <div class="meta-value">${service.meetingType}</div>
        </div>
      </div>

      <p>To join the virtual briefing, use the secure link below:</p>
      <a href="${booking.googleMeetLink}" class="button" target="_blank">Join Meeting</a>

      <p style="margin-top: 24px;">Need to reschedule or cancel? Log in to your booking interface or click your calendar invitation details.</p>
    `;
		const html = this.wrapTemplate("Booking Confirmed — DevDale", innerHtml);
		const sentCustomer = await this.sendEmail({
			to: booking.customerEmail,
			subject: `Confirmed: ${service.name} with DevDale`,
			html
		});
		await this.sendAdminBookingNotification(booking, service, "NEW");
		return sentCustomer;
	}
	/**
	* Reschedule notification
	*/
	static async sendBookingRescheduled(booking, service, oldDetails) {
		const formattedNewDate = new Date(booking.date).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			timeZone: "UTC"
		});
		const formattedOldDate = new Date(oldDetails.date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			timeZone: "UTC"
		});
		const innerHtml = `
      <div class="title">Meeting Rescheduled</div>
      <p>Hello ${booking.customerName},</p>
      <p>Your appointment has been successfully updated. The previous block has been released and a new calendar slot has been provisioned.</p>
      
      <div class="meta-box">
        <div class="meta-row">
          <div class="meta-label">Service</div>
          <div class="meta-value">${service.name}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Old Schedule</div>
          <div class="meta-value" style="text-decoration: line-through; color: #a1a1aa;">${formattedOldDate} at ${oldDetails.timeSlot}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">New Date</div>
          <div class="meta-value">${formattedNewDate}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">New Time</div>
          <div class="meta-value">${booking.timeSlot} (Host Local)</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Reason</div>
          <div class="meta-value">${booking.rescheduleReason || "Requested change"}</div>
        </div>
      </div>

      <p>Your secure virtual connection remains active. Access meeting coordinates below:</p>
      <a href="${booking.googleMeetLink}" class="button" target="_blank">Join Meeting</a>
    `;
		const html = this.wrapTemplate("Meeting Rescheduled — DevDale", innerHtml);
		const sentCustomer = await this.sendEmail({
			to: booking.customerEmail,
			subject: `Rescheduled: ${service.name} with DevDale`,
			html
		});
		await this.sendAdminBookingNotification(booking, service, "RESCHEDULED", oldDetails);
		return sentCustomer;
	}
	/**
	* Cancellation notification
	*/
	static async sendBookingCancelled(booking, service) {
		const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			timeZone: "UTC"
		});
		const innerHtml = `
      <div class="title">Booking Cancelled</div>
      <p>Hello ${booking.customerName},</p>
      <p>Your booking with DevDale has been cancelled. The reserved slot has been released back into the availability pool.</p>
      
      <div class="meta-box">
        <div class="meta-row">
          <div class="meta-label">Service</div>
          <div class="meta-value">${service.name}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Original Date</div>
          <div class="meta-value">${formattedDate}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Original Time</div>
          <div class="meta-value">${booking.timeSlot}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Reason</div>
          <div class="meta-value">${booking.cancellationReason || "No reason specified"}</div>
        </div>
      </div>

      <p>If you'd like to select a new date or book another session, please visit our booking portal.</p>
      <a href="https://thedevdale.com/book" class="button">Book New Session</a>
    `;
		const html = this.wrapTemplate("Booking Cancelled — DevDale", innerHtml);
		const sentCustomer = await this.sendEmail({
			to: booking.customerEmail,
			subject: `Cancelled: ${service.name} with DevDale`,
			html
		});
		await this.sendAdminBookingNotification(booking, service, "CANCELLED");
		return sentCustomer;
	}
	/**
	* Admin booking updates
	*/
	static async sendAdminBookingNotification(booking, service, type, oldDetails) {
		const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			timeZone: "UTC"
		});
		let subject = `[Agency OS] Booking ${type}: ${booking.customerName} - ${service.name}`;
		let messageBody = "";
		if (type === "NEW") messageBody = `
        <div class="title">New Client Booking</div>
        <p>A new briefing has been scheduled through the booking module.</p>
        
        <div class="meta-box">
          <div class="meta-row">
            <div class="meta-label">Client</div>
            <div class="meta-value">${booking.customerName} (${booking.customerEmail})</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Company</div>
            <div class="meta-value">${booking.customerCompany || "Not specified"}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Service</div>
            <div class="meta-value">${service.name}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Schedule</div>
            <div class="meta-value">${formattedDate} at ${booking.timeSlot}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Budget</div>
            <div class="meta-value">${booking.budgetRange || "Not specified"}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Project Type</div>
            <div class="meta-value">${booking.projectType || "Not specified"}</div>
          </div>
        </div>
        <p><strong>Client Notes:</strong> ${booking.notes || "None"}</p>
        <a href="https://thedevdale.com/admin/bookings" class="button">Manage Booking</a>
      `;
		else if (type === "RESCHEDULED" && oldDetails) {
			const formattedOldDate = new Date(oldDetails.date).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
				timeZone: "UTC"
			});
			messageBody = `
        <div class="title">Booking Rescheduled</div>
        <p>Client ${booking.customerName} has rescheduled their session.</p>
        
        <div class="meta-box">
          <div class="meta-row">
            <div class="meta-label">Client</div>
            <div class="meta-value">${booking.customerName}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Service</div>
            <div class="meta-value">${service.name}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Previous Time</div>
            <div class="meta-value">${formattedOldDate} at ${oldDetails.timeSlot}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">New Time</div>
            <div class="meta-value">${formattedDate} at ${booking.timeSlot}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Reason</div>
            <div class="meta-value">${booking.rescheduleReason || "Not specified"}</div>
          </div>
        </div>
        <a href="https://thedevdale.com/admin/bookings" class="button">Manage Booking</a>
      `;
		} else messageBody = `
        <div class="title">Booking Cancelled</div>
        <p>A scheduled meeting was cancelled by the client.</p>
        
        <div class="meta-box">
          <div class="meta-row">
            <div class="meta-label">Client</div>
            <div class="meta-value">${booking.customerName} (${booking.customerEmail})</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Service</div>
            <div class="meta-value">${service.name}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Cancelled Date</div>
            <div class="meta-value">${formattedDate} at ${booking.timeSlot}</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Reason</div>
            <div class="meta-value">${booking.cancellationReason || "Not specified"}</div>
          </div>
        </div>
        <a href="https://thedevdale.com/admin/bookings" class="button">View Bookings Dashboard</a>
      `;
		const html = this.wrapTemplate(subject, messageBody);
		return this.sendEmail({
			to: ADMIN_EMAIL,
			subject,
			html
		});
	}
	/**
	* New CRM Lead Notification
	*/
	static async sendNewLeadNotification(lead) {
		const subject = `[Agency OS CRM] New Enterprise Lead: ${lead.name} (${lead.company || "No Company"})`;
		const innerHtml = `
      <div class="title">New Lead Captured</div>
      <p>A new prospect has submitted details on the DevDale portal. The profile has been registered in the CRM pipeline.</p>
      
      <div class="meta-box">
        <div class="meta-row">
          <div class="meta-label">Prospect Name</div>
          <div class="meta-value">${lead.name}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Email Address</div>
          <div class="meta-value">${lead.email}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Company</div>
          <div class="meta-value">${lead.company || "Not specified"}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Budget</div>
          <div class="meta-value">${lead.budgetRange || "Not specified"}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Project Type</div>
          <div class="meta-value">${lead.projectType || "Not specified"}</div>
        </div>
        <div class="meta-row">
          <div class="meta-label">Lead Score</div>
          <div class="meta-value">${lead.score} / 100</div>
        </div>
      </div>

      <p><strong>Message Context:</strong></p>
      <blockquote style="border-left: 3px solid #000000; padding-left: 12px; margin-left: 0; color: #555555; font-style: italic;">
        ${lead.message}
      </blockquote>

      <p style="margin-top: 24px;">Assign a team member and score this lead immediately via the Agency CRM module.</p>
      <a href="https://thedevdale.com/admin/leads" class="button">Launch CRM Interface</a>
    `;
		const html = this.wrapTemplate(subject, innerHtml);
		return this.sendEmail({
			to: ADMIN_EMAIL,
			subject,
			html
		});
	}
};
//#endregion
//#region server/routes/bookings.ts
var router$7 = express.Router();
/**
* Helper to record activity logs
*/
async function logActivity$4(userId, action, details, req) {
	try {
		await ActivityLog_default.create({
			userId,
			action,
			details,
			ipAddress: req.ip || req.socket?.remoteAddress,
			userAgent: req.headers["user-agent"]
		});
	} catch (err) {
		console.error("[ActivityLog] Error:", err);
	}
}
/**
* Helper to trigger real-time notifications for admins
*/
async function createNotification(title, message, type) {
	try {
		await Notification_default.create({
			title,
			message,
			type
		});
	} catch (err) {
		console.error("[Notification] Error:", err);
	}
}
/**
* Helper: Build Google Calendar event times from date + timeSlot + duration
*/
function buildEventTimes(dateStr, timeSlot, durationMinutes) {
	const targetDate = /* @__PURE__ */ new Date(`${dateStr}T00:00:00Z`);
	const startHour = parseInt(timeSlot.split(":")[0], 10);
	const startMin = parseInt(timeSlot.split(":")[1], 10);
	const startDateTime = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), startHour, startMin, 0));
	return {
		targetDate,
		startDateTime,
		endDateTime: new Date(startDateTime.getTime() + durationMinutes * 60 * 1e3)
	};
}
/**
* GET /api/bookings (Admin Protected)
* Supports filters: status, search (name/email/company), date range, pagination
*/
router$7.get("/", authenticate, async (req, res) => {
	try {
		const { status, search, startDate, endDate, page = "1", limit = "10" } = req.query;
		const query = {};
		if (req.user?.role === "TEAM_MEMBER") query.userId = new mongoose.Types.ObjectId(req.user.id);
		if (status) query.status = status;
		if (search) {
			const searchRegex = new RegExp(search, "i");
			query.$or = [
				{ customerName: searchRegex },
				{ customerEmail: searchRegex },
				{ customerCompany: searchRegex },
				{ notes: searchRegex }
			];
		}
		if (startDate || endDate) {
			query.date = {};
			if (startDate) query.date.$gte = normalizeToUTCDate(startDate);
			if (endDate) query.date.$lte = normalizeToUTCDate(endDate);
		}
		const p = parseInt(page, 10);
		const l = parseInt(limit, 10);
		const total = await Booking_default.countDocuments(query);
		const bookings = await Booking_default.find(query).populate("serviceId", "name duration price meetingType colorTag").populate("userId", "name email").sort({
			date: 1,
			timeSlot: 1
		}).skip((p - 1) * l).limit(l);
		res.json({
			bookings,
			pagination: {
				total,
				page: p,
				limit: l,
				pages: Math.ceil(total / l)
			}
		});
	} catch (error) {
		console.error("[Bookings] Fetch error:", error);
		res.status(500).json({ error: "Failed to fetch bookings list." });
	}
});
/**
* GET /api/bookings/export (Admin Protected - CSV format)
*/
router$7.get("/export", authenticate, async (req, res) => {
	try {
		const query = {};
		if (req.user?.role === "TEAM_MEMBER") query.userId = new mongoose.Types.ObjectId(req.user.id);
		const bookings = await Booking_default.find(query).populate("serviceId", "name").populate("userId", "name").sort({
			date: -1,
			timeSlot: -1
		});
		let csv = "ID,Customer Name,Customer Email,Company,Service,Date,Time Slot,Status,Budget,Project Type,Meet Link,Created At\n";
		for (const b of bookings) {
			const formattedDate = new Date(b.date).toISOString().split("T")[0];
			const serviceName = b.serviceId ? b.serviceId.name : "Unknown";
			csv += `"${b._id}","${b.customerName}","${b.customerEmail}","${b.customerCompany || ""}","${serviceName}","${formattedDate}","${b.timeSlot}","${b.status}","${b.budgetRange || ""}","${b.projectType || ""}","${b.googleMeetLink || ""}","${b.createdAt.toISOString()}"\n`;
		}
		res.setHeader("Content-Type", "text/csv");
		res.setHeader("Content-Disposition", "attachment; filename=bookings_export.csv");
		res.status(200).send(csv);
	} catch (error) {
		console.error("[Bookings] CSV Export error:", error);
		res.status(500).json({ error: "Failed to generate CSV export." });
	}
});
/**
* GET /api/bookings/:id (Admin Protected)
*/
router$7.get("/:id", authenticate, async (req, res) => {
	try {
		const booking = await Booking_default.findById(req.params.id).populate("serviceId").populate("userId", "name email");
		if (!booking) return res.status(404).json({ error: "Booking not found." });
		res.json({ booking });
	} catch (error) {
		console.error("[Bookings] Single fetch error:", error);
		res.status(500).json({ error: "Failed to load booking details." });
	}
});
/**
* POST /api/bookings (Public Endpoint - Client Booking Flow)
* 
* Full pipeline:
*  1. Validate inputs & availability
*  2. Create booking in MongoDB  
*  3. Create Google Calendar event with Meet link & send invitation
*  4. Auto-register CRM lead
*  5. Send email confirmations via Resend
*  6. Push admin notifications & activity logs
*/
router$7.post("/", async (req, res) => {
	try {
		const { serviceId, customerName, customerEmail, customerCompany, budgetRange, projectType, notes, date, timeSlot, utmSource, utmMedium, utmCampaign } = req.body;
		if (!serviceId || !customerName || !customerEmail || !date || !timeSlot) return res.status(400).json({ error: "Required fields are missing." });
		const service = await Service_default.findById(serviceId);
		if (!service || !service.isEnabled) return res.status(404).json({ error: "Selected service is unavailable or disabled." });
		const matchedSlot = (await AvailabilityEngine.getAvailableSlots(service, date, "UTC")).find((s) => s.time === timeSlot);
		if (!matchedSlot || !matchedSlot.available) return res.status(409).json({ error: "The selected time slot is no longer available. Please select another slot." });
		let assignedUserId = void 0;
		const defaultAvail = await mongoose.model("Availability").findOne();
		if (defaultAvail) assignedUserId = defaultAvail.userId;
		const { targetDate, startDateTime, endDateTime } = buildEventTimes(date, timeSlot, service.duration);
		const booking = new Booking_default({
			serviceId: service._id,
			userId: assignedUserId,
			customerName,
			customerEmail: customerEmail.toLowerCase().trim(),
			customerCompany,
			budgetRange,
			projectType,
			notes,
			date: normalizeToUTCDate(targetDate),
			timeSlot,
			status: "Confirmed",
			duration: service.duration,
			utmSource,
			utmMedium,
			utmCampaign
		});
		const summary = `${service.name} Briefing: ${customerName} & DevDale`;
		const description = [
			`Service: ${service.name}`,
			`Client: ${customerName} (${customerEmail})`,
			`Organization: ${customerCompany || "N/A"}`,
			`Project Type: ${projectType || "N/A"}`,
			`Budget: ${budgetRange || "N/A"}`,
			``,
			`Notes: ${notes || "None"}`,
			``,
			`Synchronized by DevDale Agency OS.`
		].join("\n");
		const calResult = await CalendarService.createEvent({
			summary,
			description,
			startDateTime: startDateTime.toISOString(),
			endDateTime: endDateTime.toISOString(),
			attendeeEmail: customerEmail,
			attendeeName: customerName
		});
		booking.googleEventId = calResult.googleEventId;
		booking.googleMeetLink = calResult.googleMeetLink;
		await booking.save();
		let leadObj = null;
		let leadScore = 20;
		if (budgetRange && budgetRange !== "Under $5k") leadScore += 30;
		if (projectType) leadScore += 20;
		if (notes && notes.length > 50) leadScore += 20;
		if (customerCompany) leadScore += 10;
		const existingLead = await Lead_default.findOne({ email: customerEmail.toLowerCase().trim() });
		if (!existingLead) {
			leadObj = await Lead_default.create({
				name: customerName,
				email: customerEmail.toLowerCase().trim(),
				company: customerCompany,
				message: notes || `Auto-captured through Booking Flow for service: ${service.name}`,
				status: "New",
				score: leadScore,
				assignedTo: assignedUserId,
				budgetRange,
				projectType,
				utmSource,
				utmMedium,
				utmCampaign,
				activityTimeline: [{
					action: "LEAD_CAPTURED",
					note: `Lead auto-provisioned via secure appointment booking for ${service.name}.`,
					timestamp: /* @__PURE__ */ new Date()
				}]
			});
			await EmailService.sendNewLeadNotification(leadObj);
			await createNotification("New CRM Lead Registered", `${customerName} from ${customerCompany || "Indie"} auto-captured via booking.`, "LEAD_NEW");
		} else {
			existingLead.activityTimeline.push({
				action: "NOTE_ADDED",
				note: `Customer booked service: ${service.name} for slot ${date} ${timeSlot}.`,
				timestamp: /* @__PURE__ */ new Date()
			});
			await existingLead.save();
		}
		await EmailService.sendBookingConfirmation(booking, service);
		await createNotification("New Appointment Scheduled", `${customerName} booked ${service.name} for ${date} at ${timeSlot}.`, "BOOKING_NEW");
		await logActivity$4(void 0, "CREATE_BOOKING", {
			bookingId: booking._id,
			customerEmail
		}, req);
		console.log(`[Bookings] ✅ Booking created: ${booking._id} | Meet: ${booking.googleMeetLink} | Real: ${calResult.isReal}`);
		res.status(201).json({
			success: true,
			booking,
			meetingLink: booking.googleMeetLink
		});
	} catch (error) {
		console.error("[Bookings] Public booking creation exception:", error);
		res.status(500).json({ error: "System error: Failed to provision booking reservation." });
	}
});
/**
* POST /api/bookings/:id/reschedule (Public/Client or Admin Reschedule Flow)
*/
router$7.post("/:id/reschedule", async (req, res) => {
	try {
		const { date, timeSlot, rescheduleReason } = req.body;
		if (!date || !timeSlot) return res.status(400).json({ error: "New date and timeSlot are required." });
		const booking = await Booking_default.findById(req.params.id);
		if (!booking) return res.status(404).json({ error: "Booking session not found." });
		const service = await Service_default.findById(booking.serviceId);
		if (!service) return res.status(404).json({ error: "Associated service model not found." });
		const oldDetails = {
			date: booking.date,
			timeSlot: booking.timeSlot
		};
		const matchedSlot = (await AvailabilityEngine.getAvailableSlots(service, date, "UTC", booking.userId?.toString())).find((s) => s.time === timeSlot);
		if (!matchedSlot || !matchedSlot.available) return res.status(409).json({ error: "The newly selected slot is unavailable." });
		const { targetDate, startDateTime, endDateTime } = buildEventTimes(date, timeSlot, service.duration);
		const summary = `[RESCHEDULED] ${service.name} Briefing: ${booking.customerName} & DevDale`;
		const description = [
			`Service: ${service.name} (Rescheduled)`,
			`Client: ${booking.customerName} (${booking.customerEmail})`,
			`Reason: ${rescheduleReason || "N/A"}`,
			``,
			`Updated by DevDale Agency OS.`
		].join("\n");
		const existingEventId = booking.googleEventId || booking.googleCalendarEventId;
		let calResult;
		if (existingEventId && !existingEventId.startsWith("mock-")) calResult = await CalendarService.updateEvent(existingEventId, {
			summary,
			description,
			startDateTime: startDateTime.toISOString(),
			endDateTime: endDateTime.toISOString(),
			attendeeEmail: booking.customerEmail,
			attendeeName: booking.customerName
		});
		else {
			if (existingEventId) await CalendarService.deleteEvent(existingEventId);
			calResult = await CalendarService.createEvent({
				summary,
				description,
				startDateTime: startDateTime.toISOString(),
				endDateTime: endDateTime.toISOString(),
				attendeeEmail: booking.customerEmail,
				attendeeName: booking.customerName
			});
		}
		booking.date = normalizeToUTCDate(targetDate);
		booking.timeSlot = timeSlot;
		booking.status = "Rescheduled";
		booking.rescheduleReason = rescheduleReason;
		booking.duration = service.duration;
		booking.googleEventId = calResult.googleEventId;
		booking.googleMeetLink = calResult.googleMeetLink;
		await booking.save();
		const lead = await Lead_default.findOne({ email: booking.customerEmail });
		if (lead) {
			lead.activityTimeline.push({
				action: "STATUS_CHANGED",
				note: `Meeting rescheduled to ${date} at ${timeSlot}. Reason: ${rescheduleReason || "none"}`,
				timestamp: /* @__PURE__ */ new Date()
			});
			await lead.save();
		}
		await EmailService.sendBookingRescheduled(booking, service, oldDetails);
		await createNotification("Booking Rescheduled", `${booking.customerName} changed schedule to ${date} at ${timeSlot}.`, "SYSTEM");
		await logActivity$4(req.user?.id, "RESCHEDULE_BOOKING", {
			bookingId: booking._id,
			oldDetails
		}, req);
		res.json({
			success: true,
			booking,
			meetingLink: booking.googleMeetLink
		});
	} catch (error) {
		console.error("[Bookings] Reschedule error:", error);
		res.status(500).json({ error: "Failed to process appointment reschedule." });
	}
});
/**
* POST /api/bookings/:id/cancel (Public/Client or Admin Cancellation Flow)
*/
router$7.post("/:id/cancel", async (req, res) => {
	try {
		const { cancellationReason } = req.body;
		const booking = await Booking_default.findById(req.params.id);
		if (!booking) return res.status(404).json({ error: "Booking session not found." });
		const service = await Service_default.findById(booking.serviceId);
		if (!service) return res.status(404).json({ error: "Service model not found." });
		const eventId = booking.googleEventId || booking.googleCalendarEventId;
		if (eventId) await CalendarService.deleteEvent(eventId);
		booking.status = "Cancelled";
		booking.cancellationReason = cancellationReason;
		await booking.save();
		const lead = await Lead_default.findOne({ email: booking.customerEmail });
		if (lead) {
			lead.activityTimeline.push({
				action: "STATUS_CHANGED",
				note: `Meeting CANCELLED. Reason: ${cancellationReason || "none"}`,
				timestamp: /* @__PURE__ */ new Date()
			});
			await lead.save();
		}
		await EmailService.sendBookingCancelled(booking, service);
		await createNotification("Appointment Cancelled", `${booking.customerName} cancelled session on ${booking.date.toISOString().split("T")[0]}.`, "BOOKING_CANCELLED");
		await logActivity$4(req.user?.id, "CANCEL_BOOKING", {
			bookingId: booking._id,
			cancellationReason
		}, req);
		res.json({
			success: true,
			message: "Appointment successfully cancelled. Notifications dispatched.",
			booking
		});
	} catch (error) {
		console.error("[Bookings] Cancellation error:", error);
		res.status(500).json({ error: "Failed to process appointment cancellation." });
	}
});
/**
* PATCH /api/bookings/:id (Admin Edit - status updates, team assignment, logs)
*/
router$7.patch("/:id", authenticate, async (req, res) => {
	try {
		const updates = req.body;
		const allowedFields = [
			"status",
			"userId",
			"notes"
		];
		const queryUpdates = {};
		for (const key of Object.keys(updates)) if (allowedFields.includes(key)) if (key === "userId" && updates[key]) queryUpdates[key] = new mongoose.Types.ObjectId(updates[key]);
		else queryUpdates[key] = updates[key];
		const booking = await Booking_default.findByIdAndUpdate(req.params.id, { $set: queryUpdates }, { new: true }).populate("serviceId").populate("userId", "name email");
		if (!booking) return res.status(404).json({ error: "Booking session not found." });
		await logActivity$4(req.user?.id, "UPDATE_BOOKING_ADMIN", {
			bookingId: booking._id,
			updates: queryUpdates
		}, req);
		res.json({
			success: true,
			booking
		});
	} catch (error) {
		console.error("[Bookings] Admin update error:", error);
		res.status(500).json({ error: "Failed to modify booking record." });
	}
});
/**
* DELETE /api/bookings/:id (Admin Root Protected)
*/
router$7.delete("/:id", authenticate, requireAdmin, async (req, res) => {
	try {
		const booking = await Booking_default.findById(req.params.id);
		if (!booking) return res.status(404).json({ error: "Booking not found." });
		const eventId = booking.googleEventId || booking.googleCalendarEventId;
		if (eventId) await CalendarService.deleteEvent(eventId);
		await Booking_default.findByIdAndDelete(req.params.id);
		await logActivity$4(req.user?.id, "DELETE_BOOKING_ADMIN", {
			bookingId: req.params.id,
			customerName: booking.customerName
		}, req);
		res.json({
			success: true,
			message: "Booking securely deleted from system archives."
		});
	} catch (error) {
		console.error("[Bookings] Admin delete error:", error);
		res.status(500).json({ error: "Failed to remove booking archives." });
	}
});
//#endregion
//#region server/routes/availability.ts
var router$6 = express.Router();
/**
* Helper to record activity logs
*/
async function logActivity$3(userId, action, details, req) {
	try {
		await ActivityLog_default.create({
			userId,
			action,
			details,
			ipAddress: req.ip || req.socket?.remoteAddress,
			userAgent: req.headers["user-agent"]
		});
	} catch (err) {
		console.error("[ActivityLog] Error:", err);
	}
}
/**
* GET /api/availability/slots (Public)
* Retrieves available slots for booking widget DatePicker
* Query parameters: serviceId (or slug), date (YYYY-MM-DD), timezone
*/
router$6.get("/slots", async (req, res) => {
	try {
		const { serviceId, serviceSlug, date, timezone = "UTC" } = req.query;
		if (!date) return res.status(400).json({ error: "Date parameter is required (format: YYYY-MM-DD)." });
		let service = null;
		if (serviceId) service = await Service_default.findById(serviceId);
		else if (serviceSlug) service = await Service_default.findOne({ slug: serviceSlug });
		if (!service || !service.isEnabled) return res.status(404).json({ error: "Selected service could not be located or is currently disabled." });
		const slots = await AvailabilityEngine.getAvailableSlots(service, date, timezone);
		res.json({ slots });
	} catch (error) {
		console.error("[Availability] Slots error:", error);
		res.status(500).json({ error: "Failed to generate dynamic slot grid." });
	}
});
/**
* GET /api/availability/setup (Admin Protected)
* Loads availability rules for authenticated team member
*/
router$6.get("/setup", authenticate, async (req, res) => {
	try {
		const userId = req.user?.id;
		let availability = await Availability_default.findOne({ userId });
		if (!availability) availability = await Availability_default.create({
			userId: new mongoose.Types.ObjectId(userId),
			timezone: "UTC",
			workingDays: [
				{
					day: 1,
					slots: [{
						start: "09:00",
						end: "17:00"
					}]
				},
				{
					day: 2,
					slots: [{
						start: "09:00",
						end: "17:00"
					}]
				},
				{
					day: 3,
					slots: [{
						start: "09:00",
						end: "17:00"
					}]
				},
				{
					day: 4,
					slots: [{
						start: "09:00",
						end: "17:00"
					}]
				},
				{
					day: 5,
					slots: [{
						start: "09:00",
						end: "17:00"
					}]
				}
			],
			bookingLimitsPerDay: 6
		});
		res.json({ availability });
	} catch (error) {
		console.error("[Availability] Get setup error:", error);
		res.status(500).json({ error: "Failed to load availability configurations." });
	}
});
/**
* PUT /api/availability/setup (Admin Protected)
* Updates working schedule rules, timezone, limits
*/
router$6.put("/setup", authenticate, async (req, res) => {
	try {
		const userId = req.user?.id;
		const { timezone, workingDays, bookingLimitsPerDay } = req.body;
		const availability = await Availability_default.findOneAndUpdate({ userId }, { $set: {
			timezone,
			workingDays,
			bookingLimitsPerDay
		} }, {
			new: true,
			upsert: true
		});
		await logActivity$3(req.user?.id, "UPDATE_AVAILABILITY", {
			timezone,
			bookingLimitsPerDay
		}, req);
		res.json({
			success: true,
			availability
		});
	} catch (error) {
		console.error("[Availability] Put setup error:", error);
		res.status(500).json({ error: "Failed to update availability schedule configurations." });
	}
});
/**
* GET /api/availability/blocked-dates (Public / Admin)
* Lists all active calendar blocks
*/
router$6.get("/blocked-dates", async (req, res) => {
	try {
		const blocks = await BlockedDate_default.find().sort({ date: 1 });
		res.json({ blockedDates: blocks });
	} catch (error) {
		console.error("[Availability] Blocked dates error:", error);
		res.status(500).json({ error: "Failed to fetch blocked dates feed." });
	}
});
/**
* POST /api/availability/blocked-dates (Admin Protected)
* Provisions new calendar blackouts / holidays
*/
router$6.post("/blocked-dates", authenticate, async (req, res) => {
	try {
		const { date, reason, isGlobal = true } = req.body;
		if (!date) return res.status(400).json({ error: "Blockout date is required." });
		const normalized = normalizeToUTCDate(date);
		if (await BlockedDate_default.findOne({
			date: normalized,
			userId: isGlobal ? void 0 : new mongoose.Types.ObjectId(req.user?.id)
		})) return res.status(400).json({ error: "This date has already been registered in the calendar blockouts." });
		const block = new BlockedDate_default({
			date: normalized,
			reason,
			isGlobal,
			userId: isGlobal ? void 0 : new mongoose.Types.ObjectId(req.user?.id)
		});
		await block.save();
		await logActivity$3(req.user?.id, "CREATE_BLOCKED_DATE", {
			date: normalized,
			reason
		}, req);
		res.status(201).json({
			success: true,
			block
		});
	} catch (error) {
		console.error("[Availability] Block creation error:", error);
		res.status(500).json({ error: "Failed to provision calendar block." });
	}
});
/**
* DELETE /api/availability/blocked-dates/:id (Admin Protected)
* Deletes calendar blackout / releases slot back to pool
*/
router$6.delete("/blocked-dates/:id", authenticate, async (req, res) => {
	try {
		const block = await BlockedDate_default.findById(req.params.id);
		if (!block) return res.status(404).json({ error: "Blocked date calendar entry not found." });
		if (req.user?.role !== "ADMIN" && block.userId?.toString() !== req.user?.id) return res.status(403).json({ error: "Forbidden: You are only authorized to release your own custom blockouts." });
		await BlockedDate_default.findByIdAndDelete(req.params.id);
		await logActivity$3(req.user?.id, "DELETE_BLOCKED_DATE", { date: block.date }, req);
		res.json({
			success: true,
			message: "Calendar date blackout released back to open pools."
		});
	} catch (error) {
		console.error("[Availability] Block delete error:", error);
		res.status(500).json({ error: "Failed to remove calendar blockout." });
	}
});
//#endregion
//#region server/routes/services.ts
var router$5 = express.Router();
/**
* Helper to record activity logs
*/
async function logActivity$2(userId, action, details, req) {
	try {
		await ActivityLog_default.create({
			userId,
			action,
			details,
			ipAddress: req.ip || req.socket?.remoteAddress,
			userAgent: req.headers["user-agent"]
		});
	} catch (err) {
		console.error("[ActivityLog] Error:", err);
	}
}
/**
* GET /api/services (Public & Admin)
* Returns all services. Public queries receive enabled-only. Admins receive all.
*/
router$5.get("/", async (req, res) => {
	try {
		const { all } = req.query;
		let query = { isEnabled: true };
		if (all === "true") query = {};
		const services = await Service_default.find(query).sort({
			price: 1,
			duration: 1
		});
		res.json({ services });
	} catch (error) {
		console.error("[Services] Fetch error:", error);
		res.status(500).json({ error: "Failed to load services database." });
	}
});
/**
* GET /api/services/:id
*/
router$5.get("/:id", async (req, res) => {
	try {
		const service = await Service_default.findById(req.params.id);
		if (!service) return res.status(404).json({ error: "Service configuration not found." });
		res.json({ service });
	} catch (error) {
		console.error("[Services] Single fetch error:", error);
		res.status(500).json({ error: "Failed to load service configuration." });
	}
});
/**
* POST /api/services (Admin Root Protected)
* Creates a brand new agency service offering
*/
router$5.post("/", authenticate, requireAdmin, async (req, res) => {
	try {
		const { name, duration, description, price, meetingType, colorTag, bufferTime, isEnabled } = req.body;
		if (!name || !duration) return res.status(400).json({ error: "Service name and duration are required." });
		const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");
		if (await Service_default.findOne({ slug })) return res.status(400).json({ error: "A service with a similar name already exists." });
		const service = new Service_default({
			name,
			slug,
			duration,
			description,
			price,
			meetingType,
			colorTag,
			bufferTime,
			isEnabled
		});
		await service.save();
		await logActivity$2(req.user?.id, "CREATE_SERVICE", {
			serviceId: service._id,
			name
		}, req);
		res.status(201).json({
			success: true,
			service
		});
	} catch (error) {
		console.error("[Services] Create error:", error);
		res.status(500).json({ error: "Failed to create service offering." });
	}
});
/**
* PUT /api/services/:id (Admin Root Protected)
* Modifies an existing agency service offering
*/
router$5.put("/:id", authenticate, requireAdmin, async (req, res) => {
	try {
		const { name, duration, description, price, meetingType, colorTag, bufferTime, isEnabled } = req.body;
		const service = await Service_default.findById(req.params.id);
		if (!service) return res.status(404).json({ error: "Service not found." });
		if (name) {
			service.name = name;
			service.slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");
		}
		if (duration !== void 0) service.duration = duration;
		if (description !== void 0) service.description = description;
		if (price !== void 0) service.price = price;
		if (meetingType) service.meetingType = meetingType;
		if (colorTag) service.colorTag = colorTag;
		if (bufferTime !== void 0) service.bufferTime = bufferTime;
		if (isEnabled !== void 0) service.isEnabled = isEnabled;
		await service.save();
		await logActivity$2(req.user?.id, "UPDATE_SERVICE", {
			serviceId: service._id,
			name: service.name
		}, req);
		res.json({
			success: true,
			service
		});
	} catch (error) {
		console.error("[Services] Update error:", error);
		res.status(500).json({ error: "Failed to update service configurations." });
	}
});
/**
* DELETE /api/services/:id (Admin Root Protected)
* Securely deletes an agency service offering
*/
router$5.delete("/:id", authenticate, requireAdmin, async (req, res) => {
	try {
		const service = await Service_default.findById(req.params.id);
		if (!service) return res.status(404).json({ error: "Service not found." });
		await Service_default.findByIdAndDelete(req.params.id);
		await logActivity$2(req.user?.id, "DELETE_SERVICE", {
			serviceId: req.params.id,
			name: service.name
		}, req);
		res.json({
			success: true,
			message: "Service successfully decommissioned from booking systems."
		});
	} catch (error) {
		console.error("[Services] Delete error:", error);
		res.status(500).json({ error: "Failed to delete service offering." });
	}
});
//#endregion
//#region server/routes/leads.ts
var router$4 = express.Router();
/**
* Helper to record activity logs
*/
async function logActivity$1(userId, action, details, req) {
	try {
		await ActivityLog_default.create({
			userId,
			action,
			details,
			ipAddress: req.ip || req.socket?.remoteAddress,
			userAgent: req.headers["user-agent"]
		});
	} catch (err) {
		console.error("[ActivityLog] Error:", err);
	}
}
/**
* GET /api/leads (Admin Protected)
* Supports search, status filter, scoring range filter, and pagination
*/
router$4.get("/", authenticate, async (req, res) => {
	try {
		const { status, search, minScore, assignedTo, page = "1", limit = "10" } = req.query;
		const query = {};
		if (status) query.status = status;
		if (assignedTo) query.assignedTo = new mongoose.Types.ObjectId(assignedTo);
		if (minScore) query.score = { $gte: parseInt(minScore, 10) };
		if (search) {
			const searchRegex = new RegExp(search, "i");
			query.$or = [
				{ name: searchRegex },
				{ email: searchRegex },
				{ company: searchRegex },
				{ message: searchRegex },
				{ notes: searchRegex }
			];
		}
		const p = parseInt(page, 10);
		const l = parseInt(limit, 10);
		const total = await Lead_default.countDocuments(query);
		const leads = await Lead_default.find(query).populate("assignedTo", "name email").sort({
			score: -1,
			createdAt: -1
		}).skip((p - 1) * l).limit(l);
		res.json({
			leads,
			pagination: {
				total,
				page: p,
				limit: l,
				pages: Math.ceil(total / l)
			}
		});
	} catch (error) {
		console.error("[Leads] Fetch error:", error);
		res.status(500).json({ error: "Failed to fetch CRM prospects." });
	}
});
/**
* GET /api/leads/:id (Admin Protected)
*/
router$4.get("/:id", authenticate, async (req, res) => {
	try {
		const lead = await Lead_default.findById(req.params.id).populate("assignedTo", "name email");
		if (!lead) return res.status(404).json({ error: "Prospect file not found." });
		res.json({ lead });
	} catch (error) {
		console.error("[Leads] Single fetch error:", error);
		res.status(500).json({ error: "Failed to load prospect files." });
	}
});
/**
* POST /api/leads (Public Form Capture or Admin manual addition)
*/
router$4.post("/", async (req, res) => {
	try {
		const { name, email, phone, company, message, budgetRange, projectType, utmSource, utmMedium, utmCampaign } = req.body;
		if (!name || !email || !message) return res.status(400).json({ error: "Name, email, and message are required." });
		let score = 20;
		if (budgetRange && budgetRange !== "Under $5k") score += 30;
		if (projectType) score += 20;
		if (message.length > 50) score += 20;
		if (company) score += 10;
		const timeline = [{
			action: "LEAD_CAPTURED",
			note: "CRM Lead Profile initialized via direct capture portal.",
			timestamp: /* @__PURE__ */ new Date()
		}];
		const lead = new Lead_default({
			name,
			email: email.toLowerCase().trim(),
			phone,
			company,
			message,
			status: "New",
			score,
			budgetRange,
			projectType,
			utmSource,
			utmMedium,
			utmCampaign,
			activityTimeline: timeline
		});
		await lead.save();
		await logActivity$1(void 0, "CREATE_LEAD_CRM", {
			leadId: lead._id,
			email
		}, req);
		res.status(201).json({
			success: true,
			lead
		});
	} catch (error) {
		console.error("[Leads] Creation error:", error);
		res.status(500).json({ error: "Failed to capture lead profile." });
	}
});
/**
* PATCH /api/leads/:id (Admin Protected - update CRM fields)
*/
router$4.patch("/:id", authenticate, async (req, res) => {
	try {
		const { status, score, assignedTo, notes, phone, company, budgetRange, projectType } = req.body;
		const lead = await Lead_default.findById(req.params.id);
		if (!lead) return res.status(404).json({ error: "Prospect profile not found." });
		const prevStatus = lead.status;
		const prevAssigned = lead.assignedTo;
		if (status) {
			lead.status = status;
			if (prevStatus !== status) lead.activityTimeline.push({
				action: "STATUS_CHANGED",
				note: `CRM Pipeline state upgraded from ${prevStatus} to ${status}.`,
				timestamp: /* @__PURE__ */ new Date()
			});
		}
		if (score !== void 0) lead.score = score;
		if (assignedTo !== void 0) if (assignedTo === null) {
			lead.assignedTo = void 0;
			lead.activityTimeline.push({
				action: "ASSIGNED_MEMBER",
				note: "Lead profile unassigned.",
				timestamp: /* @__PURE__ */ new Date()
			});
		} else {
			lead.assignedTo = new mongoose.Types.ObjectId(assignedTo);
			if (prevAssigned?.toString() !== assignedTo) lead.activityTimeline.push({
				action: "ASSIGNED_MEMBER",
				note: "Lead assigned to new workload manager.",
				timestamp: /* @__PURE__ */ new Date()
			});
		}
		if (notes !== void 0) lead.notes = notes;
		if (phone !== void 0) lead.phone = phone;
		if (company !== void 0) lead.company = company;
		if (budgetRange !== void 0) lead.budgetRange = budgetRange;
		if (projectType !== void 0) lead.projectType = projectType;
		await lead.save();
		await logActivity$1(req.user?.id, "UPDATE_LEAD_CRM", {
			leadId: lead._id,
			updates: req.body
		}, req);
		res.json({
			success: true,
			lead
		});
	} catch (error) {
		console.error("[Leads] Update error:", error);
		res.status(500).json({ error: "Failed to update prospect CRM data." });
	}
});
/**
* POST /api/leads/:id/notes (Admin Protected - append custom note to history)
*/
router$4.post("/:id/notes", authenticate, async (req, res) => {
	try {
		const { note } = req.body;
		if (!note) return res.status(400).json({ error: "Note content is required." });
		const lead = await Lead_default.findById(req.params.id);
		if (!lead) return res.status(404).json({ error: "Prospect file not found." });
		lead.activityTimeline.push({
			action: "NOTE_ADDED",
			note,
			timestamp: /* @__PURE__ */ new Date()
		});
		await lead.save();
		await logActivity$1(req.user?.id, "ADD_LEAD_NOTE", {
			leadId: lead._id,
			note
		}, req);
		res.json({
			success: true,
			lead
		});
	} catch (error) {
		console.error("[Leads] Append note error:", error);
		res.status(500).json({ error: "Failed to append note to timeline." });
	}
});
/**
* DELETE /api/leads/:id (Admin Protected - restrict to full ADMIN)
*/
router$4.delete("/:id", authenticate, requireAdmin, async (req, res) => {
	try {
		const lead = await Lead_default.findById(req.params.id);
		if (!lead) return res.status(404).json({ error: "Prospect not found." });
		await Lead_default.findByIdAndDelete(req.params.id);
		await logActivity$1(req.user?.id, "DELETE_LEAD_CRM", {
			leadId: req.params.id,
			name: lead.name
		}, req);
		res.json({
			success: true,
			message: "Lead record securely deleted from active CRM archives."
		});
	} catch (error) {
		console.error("[Leads] Delete error:", error);
		res.status(500).json({ error: "Failed to delete lead archives." });
	}
});
//#endregion
//#region server/routes/team.ts
var router$3 = express.Router();
/**
* Helper to record activity logs
*/
async function logActivity(userId, action, details, req) {
	try {
		await ActivityLog_default.create({
			userId,
			action,
			details,
			ipAddress: req.ip || req.socket?.remoteAddress,
			userAgent: req.headers["user-agent"]
		});
	} catch (err) {
		console.error("[ActivityLog] Error:", err);
	}
}
/**
* GET /api/team (Admin Protected)
* Lists all registered agency staff / team members
*/
router$3.get("/", authenticate, async (req, res) => {
	try {
		const team = await User_default.find().select("-password -refreshTokens").sort({
			role: 1,
			name: 1
		});
		res.json({ team });
	} catch (error) {
		console.error("[Team] Fetch error:", error);
		res.status(500).json({ error: "Failed to load team directory." });
	}
});
/**
* POST /api/team (Admin Root Protected)
* Registers a new staff member, hashes their password, and provisions default availability schedule
*/
router$3.post("/", authenticate, requireAdmin, async (req, res) => {
	try {
		const { name, email, password, role = "TEAM_MEMBER" } = req.body;
		if (!name || !email || !password) return res.status(400).json({ error: "Name, email, and password are required." });
		if (await User_default.findOne({ email: email.toLowerCase().trim() })) return res.status(400).json({ error: "An account with that email has already been registered." });
		const { hash, salt } = hashPassword(password);
		const user = new User_default({
			name,
			email: email.toLowerCase().trim(),
			password: `${hash}:${salt}`,
			role,
			isLocked: false,
			loginAttempts: 0
		});
		await user.save();
		await Availability_default.create({
			userId: user._id,
			timezone: "UTC",
			workingDays: [
				{
					day: 1,
					slots: [{
						start: "09:00",
						end: "17:00"
					}]
				},
				{
					day: 2,
					slots: [{
						start: "09:00",
						end: "17:00"
					}]
				},
				{
					day: 3,
					slots: [{
						start: "09:00",
						end: "17:00"
					}]
				},
				{
					day: 4,
					slots: [{
						start: "09:00",
						end: "17:00"
					}]
				},
				{
					day: 5,
					slots: [{
						start: "09:00",
						end: "17:00"
					}]
				}
			],
			bookingLimitsPerDay: 6
		});
		await logActivity(req.user?.id, "ONBOARD_TEAM_MEMBER", {
			newMemberId: user._id,
			email: user.email
		}, req);
		res.status(201).json({
			success: true,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role
			}
		});
	} catch (error) {
		console.error("[Team] Create error:", error);
		res.status(500).json({ error: "Failed to onboard team member." });
	}
});
/**
* DELETE /api/team/:id (Admin Root Protected)
* Deletes team member and their corresponding availability records.
* Note: Admins cannot delete their own profile.
*/
router$3.delete("/:id", authenticate, requireAdmin, async (req, res) => {
	try {
		const targetId = req.params.id;
		if (targetId === req.user?.id) return res.status(400).json({ error: "Self-deletion block: You are not authorized to delete your active account." });
		const user = await User_default.findById(targetId);
		if (!user) return res.status(404).json({ error: "Team member account not found." });
		await User_default.findByIdAndDelete(targetId);
		await Availability_default.findOneAndDelete({ userId: targetId });
		await logActivity(req.user?.id, "OFFBOARD_TEAM_MEMBER", {
			offboardedId: targetId,
			email: user.email
		}, req);
		res.json({
			success: true,
			message: "Team member securely deleted and scheduling logs released."
		});
	} catch (error) {
		console.error("[Team] Delete error:", error);
		res.status(500).json({ error: "Failed to offboard team member." });
	}
});
//#endregion
//#region server/routes/analytics.ts
var router$2 = express.Router();
/**
* GET /api/analytics/dashboard (Admin Protected)
* Performs aggregation queries to feed key metrics & charts in the CRM Dashboard
*/
router$2.get("/dashboard", authenticate, async (req, res) => {
	try {
		const now = /* @__PURE__ */ new Date();
		const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
		const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));
		const startOfThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
		const startOfLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
		const endOfLastMonth = /* @__PURE__ */ new Date(startOfThisMonth.getTime() - 1);
		const totalBookings = await Booking_default.countDocuments({ status: { $ne: "Cancelled" } });
		const todaysMeetings = await Booking_default.countDocuments({
			date: {
				$gte: startOfToday,
				$lte: endOfToday
			},
			status: { $in: [
				"Confirmed",
				"Pending",
				"Rescheduled"
			] }
		});
		const pendingLeads = await Lead_default.countDocuments({ status: { $in: ["New", "Contacted"] } });
		const totalLeads = await Lead_default.countDocuments();
		const qualifiedLeads = await Lead_default.countDocuments({ status: { $in: [
			"Qualified",
			"Proposal Sent",
			"Won"
		] } });
		const conversionRate = totalLeads > 0 ? Math.round(qualifiedLeads / totalLeads * 100) : 0;
		const activeBookings = await Booking_default.find({ status: { $in: [
			"Confirmed",
			"Completed",
			"Rescheduled"
		] } }).populate("serviceId", "price");
		let revenuePipeline = 0;
		activeBookings.forEach((b) => {
			if (b.serviceId && b.serviceId.price) revenuePipeline += b.serviceId.price;
		});
		const bookingsThisMonth = await Booking_default.countDocuments({
			createdAt: { $gte: startOfThisMonth },
			status: { $ne: "Cancelled" }
		});
		const bookingsLastMonth = await Booking_default.countDocuments({
			createdAt: {
				$gte: startOfLastMonth,
				$lte: endOfLastMonth
			},
			status: { $ne: "Cancelled" }
		});
		let monthlyGrowth = 0;
		if (bookingsLastMonth > 0) monthlyGrowth = Math.round((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth * 100);
		else if (bookingsThisMonth > 0) monthlyGrowth = 100;
		const monthlyTrends = [];
		for (let i = 5; i >= 0; i--) {
			const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
			const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1, 0, 0, 0, -1));
			const monthName = monthStart.toLocaleString("en-US", {
				month: "short",
				timeZone: "UTC"
			});
			const bookCount = await Booking_default.countDocuments({
				createdAt: {
					$gte: monthStart,
					$lte: monthEnd
				},
				status: { $ne: "Cancelled" }
			});
			const leadCount = await Lead_default.countDocuments({ createdAt: {
				$gte: monthStart,
				$lte: monthEnd
			} });
			const monthlyBookings = await Booking_default.find({
				createdAt: {
					$gte: monthStart,
					$lte: monthEnd
				},
				status: { $in: [
					"Confirmed",
					"Completed",
					"Rescheduled"
				] }
			}).populate("serviceId", "price");
			let monthlyRevenue = 0;
			monthlyBookings.forEach((b) => {
				if (b.serviceId && b.serviceId.price) monthlyRevenue += b.serviceId.price;
			});
			monthlyTrends.push({
				month: monthName,
				bookings: bookCount,
				leads: leadCount,
				revenue: monthlyRevenue
			});
		}
		const services = await Service_default.find();
		const serviceDemand = [];
		for (const service of services) {
			const count = await Booking_default.countDocuments({
				serviceId: service._id,
				status: { $ne: "Cancelled" }
			});
			serviceDemand.push({
				name: service.name,
				value: count,
				color: service.colorTag
			});
		}
		serviceDemand.sort((a, b) => b.value - a.value);
		const utmAttribution = await Lead_default.aggregate([
			{ $group: {
				_id: { $ifNull: ["$utmSource", "Direct"] },
				value: { $sum: 1 }
			} },
			{ $project: {
				name: "$_id",
				value: 1,
				_id: 0
			} },
			{ $sort: { value: -1 } }
		]);
		const recentActivity = await ActivityLog_default.find().populate("userId", "name role").sort({ createdAt: -1 }).limit(6);
		const upcomingMeetings = await Booking_default.find({
			date: { $gte: startOfToday },
			status: { $in: [
				"Confirmed",
				"Pending",
				"Rescheduled"
			] }
		}).populate("serviceId", "name duration colorTag").populate("userId", "name").sort({
			date: 1,
			timeSlot: 1
		}).limit(5);
		res.json({
			metrics: {
				totalBookings,
				todaysMeetings,
				conversionRate,
				revenuePipeline,
				pendingLeads,
				monthlyGrowth
			},
			charts: {
				monthlyTrends,
				serviceDemand: serviceDemand.filter((s) => s.value > 0),
				utmAttribution
			},
			upcomingMeetings,
			recentActivity
		});
	} catch (error) {
		console.error("[Analytics] Dashboard error:", error);
		res.status(500).json({ error: "Failed to compile business dashboard intelligence." });
	}
});
//#endregion
//#region server/routes/notifications.ts
var router$1 = express.Router();
/**
* GET /api/notifications (Admin Protected)
* Lists latest 30 notifications for the staff header tray
*/
router$1.get("/", authenticate, async (req, res) => {
	try {
		const unreadCount = await Notification_default.countDocuments({ isRead: false });
		const notifications = await Notification_default.find().sort({ createdAt: -1 }).limit(30);
		res.json({
			notifications,
			unreadCount
		});
	} catch (error) {
		console.error("[Notifications] Fetch error:", error);
		res.status(500).json({ error: "Failed to load notifications stream." });
	}
});
/**
* PATCH /api/notifications (Admin Protected)
* Marks all notifications as read
*/
router$1.patch("/mark-all-read", authenticate, async (req, res) => {
	try {
		await Notification_default.updateMany({ isRead: false }, { $set: { isRead: true } });
		res.json({
			success: true,
			message: "All system alerts marked as read."
		});
	} catch (error) {
		console.error("[Notifications] Mark all read error:", error);
		res.status(500).json({ error: "Failed to clear notifications tray." });
	}
});
/**
* PATCH /api/notifications/:id (Admin Protected)
* Marks a single notification as read
*/
router$1.patch("/:id", authenticate, async (req, res) => {
	try {
		const notification = await Notification_default.findByIdAndUpdate(req.params.id, { $set: { isRead: true } }, { new: true });
		if (!notification) return res.status(404).json({ error: "Notification entry not found." });
		res.json({
			success: true,
			notification
		});
	} catch (error) {
		console.error("[Notifications] Update error:", error);
		res.status(500).json({ error: "Failed to mark system alert as read." });
	}
});
//#endregion
//#region server/routes/activityLogs.ts
var router = express.Router();
/**
* GET /api/activity-logs (Admin Protected)
* Lists system audit logs, paginated, for visual security verification
*/
router.get("/", authenticate, async (req, res) => {
	try {
		const { page = "1", limit = "20" } = req.query;
		const p = parseInt(page, 10);
		const l = parseInt(limit, 10);
		const total = await ActivityLog_default.countDocuments();
		const logs = await ActivityLog_default.find().populate("userId", "name role email").sort({ createdAt: -1 }).skip((p - 1) * l).limit(l);
		res.json({
			logs,
			pagination: {
				total,
				page: p,
				limit: l,
				pages: Math.ceil(total / l)
			}
		});
	} catch (error) {
		console.error("[ActivityLogs] Fetch error:", error);
		res.status(500).json({ error: "Failed to load system audit trails." });
	}
});
//#endregion
//#region server/routes.ts
function setupRoutes(app) {
	app.use(securityHeaders);
	app.get("/api/ping", (_req, res) => {
		res.json({ message: "pong" });
	});
	app.get("/api/db-status", (_req, res) => {
		res.json({
			status: [
				"disconnected",
				"connected",
				"connecting",
				"disconnecting"
			][mongoose.connection.readyState],
			readyState: mongoose.connection.readyState,
			dbName: mongoose.connection.name
		});
	});
	app.use("/api/auth", router$8);
	app.use("/api/bookings", router$7);
	app.use("/api/availability", router$6);
	app.use("/api/services", router$5);
	app.use("/api/leads", router$4);
	app.use("/api/team", router$3);
	app.use("/api/analytics", router$2);
	app.use("/api/notifications", router$1);
	app.use("/api/activity-logs", router);
	app.post("/api/submit-form", handleSubmitForm);
	app.post("/api/project-request", handleProjectRequest);
}
//#endregion
//#region server/utils/seed.ts
async function seedDatabase() {
	try {
		if (await User_default.countDocuments() === 0) {
			console.log("[Seed] Bootstrapping root admin account...");
			const defaultPassword = "Devdale@2026";
			const { hash, salt } = hashPassword(defaultPassword);
			const admin = await User_default.create({
				name: "DevDale Administrator",
				email: "admin@devdale.com",
				password: `${hash}:${salt}`,
				role: "ADMIN",
				isLocked: false,
				loginAttempts: 0
			});
			admin._id;
			console.log("-----------------------------------------------------------------");
			console.log("[SECURITY ALERT] ROOT ADMIN BOOTSTRAPPED");
			console.log("Email: admin@devdale.com");
			console.log(`Password: ${defaultPassword}`);
			console.log("[SECURITY ALERT] PLEASE UPDATE PASSWORD IMMEDIATELY UPON LOGIN");
			console.log("-----------------------------------------------------------------");
			await Availability_default.create({
				userId: admin._id,
				timezone: "UTC",
				workingDays: [
					{
						day: 1,
						slots: [{
							start: "09:00",
							end: "17:00"
						}]
					},
					{
						day: 2,
						slots: [{
							start: "09:00",
							end: "17:00"
						}]
					},
					{
						day: 3,
						slots: [{
							start: "09:00",
							end: "17:00"
						}]
					},
					{
						day: 4,
						slots: [{
							start: "09:00",
							end: "17:00"
						}]
					},
					{
						day: 5,
						slots: [{
							start: "09:00",
							end: "17:00"
						}]
					}
				],
				bookingLimitsPerDay: 6
			});
			console.log("[Seed] Initial availability schedule provisioned for root admin.");
		} else {
			const admin = await User_default.findOne({ role: "ADMIN" });
			if (admin) admin._id;
		}
		if (await Service_default.countDocuments() === 0) {
			console.log("[Seed] Seeding core agency services...");
			const defaultServices = [
				{
					name: "Discovery Call",
					slug: "discovery-call",
					duration: 30,
					description: "A 30-minute introductory sync to understand your engineering goals, project criteria, and operational vision.",
					price: 0,
					meetingType: "Google Meet",
					colorTag: "zinc",
					bufferTime: 15,
					isEnabled: true
				},
				{
					name: "Website Design",
					slug: "website-design",
					duration: 60,
					description: "Premium, bespoke product design and creative art direction mapping your enterprise or SaaS web architecture.",
					price: 1500,
					meetingType: "Google Meet",
					colorTag: "indigo",
					bufferTime: 15,
					isEnabled: true
				},
				{
					name: "Web Development",
					slug: "web-development",
					duration: 60,
					description: "Sleek frontend development engineering using Next.js/React and high-performance server logic backend integration.",
					price: 2500,
					meetingType: "Google Meet",
					colorTag: "emerald",
					bufferTime: 15,
					isEnabled: true
				},
				{
					name: "AI Applications",
					slug: "ai-applications",
					duration: 90,
					description: "In-depth engineering strategy and implementation call for generative AI systems, agents, LLMs, and workflow automation.",
					price: 3500,
					meetingType: "Google Meet",
					colorTag: "purple",
					bufferTime: 30,
					isEnabled: true
				},
				{
					name: "App Development",
					slug: "app-development",
					duration: 90,
					description: "High-end native/cross-platform app engineering sessions defining layouts, state machines, and app store deployment tracks.",
					price: 4e3,
					meetingType: "Google Meet",
					colorTag: "rose",
					bufferTime: 30,
					isEnabled: true
				},
				{
					name: "SEO Optimization",
					slug: "seo-optimization",
					duration: 45,
					description: "Audit crawl, structural tuning, performance boost, and authority roadmap outlining organic index growth.",
					price: 800,
					meetingType: "Google Meet",
					colorTag: "amber",
					bufferTime: 15,
					isEnabled: true
				}
			];
			await Service_default.insertMany(defaultServices);
			console.log(`[Seed] Successfully provisioned ${defaultServices.length} default agency services.`);
		}
	} catch (error) {
		console.error("[Seed] Error seeding database:", error);
	}
}
//#endregion
//#region server/api-entry.ts
dotenv.config();
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var isConnected = false;
var lastDbError = null;
async function connectDB() {
	if (isConnected && mongoose.connection.readyState === 1) return;
	const MONGO_URI = process.env.MONGO_URI;
	if (!MONGO_URI) {
		const errStr = "MONGO_URI is not set in environment variables.";
		lastDbError = errStr;
		throw new Error(errStr);
	}
	try {
		await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5e3 });
		isConnected = true;
		lastDbError = null;
		console.log("[DB] Connected to MongoDB via Serverless Wrapper");
		await seedDatabase();
	} catch (err) {
		isConnected = false;
		lastDbError = err.message || String(err);
		console.error("[DB Error] Connection failed:", lastDbError);
		throw err;
	}
}
app.use(async (req, res, next) => {
	try {
		await connectDB();
		next();
	} catch (err) {
		console.error("[Middleware DB Connection Failure]:", err.message);
		if (req.path === "/api/db-status") next();
		else res.status(500).json({
			error: "Database connection failed",
			details: err.message
		});
	}
});
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	if (req.method === "OPTIONS") {
		res.status(200).end();
		return;
	}
	next();
});
app.use((req, res, next) => {
	const start = Date.now();
	res.on("finish", () => {
		const duration = Date.now() - start;
		if (req.path.startsWith("/api")) console.log(`[Serverless] ${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
	});
	next();
});
setupRoutes(app);
app.get("/api/db-status", (req, res) => {
	res.json({
		status: [
			"disconnected",
			"connected",
			"connecting",
			"disconnecting"
		][mongoose.connection.readyState],
		readyState: mongoose.connection.readyState,
		dbName: mongoose.connection.name || "N/A",
		lastDbError,
		mongoUriSet: !!process.env.MONGO_URI,
		resendKeySet: !!process.env.RESEND_API_KEY,
		fromEmail: process.env.FROM_EMAIL || "NOT SET",
		adminEmail: process.env.ADMIN_EMAIL || "NOT SET",
		nodeEnv: process.env.NODE_ENV || "development"
	});
});
//#endregion
export { app as default };
