import { google } from "googleapis";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();

export class GoogleOAuthHelper {
  /**
   * Get OAuth2 client instance
   */
  static getOAuthClient() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  static generateAuthUrl(): string {
    const oauth2Client = this.getOAuthClient();
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ];

    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  static async exchangeCodeForTokens(code: string): Promise<any> {
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
  static async storeUserGoogleCredentials(
    userId: string,
    tokens: any
  ): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        googleRefreshToken: tokens.refresh_token,
        googleAccessToken: tokens.access_token,
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      });
    } catch (error) {
      console.error("[GoogleOAuthHelper] Error storing credentials:", error);
      throw error;
    }
  }

  /**
   * Get or refresh user's Google access token
   */
  static async getUserGoogleAccessToken(userId: string): Promise<string | null> {
    try {
      const user = await User.findById(userId);

      if (!user || !user.googleRefreshToken) {
        return null;
      }

      // Check if token is still valid
      if (user.googleTokenExpiry && user.googleTokenExpiry > new Date()) {
        return user.googleAccessToken;
      }

      // Token expired, refresh it
      const oauth2Client = this.getOAuthClient();
      oauth2Client.setCredentials({
        refresh_token: user.googleRefreshToken,
      });

      const { credentials } = await oauth2Client.refreshAccessToken();

      // Update user with new access token
      await User.findByIdAndUpdate(userId, {
        googleAccessToken: credentials.access_token,
        googleTokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined,
      });

      return credentials.access_token;
    } catch (error) {
      console.error("[GoogleOAuthHelper] Error getting access token:", error);
      return null;
    }
  }

  /**
   * Revoke Google OAuth access for a user
   */
  static async revokeUserGoogleAccess(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);

      if (!user || !user.googleRefreshToken) {
        return;
      }

      const oauth2Client = this.getOAuthClient();
      await oauth2Client.revokeToken(user.googleRefreshToken);

      // Clear stored credentials
      await User.findByIdAndUpdate(userId, {
        googleRefreshToken: undefined,
        googleAccessToken: undefined,
        googleTokenExpiry: undefined,
      });
    } catch (error) {
      console.error("[GoogleOAuthHelper] Error revoking access:", error);
      // Don't throw - failing to revoke shouldn't break the flow
    }
  }
}
