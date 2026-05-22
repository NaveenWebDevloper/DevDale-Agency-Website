import dotenv from "dotenv";

dotenv.config();

/* ────────────────────────────────────────────────────────────────
 *  Types
 * ──────────────────────────────────────────────────────────────── */
interface CalendarEventInput {
  summary: string;
  description: string;
  startDateTime: string; // ISO string
  endDateTime: string;   // ISO string
  attendeeEmail: string;
  attendeeName: string;
}

interface CalendarEventResult {
  googleEventId: string;
  googleMeetLink: string;
  isReal: boolean; // true = from Google API, false = mock
}

/* ────────────────────────────────────────────────────────────────
 *  CalendarService
 *  — Handles Google Calendar event CRUD, Meet link generation,
 *    attendee invitations, and free/busy conflict checks.
 *  — Falls back gracefully to mock when credentials are absent.
 * ──────────────────────────────────────────────────────────────── */
export class CalendarService {

  /** Cache the access token and its expiry so we don't refresh on every call */
  private static cachedAccessToken: string | null = null;
  private static tokenExpiresAt: number = 0;

  /**
   * Are Google Calendar credentials fully configured?
   */
  static get isConfigured(): boolean {
    return !!(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
    );
  }

  /**
   * Refreshes OAuth2 access token using the refresh token.
   * Tokens are cached in-memory and re-used until 60s before expiry.
   */
  private static async getAccessToken(): Promise<string | null> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      return null;
    }

    // Return cached token if still valid (with 60s safety margin)
    if (this.cachedAccessToken && Date.now() < this.tokenExpiresAt - 60_000) {
      return this.cachedAccessToken;
    }

    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[CalendarService] Failed to refresh access token:", JSON.stringify(errorData));
        this.cachedAccessToken = null;
        return null;
      }

      const data = await response.json();
      this.cachedAccessToken = data.access_token;
      // Google tokens typically expire in 3600s; use the actual value if provided
      this.tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;

      console.log("[CalendarService] Access token refreshed successfully.");
      return this.cachedAccessToken;
    } catch (error) {
      console.error("[CalendarService] Error fetching access token:", error);
      this.cachedAccessToken = null;
      return null;
    }
  }

  /* ──────────────────────────────────────────────────────────────
   *  CREATE EVENT
   * ────────────────────────────────────────────────────────────── */

  /**
   * Creates a Google Calendar event with a real Google Meet link
   * and sends invitations to attendees.
   * Falls back to a mock event when credentials are missing or the API fails.
   */
  static async createEvent(input: CalendarEventInput): Promise<CalendarEventResult> {
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
          timeZone: "UTC",
        },
        end: {
          dateTime: input.endDateTime,
          timeZone: "UTC",
        },
        attendees: [
          { email: input.attendeeEmail, displayName: input.attendeeName },
        ],
        conferenceData: {
          createRequest: {
            requestId: `devdale-meet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
        // Send email reminders to attendees
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 60 },
            { method: "popup", minutes: 15 },
          ],
        },
      };

      // sendUpdates=all → Google sends calendar invitations to all attendees automatically
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[CalendarService] Google Calendar event creation failed:", JSON.stringify(errorData));
        console.warn("[CalendarService] Falling back to mock event.");
        return this.generateMockEvent(input);
      }

      const data = await response.json();

      // Extract the real Meet link from conferenceData
      let meetLink = "";
      if (data.conferenceData?.entryPoints) {
        const videoEntry = data.conferenceData.entryPoints.find(
          (ep: any) => ep.entryPointType === "video"
        );
        if (videoEntry) {
          meetLink = videoEntry.uri;
        }
      }

      // If the event was created but Meet link wasn't attached, use hangoutLink fallback
      if (!meetLink && data.hangoutLink) {
        meetLink = data.hangoutLink;
      }

      // Last-resort fallback: generate a mock meet link but still use the real event ID
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
        isReal: true,
      };
    } catch (error) {
      console.error("[CalendarService] Google Calendar API error. Falling back to mock:", error);
      return this.generateMockEvent(input);
    }
  }

  /* ──────────────────────────────────────────────────────────────
   *  FREE/BUSY — Conflict Prevention
   * ────────────────────────────────────────────────────────────── */

  /**
   * Queries Google Calendar's freeBusy API for the host's primary calendar.
   * Returns busy time blocks that the availability engine uses to prevent conflicts.
   */
  static async getBusySlots(startISO: string, endISO: string): Promise<{ start: string; end: string }[]> {
    if (!this.isConfigured) return [];

    const accessToken = await this.getAccessToken();
    if (!accessToken) return [];

    try {
      const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeMin: startISO,
          timeMax: endISO,
          items: [{ id: "primary" }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn("[CalendarService] Google FreeBusy query failed:", errorText);
        return [];
      }

      const data = await response.json();
      const busy = data.calendars?.primary?.busy || [];
      console.log(`[CalendarService] FreeBusy check: ${busy.length} busy block(s) found for ${startISO.split("T")[0]}`);

      return busy.map((b: any) => ({
        start: b.start,
        end: b.end,
      }));
    } catch (error) {
      console.error("[CalendarService] Error fetching freebusy info:", error);
      return [];
    }
  }

  /* ──────────────────────────────────────────────────────────────
   *  DELETE EVENT
   * ────────────────────────────────────────────────────────────── */

  /**
   * Deletes a Google Calendar event. Sends cancellation notifications to attendees.
   */
  static async deleteEvent(eventId: string): Promise<boolean> {
    if (eventId.startsWith("mock-")) {
      console.log("[CalendarService] Mock event deleted:", eventId);
      return true;
    }

    if (!this.isConfigured) return false;

    const accessToken = await this.getAccessToken();
    if (!accessToken) return false;

    try {
      // sendUpdates=all → Google sends cancellation emails to all attendees
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

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

  /* ──────────────────────────────────────────────────────────────
   *  UPDATE EVENT (for reschedule flows)
   * ────────────────────────────────────────────────────────────── */

  /**
   * Updates an existing Google Calendar event with new times.
   * Preserves the Meet link and sends update notifications to attendees.
   */
  static async updateEvent(
    eventId: string,
    input: CalendarEventInput
  ): Promise<CalendarEventResult> {
    if (eventId.startsWith("mock-")) {
      return this.generateMockEvent(input);
    }

    if (!this.isConfigured) {
      return this.generateMockEvent(input);
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      return this.generateMockEvent(input);
    }

    try {
      const patchBody = {
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.startDateTime, timeZone: "UTC" },
        end: { dateTime: input.endDateTime, timeZone: "UTC" },
        attendees: [
          { email: input.attendeeEmail, displayName: input.attendeeName },
        ],
      };

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patchBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[CalendarService] Event update failed:", JSON.stringify(errorData));
        return this.generateMockEvent(input);
      }

      const data = await response.json();
      let meetLink = "";

      if (data.conferenceData?.entryPoints) {
        const videoEntry = data.conferenceData.entryPoints.find(
          (ep: any) => ep.entryPointType === "video"
        );
        if (videoEntry) meetLink = videoEntry.uri;
      }
      if (!meetLink && data.hangoutLink) meetLink = data.hangoutLink;
      if (!meetLink) {
        meetLink = `https://meet.google.com/dev-${this.randomString(3)}-${this.randomString(4)}-${this.randomString(3)}`;
      }

      console.log(`[CalendarService] ✅ Calendar event updated: ${data.id}`);

      return {
        googleEventId: data.id,
        googleMeetLink: meetLink,
        isReal: true,
      };
    } catch (error) {
      console.error("[CalendarService] Event update error. Falling back to mock:", error);
      return this.generateMockEvent(input);
    }
  }

  /* ──────────────────────────────────────────────────────────────
   *  MOCK GENERATOR (fallback)
   * ────────────────────────────────────────────────────────────── */

  private static generateMockEvent(input: CalendarEventInput): CalendarEventResult {
    const mockId = `mock-ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const mockMeet = `https://meet.google.com/dd-${this.randomString(3)}-${this.randomString(4)}-${this.randomString(3)}`;

    console.log("[CalendarService] Generated mock meeting details:", { mockId, mockMeet });

    return {
      googleEventId: mockId,
      googleMeetLink: mockMeet,
      isReal: false,
    };
  }

  private static randomString(length: number): string {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let str = "";
    for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
  }
}
