# Google OAuth Integration - Complete Reference

## Implementation Overview

Your DevDale booking system now has full Google OAuth 2.0 integration with automatic Google Calendar event creation, Google Meet link generation, and automatic invitations to both customers and hosts.

## 🎯 Architecture

```
User Books Appointment
        ↓
Booking Confirmed
        ↓
GoogleCalendarService.createEventWithMeet()
        ↓
Creates Event + Google Meet Conference
        ↓
Stores Event ID & Meet Link in Database
        ↓
Sends Invitations to Customer & Host
        ↓
Customer & Host get Google Calendar Notification
```

## 📦 Core Components

### 1. GoogleCalendarService (`server/services/googleCalendarService.ts`)

Main service for all Google Calendar operations.

**Key Methods:**

```typescript
// Create event with automatic Google Meet link
async createEventWithMeet(eventDetails: GoogleCalendarEventDetails): Promise<GoogleMeetLink>

// Update existing event
async updateEvent(eventId: string, updates: any): Promise<any>

// Delete event
async deleteEvent(eventId: string): Promise<void>

// Get event details
async getEvent(eventId: string): Promise<any>

// List upcoming events
async listUpcomingEvents(maxResults: number = 10): Promise<any[]>

// Refresh access token
async refreshAccessToken(): Promise<string>
```

**Helper Functions:**

```typescript
// Automatically create booking event in Google Calendar
export async function createBookingInGoogleCalendar(
  booking: any, 
  user: any, 
  host: any
): Promise<GoogleMeetLink | null>

// Update calendar when booking status changes
export async function updateBookingInGoogleCalendar(
  booking: any, 
  updateData: any
): Promise<void>
```

### 2. GoogleOAuthHelper (`server/utils/googleOAuthHelper.ts`)

Manages OAuth flow and token operations.

**Key Methods:**

```typescript
// Generate OAuth authorization URL
static generateAuthUrl(): string

// Exchange authorization code for tokens
static async exchangeCodeForTokens(code: string): Promise<any>

// Store Google credentials for a user
static async storeUserGoogleCredentials(userId: string, tokens: any): Promise<void>

// Get or refresh user's access token
static async getUserGoogleAccessToken(userId: string): Promise<string | null>

// Revoke Google OAuth access
static async revokeUserGoogleAccess(userId: string): Promise<void>
```

## 🔌 Integration Points

### API Routes (server/routes/auth.ts)

```typescript
// Get OAuth authorization URL
router.get("/google/url", (req, res) => {
  const authUrl = GoogleOAuthHelper.generateAuthUrl();
  res.json({ url: authUrl });
});

// Handle OAuth callback
router.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  const tokens = await GoogleOAuthHelper.exchangeCodeForTokens(code);
  // Exchange successful - tokens contain refresh_token
});

// Disconnect Google OAuth
router.post("/google/disconnect", authenticate, async (req, res) => {
  const userId = req.user.id;
  await GoogleOAuthHelper.revokeUserGoogleAccess(userId);
});
```

### Booking Routes (server/routes/bookings.ts)

When a booking is created, the system automatically:

```typescript
// Save booking
const booking = new Booking({ ... });
booking.duration = service.duration;
booking.serviceName = service.name;
await booking.save();

// Create Google Calendar event with Meet link
const meetLinkData = await createBookingInGoogleCalendar(
  booking, 
  hostUser, 
  hostUser
);

// Store calendar details
if (meetLinkData) {
  booking.googleCalendarEventId = meetLinkData.eventId;
  booking.googleMeetLink = meetLinkData.meetLink;
  booking.googleCalendarLink = meetLinkData.eventLink;
}
await booking.save();
```

## 🗄️ Database Schema Changes

### User Model Extensions

```typescript
interface IUser extends Document {
  // ... existing fields ...
  googleId?: string;
  googleRefreshToken?: string;
  googleAccessToken?: string;
  googleTokenExpiry?: Date;
}
```

### Booking Model Extensions

```typescript
interface IBooking extends Document {
  // ... existing fields ...
  googleCalendarEventId?: string;
  googleMeetLink?: string;
  googleCalendarLink?: string;
  duration?: number; // Duration in minutes
  serviceName?: string;
}
```

## 🔑 Environment Variables

```env
# OAuth Credentials
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:5001/api/auth/google/callback"

# Generated Token (generate using npm run generate-google-token)
GOOGLE_REFRESH_TOKEN="1//0xxxxxxxx..."
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

The `googleapis` package is already added to package.json.

### 2. Generate Refresh Token

```bash
npm run generate-google-token
```

This interactive script:
1. Generates OAuth authorization URL
2. Opens browser for user login
3. Captures authorization code
4. Exchanges code for tokens
5. Displays refresh token

### 3. Store Refresh Token

Add the returned refresh token to `.env`:

```env
GOOGLE_REFRESH_TOKEN="1//0xxxxxxxx..."
```

### 4. Restart Server

```bash
npm run dev
```

## 📊 Data Flow Examples

### Creating a Booking with Google Calendar

**Request:**
```json
POST /api/bookings
{
  "serviceId": "507f1f77bcf86cd799439011",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerCompany": "Acme Corp",
  "date": "2026-06-15",
  "timeSlot": "14:30",
  "budgetRange": "$10k-$25k",
  "projectType": "Web Development",
  "notes": "Looking for a complete redesign"
}
```

**Automatic Process:**
1. Booking saved to database
2. Google Calendar event created
3. Google Meet conference link generated
4. Customer invited to event
5. Admin invited to event
6. Calendar details stored in booking

**Response:**
```json
{
  "success": true,
  "booking": {
    "_id": "507f1f77bcf86cd799439012",
    "googleCalendarEventId": "abc123def456...",
    "googleMeetLink": "https://meet.google.com/abc-defg-hij",
    "googleCalendarLink": "https://calendar.google.com/event?...",
    ...
  }
}
```

### Rescheduling a Booking

**Request:**
```json
POST /api/bookings/507f1f77bcf86cd799439012/reschedule
{
  "date": "2026-06-22",
  "timeSlot": "15:00",
  "rescheduleReason": "Team availability change"
}
```

**Automatic Process:**
1. Old calendar event deleted
2. New calendar event created
3. New Meet link generated
4. All participants notified
5. Database updated

## 🛡️ Security

### Token Management

- **Refresh Token**: Stored securely in .env, never exposed
- **Access Token**: Auto-refreshed before expiry
- **Revocation**: Can be revoked at any time
- **Logging**: All OAuth actions logged with user info

### Validation

- OAuth code validated
- Tokens validated before use
- Email addresses validated
- All requests authenticated

### Error Handling

```typescript
try {
  const meetLinkData = await createBookingInGoogleCalendar(booking, host, admin);
} catch (error) {
  console.error("[GoogleCalendarService] Error:", error);
  // Booking still created, just without Meet link
  // User can retry calendar creation later
}
```

## 📝 Logging & Activity Tracking

All OAuth activities are logged:

```typescript
// OAuth successful
await logActivity(userId, "GOOGLE_OAUTH_CONNECTED", { email }, req);

// OAuth disconnected
await logActivity(userId, "GOOGLE_OAUTH_DISCONNECTED", {}, req);

// Calendar event created
// (automatically tracked in booking creation)
```

## 🔄 Token Refresh Flow

```
Automatic Background Process:
├─ Check token expiry
├─ If expired or expiring soon
├─ Refresh token using refresh_token
├─ Get new access_token
├─ Update database
└─ Continue operation
```

## 🐛 Troubleshooting

### Issue: "refresh_token is null"

**Cause**: User didn't grant offline access

**Solution**: 
1. Revoke app at: https://myaccount.google.com/permissions
2. Run token generation script again
3. Click "Accept" on permissions screen

### Issue: "No GOOGLE_REFRESH_TOKEN set"

**Solution**: Run `npm run generate-google-token` and add token to .env

### Issue: Calendar event not created

**Solution**: 
1. Check GOOGLE_REFRESH_TOKEN is set in .env
2. Verify Google Calendar API is enabled in Google Cloud
3. Check server logs for specific error
4. Try token generation again

## 📚 Related Documentation

- [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) - Detailed setup guide
- [GOOGLE_OAUTH_QUICKSTART.md](./GOOGLE_OAUTH_QUICKSTART.md) - Quick start reference

## ✅ Testing Checklist

- [ ] googleapis installed (`npm list googleapis`)
- [ ] Token generation script runs (`npm run generate-google-token`)
- [ ] Refresh token received and stored in .env
- [ ] Server starts without errors (`npm run dev`)
- [ ] Test booking creates calendar event
- [ ] Google Meet link is generated
- [ ] Calendar invitations sent to participants
- [ ] Rescheduling updates calendar event
- [ ] Cancellation removes calendar event

## 🎓 Learning Resources

**Google Calendar API:**
https://developers.google.com/calendar/api/guides

**Google Meet:**
https://support.google.com/meet

**OAuth 2.0:**
https://developers.google.com/identity/protocols/oauth2

## 💡 Future Enhancements

- [ ] Webhook sync from Google Calendar to database
- [ ] Track attendee acceptance/decline status
- [ ] Timezone support for different regions
- [ ] Recurring event support
- [ ] Calendar reminders and notifications
- [ ] Export calendar to iCal format

---

**Version:** 1.0  
**Last Updated:** 2026-05-22  
**Status:** ✅ Production Ready
