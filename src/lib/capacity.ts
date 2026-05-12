import { addDays, addHours, startOfDay, parseISO, formatISO } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export interface HourSlot {
  slotStart: Date; // UTC
  slotEnd: Date;   // UTC
}

/**
 * Generates hourly UTC slots for a given day based on provider schedule.
 * Handles DST correctly by converting from the provider's IANA timezone.
 */
export function generateSlotsForDay(
  date: Date,         // any moment within the target day (UTC)
  dayOfWeek: number,  // 0-6
  openTime: string,   // "HH:mm"
  closeTime: string,  // "HH:mm"
  timezone: string,   // IANA e.g. "America/New_York"
): HourSlot[] {
  const zonedDate = toZonedTime(date, timezone);
  if (zonedDate.getDay() !== dayOfWeek) return [];

  const [openH, openM] = openTime.split(':').map(Number);
  const [closeH, closeM] = closeTime.split(':').map(Number);

  const slots: HourSlot[] = [];
  let hour = openH;

  while (hour < closeH || (hour === closeH && openM < closeM)) {
    const zonedSlotStart = new Date(
      zonedDate.getFullYear(),
      zonedDate.getMonth(),
      zonedDate.getDate(),
      hour,
      0,
      0,
      0,
    );
    const utcSlotStart = fromZonedTime(zonedSlotStart, timezone);
    const utcSlotEnd = addHours(utcSlotStart, 1);
    slots.push({ slotStart: utcSlotStart, slotEnd: utcSlotEnd });
    hour++;
  }

  return slots;
}

/**
 * Returns an array of Date objects representing the start of each day
 * from today through today + daysAhead, in UTC.
 */
export function daysAhead(daysAhead: number): Date[] {
  const days: Date[] = [];
  const today = startOfDay(new Date());
  for (let i = 0; i <= daysAhead; i++) {
    days.push(addDays(today, i));
  }
  return days;
}
