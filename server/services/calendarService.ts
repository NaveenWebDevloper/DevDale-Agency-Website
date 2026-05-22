import dotenv from "dotenv";

dotenv.config();

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
}

export class CalendarService {
  /**
   * Refreshes OAuth2 access token using refresh token
   */
  private static async getAccessToken(): Promise<string | null> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      console.log("[CalendarService] Google credentials missing. Using mock generator.");
      return null;
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
        console.error("[CalendarService] Failed to refresh access token:", errorData);
        return null;
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("[CalendarService] Error fetching access token:", error);
      return null;
    }
  }

  /**
   * Creates a Google Calendar event with Google Meet link.
   * If credentials are not present or request fails, falls back gracefully to a mock event.
   */
  static async createEvent(input: CalendarEventInput): Promise<CalendarEventResult> {
    const accessToken = await this.getAccessToken();

    if (!accessToken) {
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
            requestId: `devdale-meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      };

      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
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
        console.warn("[CalendarService] Google Calendar Event creation failed. Falling back to mock.", errorData);
        return this.generateMockEvent(input);
      }

      const data = await response.json();

      // Extract Meet link from conferenceData
      let meetLink = "";
      if (data.conferenceData && data.conferenceData.entryPoints) {
        const meetEntryPoint = data.conferenceData.entryPoints.find(
          (ep: any) => ep.entryPointType === "video"
        );
        if (meetEntryPoint) {
          meetLink = meetEntryPoint.uri;
        }
      }

      // Fallback if google event succeeded but didn't return a meet link for some reason
      if (!meetLink) {
        meetLink = `https://meet.google.com/dev-${this.randomString(3)}-${this.randomString(4)}-${this.randomString(3)}`;
      }

      console.log("[CalendarService] Successfully created calendar event via Google API:", data.id);

      return {
        googleEventId: data.id,
        googleMeetLink: meetLink,
      };
    } catch (error) {
      console.error("[CalendarService] Google Calendar API threw error. Falling back to mock:", error);
      return this.generateMockEvent(input);
    }
  }

  /**
   * Deletes a calendar event
   */
  static async deleteEvent(eventId: string): Promise<boolean> {
    if (eventId.startsWith("mock-")) {
      console.log("[CalendarService] Mock event deleted:", eventId);
      return true;
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) return false;

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error("[CalendarService] Error deleting event:", error);
      return false;
    }
  }

  /**
   * Generates a beautifully formatted mock event and Meet link
   */
  private static generateMockEvent(input: CalendarEventInput): CalendarEventResult {
    const mockId = `mock-ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const mockMeet = `https://meet.google.com/dd-${this.randomString(3)}-${this.randomString(4)}-${this.randomString(3)}`;
    
    console.log("[CalendarService] Generated mock meeting details:", { mockId, mockMeet });

    return {
      googleEventId: mockId,
      googleMeetLink: mockMeet,
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
