import { IService } from "../models/Service";
import Availability, { IAvailability } from "../models/Availability";
import Booking, { IBooking } from "../models/Booking";
import BlockedDate from "../models/BlockedDate";
import mongoose from "mongoose";
import { CalendarService } from "./calendarService";

interface TimeSlotResponse {
  time: string; // "HH:MM" in target timezone
  dateTime: string; // ISO string of slot start
  available: boolean;
}

/**
 * Normalizes a date to YYYY-MM-DD at 00:00:00 UTC
 */
export function normalizeToUTCDate(dateInput: Date | string): Date {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Parses "HH:MM" into minutes from start of day
 */
function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Formats minutes from start of day into "HH:MM"
 */
function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Checks if two time ranges [start1, end1] and [start2, end2] overlap
 */
function rangesOverlap(start1: number, end1: number, start2: number, end2: number): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Dynamic Availability Engine
 */
export class AvailabilityEngine {
  /**
   * Generates available time slots for a given service, date, and user timezone
   * @param service The Service model object
   * @param dateStr The date string (YYYY-MM-DD)
   * @param clientTimezone Timezone of the client (e.g. "America/New_York")
   * @param hostUserId Optional host/team member user ID. If null, queries the default/first available host
   */
  static async getAvailableSlots(
    service: IService,
    dateStr: string,
    clientTimezone: string = "UTC",
    hostUserId?: string
  ): Promise<TimeSlotResponse[]> {
    // 1. Parse date and check if blocked
    const targetDate = new Date(`${dateStr}T00:00:00Z`);
    const normalizedDate = normalizeToUTCDate(targetDate);

    // Get host user ID. If not provided, find the first Admin or Team Member
    let targetHostId: mongoose.Types.ObjectId | null = null;
    if (hostUserId) {
      targetHostId = new mongoose.Types.ObjectId(hostUserId);
    } else {
      // Find default availability
      const defaultAvail = await Availability.findOne();
      if (defaultAvail) {
        targetHostId = defaultAvail.userId;
      }
    }

    if (!targetHostId) {
      return []; // No host availability configured
    }

    // 2. Check if the date is blocked globally or specifically for this host
    const queryBlocked: any = { date: normalizedDate };
    if (targetHostId) {
      queryBlocked.$or = [{ isGlobal: true }, { userId: targetHostId }];
    } else {
      queryBlocked.isGlobal = true;
    }

    const isBlocked = await BlockedDate.findOne(queryBlocked);
    if (isBlocked) {
      return []; // Whole day is blocked
    }

    // 3. Retrieve host's availability configuration
    const availability = await Availability.findOne({ userId: targetHostId });
    if (!availability) {
      return []; // No availability configuration found
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.) in the host's timezone
    // To do this accurately, we find what day of the week targetDate falls on.
    // Note that targetDate is normalized to UTC. We need the day of the week in host's timezone.
    const dayOfWeek = targetDate.getUTCDay(); // 0-6

    const hostSchedule = availability.workingDays.find((wd: any) => wd.day === dayOfWeek);
    if (!hostSchedule || !hostSchedule.slots || hostSchedule.slots.length === 0) {
      return []; // Host does not work on this day
    }

    // 4. Retrieve existing bookings for this host on this normalized date
    // Active statuses: Pending, Confirmed, Rescheduled
    const existingBookings = await Booking.find({
      userId: targetHostId,
      date: normalizedDate,
      status: { $in: ["Pending", "Confirmed", "Rescheduled"] },
    }).populate("serviceId");

    // Check day limit
    if (availability.bookingLimitsPerDay && existingBookings.length >= availability.bookingLimitsPerDay) {
      return []; // Booking limit reached for this day
    }

    // Convert existing bookings into booked time blocks (in minutes from midnight)
    // We also account for service duration and buffer time
    const bookedBlocks = existingBookings.map((booking: any) => {
      const startMin = parseTimeToMinutes(booking.timeSlot);
      // Retrieve the duration & buffer of the service booked
      const duration = booking.serviceId?.duration || 30;
      const buffer = booking.serviceId?.bufferTime || 15;
      
      return {
        start: startMin,
        end: startMin + duration,
        buffer: buffer,
        // The total occupied interval including buffer before/after
        // To prevent back-to-back overlaps, a booked block blocks [start - currentServiceBuffer, end + currentServiceBuffer]
        // or we block [start, end + buffer]
        occupiedStart: startMin - buffer,
        occupiedEnd: startMin + duration + buffer
      };
    });

    // 4b. Fetch real-time busy blocks from Google Calendar to prevent conflicts and ensure full two-way syncing
    try {
      const timeMin = normalizedDate.toISOString();
      const timeMax = new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
      const googleBusySlots = await CalendarService.getBusySlots(timeMin, timeMax);
      
      const targetMidnight = normalizedDate.getTime();
      const dayLengthMs = 24 * 60 * 60 * 1000;

      for (const busy of googleBusySlots) {
        const busyStart = new Date(busy.start).getTime();
        const busyEnd = new Date(busy.end).getTime();
        
        // Find overlap with target day
        const overlapStart = Math.max(busyStart, targetMidnight);
        const overlapEnd = Math.min(busyEnd, targetMidnight + dayLengthMs);
        
        if (overlapStart < overlapEnd) {
          const startMin = Math.floor((overlapStart - targetMidnight) / (60 * 1000));
          const endMin = Math.ceil((overlapEnd - targetMidnight) / (60 * 1000));
          
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

    const slots: TimeSlotResponse[] = [];
    const serviceDuration = service.duration;
    const serviceBuffer = service.bufferTime;

    // Generate slots for each working window defined for the host on this day
    for (const window of hostSchedule.slots) {
      const windowStartMin = parseTimeToMinutes(window.start);
      const windowEndMin = parseTimeToMinutes(window.end);

      // Start slicing the window into slots
      let currentSlotStart = windowStartMin;

      while (currentSlotStart + serviceDuration <= windowEndMin) {
        const currentSlotEnd = currentSlotStart + serviceDuration;
        
        // Define the proposed slot boundaries
        const proposedStart = currentSlotStart;
        const proposedEnd = currentSlotEnd;

        // Check if this proposed slot overlaps with any booked block
        let isOverlapping = false;
        for (const block of bookedBlocks) {
          // A slot overlaps if it intersects with the booked block + buffer
          // Specifically, if proposed slot start-end overlaps with [block.start - serviceBuffer, block.end + block.buffer]
          // The buffer rules: 
          // 1. The interval of the new slot is [proposedStart, proposedEnd].
          // 2. The booked interval is [block.start, block.end].
          // 3. There must be a gap of at least max(newServiceBuffer, bookedServiceBuffer) between them, 
          //    or simply we respect each meeting's post-meeting buffer.
          // Let's use standard calendar buffer: a meeting blocks its [start, end + buffer] 
          // AND we also ensure the new slot does not violate its own buffer [proposedStart, proposedEnd + serviceBuffer].
          // So the blocked interval is [block.start, block.end + block.buffer] 
          // and we require proposed slot to not overlap, and also proposed slot's end + serviceBuffer does not overlap with block.start.
          // Mathematically, this is equivalent to checking if [proposedStart, proposedEnd + serviceBuffer] overlaps with [block.start, block.end + block.buffer].
          const newSlotRequiredEnd = proposedEnd + serviceBuffer;
          const bookedRequiredEnd = block.end + block.buffer;
          
          if (rangesOverlap(proposedStart, newSlotRequiredEnd, block.start, bookedRequiredEnd)) {
            isOverlapping = true;
            break;
          }
        }

        // Check if the slot is in the past (if looking at today)
        let isPast = false;
        const now = new Date();
        // Convert slot into absolute date
        const slotDate = new Date(Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
          Math.floor(proposedStart / 60),
          proposedStart % 60,
          0,
          0
        ));

        // Add 1 hour buffer for same-day bookings to prevent last-minute bookings
        const minBookingTime = new Date(now.getTime() + 60 * 60 * 1000);
        if (slotDate.getTime() < minBookingTime.getTime()) {
          isPast = true;
        }

        // Format slot details
        const slotTimeStr = formatMinutesToTime(proposedStart);
        
        slots.push({
          time: slotTimeStr,
          dateTime: slotDate.toISOString(),
          available: !isOverlapping && !isPast
        });

        // Increment for the next slot. 
        // We can increment by the service duration + buffer (no overlaps at all)
        // or by a fixed interval like 30 minutes for a denser selection. Let's do 30 minutes or 15 minutes increments!
        // Incrementing by 30 mins provides more flexible choices. Let's make it increment by 30 minutes.
        currentSlotStart += 30;
      }
    }

    // Now, if clientTimezone is different, we can adjust the representation if needed.
    // However, our frontend can simply receive the UTC dateTime and display it in the client's local timezone!
    // This is the industry-standard way (e.g. Stripe, Calendly). The backend generates slots in host/UTC times,
    // and sends the ISO timestamp `dateTime` which the client formatters convert to the client timezone.
    return slots;
  }
}
