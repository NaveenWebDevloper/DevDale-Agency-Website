# Google OAuth & Google Calendar Integration Setup Guide

## Overview

This guide walks you through setting up Google OAuth to generate a refresh token and automatically create Google Calendar events with Meet links for all bookings.

## Prerequisites

- Google Cloud Project with Calendar API enabled
- Google OAuth Client ID and Client Secret (already added to `.env`)
- Node.js environment configured

## Step 1: Verify Your Environment Variables

Make sure your `.env` file has the Google OAuth credentials:

```env
GOOGLE_CLIENT_ID="your_client_id_here"
GOOGLE_CLIENT_SECRET="your_client_secret_here"
GOOGLE_REDIRECT_URI="http://localhost:5001/api/auth/google/callback"
GOOGLE_REFRESH_TOKEN="will_be_generated_below"
```

## Step 2: Generate Google Refresh Token

Run the token generation script:

```bash
npm run generate-google-token
```

### What the script will do:

1. **Generate Authorization URL** - It will display a URL to click
2. **Open the URL in your browser** - You'll be taken to Google Login
3. **Grant Permissions** - Approve calendar access
4. **Get Authorization Code** - Google redirects you with a code
5. **Exchange Code for Tokens** - The script exchanges the code for refresh token

### Expected Output:

```json
{
  "access_token": "ya29...",
  "refresh_token": "1//0xxxxxxxx...",
  "scope": "https://www.googleapis.com/auth/calendar",
  "expiry_date": 1234567890
}
```

## Step 3: Store Refresh Token

Copy the `refresh_token` value and add it to your `.env`:

```env
GOOGLE_REFRESH_TOKEN="1//0xxxxxxxx..."
```

## Step 4: Restart Your Server

```bash
npm run dev
```

## Features Implemented

### ✅ Automatic Google Calendar Event Creation

When a booking is confirmed:
1. **Event is automatically created** in Google Calendar
2. **Google Meet link is generated** with video conferencing
3. **Customer is invited** automatically
4. **Admin/host is invited** automatically
5. **Event details stored** in booking database

### ✅ Automatic Invitations Sent

- **Customer receives**: Calendar invitation + Google Meet link
- **Admin/Host receives**: Calendar invitation + Meet link
- All invitations sent via Google Calendar API

### ✅ Secure Token Management

- **Access Token**: Automatically refreshed in the background
- **Refresh Token**: Securely stored and never exposed
- **Token Expiry**: Monitored and refreshed before expiration

### ✅ Automatic Event Updates

When bookings are rescheduled:
1. **Old event is deleted** from calendar
2. **New event is created** with updated time
3. **New Meet link** is generated
4. **Participants notified** of reschedule

### ✅ Event Cancellation

When bookings are cancelled:
1. **Calendar event is deleted**
2. **Invitations revoked** from all attendees
3. **Database updated** to reflect cancellation

## Google OAuth API Endpoints

### Get Authorization URL

```bash
GET /api/auth/google/url
```

**Response:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### Handle OAuth Callback

```bash
GET /api/auth/google/callback?code=XXXX
```

This is handled automatically. Google redirects here after user approves permissions.

### Disconnect Google Account

```bash
POST /api/auth/google/disconnect
Authorization: Bearer <token>
```

Removes Google OAuth access for a user.

## Database Schema Updates

### User Model
New fields added for Google OAuth:
```typescript
{
  googleId?: string;
  googleRefreshToken?: string;
  googleAccessToken?: string;
  googleTokenExpiry?: Date;
}
```

### Booking Model
New fields for Google Calendar integration:
```typescript
{
  googleCalendarEventId?: string;
  googleMeetLink?: string;
  googleCalendarLink?: string;
  duration?: number; // Event duration in minutes
}
```

## Error Handling

### Token Refresh Issues

If you get "No refresh token received":
1. Go to: https://myaccount.google.com/permissions
2. Find "DevDale" in connected apps
3. Click and remove access
4. Run token generation script again

### Calendar Event Creation Fails

The system has built-in fallback:
- If new GoogleCalendarService fails, it tries old CalendarService
- If both fail, booking is still created without Meet link
- Error is logged for debugging

### Access Token Expired

Automatic handling:
- System checks token expiry on each booking
- Automatically refreshes token if expired
- No manual intervention needed

## Webhook Events (Optional Enhancement)

Future enhancements could include:
- Real-time booking notifications via Google Calendar webhooks
- Sync cancelled events from Google Calendar to database
- Track attendee responses (Accept/Decline/Maybe)

## Troubleshooting

### Issue: "GOOGLE_REFRESH_TOKEN not set"

**Solution:** Make sure you ran the token generation script and added the token to `.env`

### Issue: "Failed to create Google Calendar event"

**Solution:** Check that:
1. Google Calendar API is enabled in Google Cloud
2. Refresh token is valid
3. Check server logs for error details

### Issue: "No refresh token received"

**Solution:**
1. Revoke app access: https://myaccount.google.com/permissions
2. Run script again
3. Make sure to click "Accept" on permissions screen

### Issue: Invalid redirect URI

**Solution:** Make sure GOOGLE_REDIRECT_URI in `.env` matches the registered URI in Google Cloud Console

## Security Best Practices

✅ **What We Do:**
- Store refresh token securely in environment variables
- Never log or expose refresh token
- Rotate access tokens automatically
- Validate all OAuth requests
- Log all auth activities

✅ **What You Should Do:**
- Keep `.env` file secret and not in version control
- Use different credentials for dev/staging/production
- Regularly rotate credentials
- Monitor auth logs for suspicious activity
- Never share refresh token with anyone

## Service Files

### GoogleCalendarService (`server/services/googleCalendarService.ts`)
- `createEventWithMeet()` - Creates event with Meet link
- `updateEvent()` - Updates existing event
- `deleteEvent()` - Deletes event
- `getEvent()` - Fetches event details
- `listUpcomingEvents()` - Lists calendar events

### GoogleOAuthHelper (`server/utils/googleOAuthHelper.ts`)
- `generateAuthUrl()` - Creates OAuth authorization URL
- `exchangeCodeForTokens()` - Converts code to tokens
- `storeUserGoogleCredentials()` - Saves tokens to user
- `getUserGoogleAccessToken()` - Gets/refreshes access token
- `revokeUserGoogleAccess()` - Removes Google access

## Next Steps

1. ✅ Install googleapis: `npm install googleapis`
2. ✅ Run token generation: `npm run generate-google-token`
3. ✅ Add refresh token to `.env`
4. ✅ Restart server: `npm run dev`
5. ✅ Create a test booking - it should auto-create calendar event!

## Support

For issues or questions:
1. Check the error logs in server console
2. Verify .env file has correct values
3. Check that Google Calendar API is enabled
4. Review token generation script output

---

**Created:** 2026-05-22  
**Version:** 1.0  
**Integration Status:** ✅ Complete
