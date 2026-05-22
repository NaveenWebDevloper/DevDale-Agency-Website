import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User";
import Booking from "../models/Booking";
import dotenv from "dotenv";

dotenv.config();

export interface GoogleCalendarEventDetails {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  hostEmail: string;
  hostName: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
}

export interface GoogleMeetLink {
  eventId: string;
  meetLink: string;
  eventLink: string;
}

function getBookingDateTime(booking: any): Date {
  if (booking.dateTime) {
    const dateTime = new Date(booking.dateTime);
    if (!Number.isNaN(dateTime.getTime())) return dateTime;
  }

  if (!booking.date || !booking.timeSlot) {
    throw new Error("Booking is missing date or timeSlot.");
  }

  const bookingDate = new Date(booking.date);
  const [hour, minute] = String(booking.timeSlot).split(":").map((part) => parseInt(part, 10));

  if (Number.isNaN(bookingDate.getTime()) || Number.isNaN(hour) || Number.isNaN(minute)) {
    throw new Error("Booking date or timeSlot is invalid.");
  }

  return new Date(Date.UTC(
    bookingDate.getUTCFullYear(),
    bookingDate.getUTCMonth(),
    bookingDate.getUTCDate(),
    hour,
    minute,
    0,
  ));
}

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private calendar: any;

  constructor(refreshToken?: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const token = refreshToken || process.env.GOOGLE_REFRESH_TOKEN;
    if (token) {
      this.oauth2Client.setCredentials({
        refresh_token: token,
      });
    }

    this.calendar = google.calendar({ version: "v3", auth: this.oauth2Client });
  }

  /**
   * Generate OAuth authorization URL for users to grant permissions
   */
  static generateAuthUrl(): string {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const scopes = ["https://www.googleapis.com/auth/calendar"];

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
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * Create a Google Calendar event with Google Meet link
   */
  async createEventWithMeet(eventDetails: GoogleCalendarEventDetails): Promise<GoogleMeetLink> {
    try {
      const eventBody = {
        summary: eventDetails.title,
        description: eventDetails.description,
        start: {
          dateTime: eventDetails.startTime.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: eventDetails.endTime.toISOString(),
          timeZone: "UTC",
        },
        attendees: [
          {
            email: eventDetails.customerEmail,
            displayName: eventDetails.customerName,
            responseStatus: "needsAction",
          },
          {
            email: eventDetails.hostEmail,
            displayName: eventDetails.hostName,
            responseStatus: "accepted",
          },
        ],
        conferenceData: {
          createRequest: {
            requestId: `booking-${eventDetails.bookingId}-${Date.now()}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
        reminders: {
          useDefault: true,
        },
      };

      const event = await this.calendar.events.insert({
        calendarId: "primary",
        resource: eventBody,
        conferenceDataVersion: 1,
        sendUpdates: "all", // Send invitations to attendees
      });

      const meetLink =
        event.data.hangoutLink ||
        event.data.conferenceData?.entryPoints?.find(
          (ep: any) => ep.entryPointType === "video"
        )?.uri;

      if (!meetLink) {
        throw new Error(`Google Calendar event ${event.data.id} was created without a Meet link.`);
      }

      return {
        eventId: event.data.id,
        meetLink,
        eventLink: event.data.htmlLink,
      };
    } catch (error) {
      console.error("[GoogleCalendarService] Error creating event with Meet:", error);
      throw new Error(`Failed to create Google Calendar event: ${error}`);
    }
  }

  /**
   * Update an existing Google Calendar event
   */
  async updateEvent(eventId: string, updates: any): Promise<any> {
    try {
      const event = await this.calendar.events.update({
        calendarId: "primary",
        eventId,
        resource: updates,
        sendUpdates: "all",
      });

      return event.data;
    } catch (error) {
      console.error("[GoogleCalendarService] Error updating event:", error);
      throw new Error(`Failed to update Google Calendar event: ${error}`);
    }
  }

  /**
   * Delete a Google Calendar event
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: "primary",
        eventId,
        sendUpdates: "all",
      });
    } catch (error) {
      console.error("[GoogleCalendarService] Error deleting event:", error);
      throw new Error(`Failed to delete Google Calendar event: ${error}`);
    }
  }

  /**
   * Get event details from Google Calendar
   */
  async getEvent(eventId: string): Promise<any> {
    try {
      const event = await this.calendar.events.get({
        calendarId: "primary",
        eventId,
      });

      return event.data;
    } catch (error) {
      console.error("[GoogleCalendarService] Error fetching event:", error);
      throw new Error(`Failed to fetch Google Calendar event: ${error}`);
    }
  }

  /**
   * List upcoming events on the calendar
   */
  async listUpcomingEvents(maxResults: number = 10): Promise<any[]> {
    try {
      const res = await this.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: "startTime",
      });

      return res.data.items || [];
    } catch (error) {
      console.error("[GoogleCalendarService] Error listing events:", error);
      throw new Error(`Failed to list Google Calendar events: ${error}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials.access_token;
    } catch (error) {
      console.error("[GoogleCalendarService] Error refreshing access token:", error);
      throw new Error(`Failed to refresh access token: ${error}`);
    }
  }
}

/**
 * Create a booking event in Google Calendar
 * This is called automatically when a booking is created/confirmed
 */
export async function createBookingInGoogleCalendar(booking: any, user: any, host: any): Promise<GoogleMeetLink | null> {
  try {
    // Only create event if Google refresh token is configured
    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      console.warn("[GoogleCalendarService] No GOOGLE_REFRESH_TOKEN configured. Skipping Google Calendar event creation.");
      return null;
    }

    const service = new GoogleCalendarService(process.env.GOOGLE_REFRESH_TOKEN);

    const eventDetails: GoogleCalendarEventDetails = {
      bookingId: booking._id.toString(),
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      hostEmail: host.email,
      hostName: host.name,
      title: `Booking: ${booking.serviceName} - ${booking.customerName}`,
      description: `
Service: ${booking.serviceName}
Customer: ${booking.customerName}
Email: ${booking.customerEmail}
Phone: ${booking.customerPhone || "N/A"}
Company: ${booking.customerCompany || "N/A"}

Message:
${booking.message || "No additional message"}
      `,
      startTime: getBookingDateTime(booking),
      endTime: new Date(getBookingDateTime(booking).getTime() + (booking.duration || 60) * 60 * 1000),
    };

    const meetLink = await service.createEventWithMeet(eventDetails);

    // Update booking with Google Calendar details
    await Booking.findByIdAndUpdate(booking._id, {
      googleCalendarEventId: meetLink.eventId,
      googleMeetLink: meetLink.meetLink,
      googleCalendarLink: meetLink.eventLink,
    });

    return meetLink;
  } catch (error) {
    console.error("[GoogleCalendarService] Error creating booking event:", error);
    return null;
  }
}

/**
 * Update booking event in Google Calendar when booking status changes
 */
export async function updateBookingInGoogleCalendar(booking: any, updateData: any): Promise<void> {
  try {
    if (!process.env.GOOGLE_REFRESH_TOKEN || !booking.googleCalendarEventId) {
      return;
    }

    const service = new GoogleCalendarService(process.env.GOOGLE_REFRESH_TOKEN);

    const updates: any = {
      summary: `[${booking.status}] ${booking.serviceName} - ${booking.customerName}`,
    };

    if (booking.status === "CANCELLED") {
      // Delete the event if booking is cancelled
      await service.deleteEvent(booking.googleCalendarEventId);
    } else {
      // Update the event
      await service.updateEvent(booking.googleCalendarEventId, updates);
    }
  } catch (error) {
    console.error("[GoogleCalendarService] Error updating booking event:", error);
  }
}
