# Google OAuth & Calendar Integration - Quick Start

## ✅ Completed Setup

All components have been installed and configured for full Google Calendar integration with automatic Google Meet link generation.

## 📋 What's Been Done

### 1. **Dependencies Installed**
- ✅ `googleapis` package added to package.json

### 2. **Services Created**
- ✅ `GoogleCalendarService` - Handles all Google Calendar operations
- ✅ `GoogleOAuthHelper` - Manages OAuth flow and token management

### 3. **API Routes Added**
- ✅ `GET /api/auth/google/url` - Generate authorization URL
- ✅ `GET /api/auth/google/callback` - Handle OAuth callback
- ✅ `POST /api/auth/google/disconnect` - Disconnect Google account

### 4. **Database Updates**
- ✅ User model extended with Google OAuth fields
- ✅ Booking model extended with Google Calendar fields

### 5. **Scripts Added**
- ✅ `scripts/generate-google-token.ts` - Interactive token generation script
- ✅ `npm run generate-google-token` - NPM script command

### 6. **Automatic Features**
- ✅ Bookings automatically create Google Calendar events
- ✅ Google Meet links automatically generated for each event
- ✅ Customers and hosts automatically invited
- ✅ Calendar events updated when bookings are rescheduled
- ✅ Calendar events deleted when bookings are cancelled

## 🚀 Getting Started (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Generate Refresh Token
```bash
npm run generate-google-token
```

**What to do:**
1. Click the generated URL
2. Login with your Google account
3. Grant calendar permissions
4. Copy the authorization code from the redirect
5. Paste it in the terminal

### Step 3: Add Token to .env
```env
GOOGLE_REFRESH_TOKEN="1//0xxxxxxxx..."
```

Then restart your server:
```bash
npm run dev
```

## 📊 How It Works

### When a Booking is Created:

```
Customer Creates Booking
        ↓
Booking Saved to Database
        ↓
Google Calendar Event Created
        ↓
Google Meet Link Generated
        ↓
Invitations Sent (Customer + Host)
        ↓
Meet Link Stored in Database
```

### Automatic Features:

**✅ Token Management**
- Access tokens automatically refreshed
- No manual token renewal needed
- Secure background handling

**✅ Event Synchronization**
- Booking created → Calendar event created
- Booking rescheduled → Calendar event updated
- Booking cancelled → Calendar event deleted

**✅ Invitation Handling**
- Customers automatically invited to Google Meet
- Admin/Host automatically invited
- All calendar notifications enabled

## 🔐 Security Features

- Refresh token stored securely in environment
- Access tokens auto-refresh before expiry
- All auth activities logged
- OAuth flow validated
- Credentials never logged or exposed

## 📝 API Endpoints

### Get Authorization URL
```bash
GET http://localhost:5001/api/auth/google/url
```

### OAuth Callback (Automatic)
```bash
GET http://localhost:5001/api/auth/google/callback?code=XXXX
```

### Disconnect Google
```bash
POST http://localhost:5001/api/auth/google/disconnect
Authorization: Bearer <access_token>
```

## 📂 Files Created/Modified

### New Files:
- `server/services/googleCalendarService.ts` - Calendar operations
- `server/utils/googleOAuthHelper.ts` - OAuth management
- `scripts/generate-google-token.ts` - Token generator

### Modified Files:
- `server/models/User.ts` - Added Google OAuth fields
- `server/models/Booking.ts` - Added calendar fields
- `server/routes/auth.ts` - Added OAuth endpoints
- `server/routes/bookings.ts` - Added calendar integration
- `package.json` - Added googleapis dependency
- `.env` - Added Google configuration

## 🧪 Test Your Setup

1. Create a test booking
2. Check Google Calendar for new event
3. Verify Google Meet link is present
4. Check that invitations were sent

## 🐛 Troubleshooting

**Q: No refresh token received?**
A: Revoke access at myaccount.google.com/permissions and try again

**Q: Token generation script not found?**
A: Run `npm install` first to install all dependencies

**Q: Calendar event not created?**
A: Check .env has GOOGLE_REFRESH_TOKEN set and Google Calendar API is enabled

## 📚 Documentation

See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed setup guide.

## 🎯 Next Steps

1. ✅ Run `npm install` (if not done)
2. ✅ Run `npm run generate-google-token`
3. ✅ Add refresh token to `.env`
4. ✅ Start server: `npm run dev`
5. ✅ Test by creating a booking

---

**Ready to go!** Your Google Calendar integration is fully set up and ready to use. 🎉
