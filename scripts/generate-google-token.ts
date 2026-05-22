import { google } from "googleapis";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "YOUR_CLIENT_SECRET";
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5001/api/auth/google/callback";

/**
 * This script generates a Google OAuth refresh token for your application
 * 
 * Steps:
 * 1. Run: npm run generate-google-token (or ts-node scripts/generate-google-token.ts)
 * 2. Open the generated URL in your browser
 * 3. Login with your Google account
 * 4. Grant permissions
 * 5. Copy the authorization code from the redirect URL
 * 6. Paste it in the terminal
 * 7. The refresh token will be displayed and should be added to .env as GOOGLE_REFRESH_TOKEN
 */

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const scopes = [
  "https://www.googleapis.com/auth/calendar", // For Calendar API access
  "https://www.googleapis.com/auth/calendar.events", // For Event management
];

function generateAuthUrl() {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline", // This is important to get the refresh_token
    scope: scopes,
    prompt: "consent", // Force consent screen to ensure new token
  });

  console.log("\n" + "=".repeat(80));
  console.log("Google OAuth Token Generation");
  console.log("=".repeat(80));
  console.log("\n✓ Step 1: Open this URL in your browser:\n");
  console.log(url);
  console.log("\n" + "-".repeat(80));
  console.log("✓ Step 2: Login with your Google account");
  console.log("✓ Step 3: Grant calendar permissions");
  console.log("✓ Step 4: You'll be redirected to a URL like:");
  console.log("   http://localhost:5001/api/auth/google/callback?code=XXXXXX...");
  console.log("\n✓ Step 5: Copy the authorization code and paste it below:");
  console.log("-".repeat(80) + "\n");
}

async function getTokenFromCode(code: string) {
  try {
    console.log("\n[Processing] Exchanging authorization code for tokens...\n");
    const { tokens } = await oauth2Client.getToken(code);

    console.log("=".repeat(80));
    console.log("✓ SUCCESS! Your Google OAuth Tokens:");
    console.log("=".repeat(80));
    console.log("\nTokens:\n");
    console.log(JSON.stringify(tokens, null, 2));

    console.log("\n" + "-".repeat(80));
    console.log("IMPORTANT: Add this to your .env file:");
    console.log("-".repeat(80));
    console.log(
      `\nGOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"\n`
    );
    console.log(
      "Keep this refresh token secure! It allows your app to"
    );
    console.log(
      "access Google Calendar on behalf of your account."
    );
    console.log("-".repeat(80) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error exchanging token:", error);
    console.error(
      "\nPlease make sure you copied the authorization code correctly."
    );
    process.exit(1);
  }
}

function promptForCode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Paste your authorization code here: ", async (code) => {
    rl.close();

    if (!code) {
      console.error("❌ No code provided. Exiting.");
      process.exit(1);
    }

    await getTokenFromCode(code);
  });
}

// Main execution
console.clear();
console.log("\n🔐 Google Calendar OAuth Token Generator\n");

if (!CLIENT_ID || CLIENT_ID === "YOUR_CLIENT_ID") {
  console.error("❌ Error: GOOGLE_CLIENT_ID not set in .env file");
  console.error("Please set your Google OAuth credentials in .env:");
  console.error("  GOOGLE_CLIENT_ID=your_client_id");
  console.error("  GOOGLE_CLIENT_SECRET=your_client_secret");
  process.exit(1);
}

if (!CLIENT_SECRET || CLIENT_SECRET === "YOUR_CLIENT_SECRET") {
  console.error("❌ Error: GOOGLE_CLIENT_SECRET not set in .env file");
  process.exit(1);
}

generateAuthUrl();
promptForCode();
