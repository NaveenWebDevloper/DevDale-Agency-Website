#!/usr/bin/env node

/**
 * Google OAuth Token Generator - Workaround Version
 * This version uses direct APIs without requiring googleapis package
 * 
 * Instructions:
 * 1. Run: node scripts/generate-token-simple.cjs
 * 2. Click the generated URL
 * 3. Login and grant permissions
 * 4. Copy the code from the redirect URL
 * 5. Paste it when prompted
 */

const readline = require('readline');
const https = require('https');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

// Read .env file manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const env = {};
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  });
  return env;
}

const env = loadEnv();
const CLIENT_ID = env.GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID";
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET || "YOUR_CLIENT_SECRET";
const REDIRECT_URI = "http://localhost:5001/api/auth/google/callback";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events"
];

function generateAuthUrl() {
  const scope = SCOPES.join(" ");
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: scope,
    access_type: "offline",
    prompt: "consent"
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function exchangeCodeForToken(code) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      code: code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const options = {
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(`Google OAuth Error: ${response.error_description}`));
          } else {
            resolve(response);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

function promptForCode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\n✓ Paste your authorization code here: ', async (code) => {
    rl.close();

    if (!code) {
      console.error('❌ No code provided. Exiting.');
      process.exit(1);
    }

    try {
      console.log('\n[Processing] Exchanging authorization code for tokens...\n');
      const tokens = await exchangeCodeForToken(code);

      console.log("=".repeat(80));
      console.log("✅ SUCCESS! Your Google OAuth Tokens:");
      console.log("=".repeat(80));
      console.log("\nTokens:\n");
      console.log(JSON.stringify(tokens, null, 2));

      console.log("\n" + "-".repeat(80));
      console.log("IMPORTANT: Add this to your .env file:");
      console.log("-".repeat(80));
      console.log(`\nGOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"\n`);
      console.log("Keep this refresh token secure! It allows your app to");
      console.log("access Google Calendar on behalf of your account.\n");
      console.log("-".repeat(80) + "\n");

      process.exit(0);
    } catch (error) {
      console.error('\n❌ Error exchanging token:', error.message);
      console.error('\nPlease make sure you copied the authorization code correctly.');
      process.exit(1);
    }
  });
}

async function main() {
  console.clear();
  console.log('\n🔐 Google Calendar OAuth Token Generator\n');

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

  const url = generateAuthUrl();

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
  console.log("-".repeat(80));

  promptForCode();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
