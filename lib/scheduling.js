import { DateTime, Interval } from "luxon";
import { prisma } from "./prisma.js";

/**
 * Expands mentor's weekly rules (weekday 0-6, startMinute, endMinute)
 * into concrete UTC intervals for the date range [fromUtc, toUtc].
 *
 * @param {Array} rules - Array of { weekday, startMinute, endMinute }
 * @param {string} timezone - Mentor's IANA timezone string (e.g. "Asia/Jakarta", "America/New_York")
 * @param {DateTime} fromUtc - Start DateTime in UTC
 * @param {DateTime} toUtc - End DateTime in UTC
 * @returns {Array<Interval>} Array of Luxon Intervals in UTC
 */
export function expandWeeklyRules(rules, timezone, fromUtc, toUtc) {
  if (!rules || rules.length === 0) {
    // Default fallback: Monday-Friday 09:00 - 17:00 in mentor timezone
    rules = [1, 2, 3, 4, 5].map((d) => ({
      weekday: d,
      startMinute: 9 * 60, // 09:00
      endMinute: 17 * 60,  // 17:00
    }));
  }

  const intervals = [];
  const startLocal = fromUtc.setZone(timezone).startOf("day");
  const endLocal = toUtc.setZone(timezone).endOf("day");

  let current = startLocal;
  while (current <= endLocal) {
    // luxon weekday: 1 (Mon) - 7 (Sun). Standard rule: 0 (Sun) - 6 (Sat)
    const luxonWeekday = current.weekday;
    const ruleWeekday = luxonWeekday === 7 ? 0 : luxonWeekday;

    const matchingRules = rules.filter((r) => r.weekday === ruleWeekday);
    for (const rule of matchingRules) {
      const windowStart = current.plus({ minutes: rule.startMinute }).toUTC();
      const windowEnd = current.plus({ minutes: rule.endMinute }).toUTC();

      if (windowEnd > fromUtc && windowStart < toUtc) {
        intervals.push(Interval.fromDateTimes(windowStart, windowEnd));
      }
    }
    current = current.plus({ days: 1 });
  }

  return intervals;
}

/**
 * Applies mentor exceptions (BLOCK subtracts, EXTRA adds).
 */
export function applyExceptions(windows, exceptions) {
  if (!exceptions || exceptions.length === 0) return windows;

  let result = [...windows];

  for (const exc of exceptions) {
    const excStart = DateTime.fromJSDate(new Date(exc.startAt), { zone: "utc" });
    const excEnd = DateTime.fromJSDate(new Date(exc.endAt), { zone: "utc" });
    if (!excStart.isValid || !excEnd.isValid || excStart >= excEnd) continue;

    const excInterval = Interval.fromDateTimes(excStart, excEnd);

    if (exc.kind === "BLOCK") {
      // Subtract blocking interval from all existing windows
      const nextResult = [];
      for (const win of result) {
        const diff = win.difference(excInterval);
        nextResult.push(...diff);
      }
      result = nextResult;
    } else if (exc.kind === "EXTRA") {
      // Union EXTRA interval
      result.push(excInterval);
    }
  }

  return result;
}

/**
 * Subtracts busy intervals (active meetings with buffers) from available windows.
 */
export function subtractIntervals(availableWindows, busyIntervals) {
  if (!busyIntervals || busyIntervals.length === 0) return availableWindows;

  let currentWindows = [...availableWindows];
  for (const busy of busyIntervals) {
    const nextWindows = [];
    for (const win of currentWindows) {
      const remaining = win.difference(busy);
      nextWindows.push(...remaining);
    }
    currentWindows = nextWindows;
  }

  return currentWindows;
}

/**
 * Main Slot Generator (Section 5.1 of main.md)
 *
 * @param {object} options
 * @param {string} options.mentorId - Mentor user ID
 * @param {number} options.durationMin - Meeting duration in minutes
 * @param {string|Date} options.from - ISO string or Date (UTC)
 * @param {string|Date} options.to - ISO string or Date (UTC)
 * @returns {Promise<Array<{ startAt: string, endAt: string }>>}
 */
export async function generateSlots({ mentorId, durationMin = 60, from, to }) {
  const db = prisma;

  // 1. Fetch mentor availability settings
  let settings = await db.mentorAvailabilitySettings.findUnique({
    where: { mentorId },
  });

  if (!settings) {
    // Provide sensible defaults if mentor has not configured yet
    settings = {
      timezone: "UTC",
      minNoticeHours: 2, // 2 hours default for testing/demo
      maxHorizonDays: 30,
      bufferBeforeMin: 0,
      bufferAfterMin: 15,
      slotStepMin: 30,
      maxSessionsPerDay: 6,
    };
  }

  const timezone = settings.timezone || "UTC";
  const nowUtc = DateTime.utc();

  const minNoticeHours = settings.minNoticeHours ?? 2;
  const maxHorizonDays = settings.maxHorizonDays ?? 30;
  const bufferBefore = settings.bufferBeforeMin ?? 0;
  const bufferAfter = settings.bufferAfterMin ?? 15;
  const step = settings.slotStepMin ?? 30;
  const maxSessionsPerDay = settings.maxSessionsPerDay ?? 6;

  // Define search range
  const searchStart = from ? DateTime.fromISO(new Date(from).toISOString(), { zone: "utc" }) : nowUtc;
  const searchEnd = to ? DateTime.fromISO(new Date(to).toISOString(), { zone: "utc" }) : searchStart.plus({ days: 14 });

  // 2. Fetch mentor weekly rules
  const rules = await db.availabilityRule.findMany({
    where: { mentorId },
    orderBy: { startMinute: "asc" },
  });

  // 3. Fetch exceptions
  const exceptions = await db.availabilityException.findMany({
    where: {
      mentorId,
      endAt: { gte: searchStart.toJSDate() },
      startAt: { lte: searchEnd.toJSDate() },
    },
  });

  // 4. Fetch busy active meetings (PENDING or ACCEPTED)
  const activeMeetings = await db.meeting.findMany({
    where: {
      mentorId,
      status: { in: ["PENDING", "ACCEPTED"] },
      endAt: { gte: searchStart.minus({ minutes: bufferAfter }).toJSDate() },
      startAt: { lte: searchEnd.plus({ minutes: bufferBefore }).toJSDate() },
    },
    select: { startAt: true, endAt: true },
  });

  const busyIntervals = activeMeetings.map((m) => {
    const s = DateTime.fromJSDate(m.startAt, { zone: "utc" }).minus({ minutes: bufferBefore });
    const e = DateTime.fromJSDate(m.endAt, { zone: "utc" }).plus({ minutes: bufferAfter });
    return Interval.fromDateTimes(s, e);
  });

  // 5. Expand weekly rules to UTC intervals
  let windows = expandWeeklyRules(rules, timezone, searchStart, searchEnd);

  // 6. Apply BLOCK and EXTRA exceptions
  windows = applyExceptions(windows, exceptions);

  // 7. Subtract busy intervals
  let freeWindows = subtractIntervals(windows, busyIntervals);

  // 8. Clip to [now + minNotice, now + maxHorizon]
  const clipStart = nowUtc.plus({ hours: minNoticeHours });
  const clipEnd = nowUtc.plus({ days: maxHorizonDays });
  const validRange = Interval.fromDateTimes(clipStart, clipEnd);

  freeWindows = freeWindows
    .map((win) => win.intersection(validRange))
    .filter((win) => win !== null && win.isValid && win.length("minutes") >= durationMin);

  // 9. Generate discrete slots
  const slots = [];
  const daySlotCount = new Map(); // "YYYY-MM-DD" in mentor timezone -> count

  for (const win of freeWindows) {
    let t = win.start;

    // Ceil t to nearest step minute
    const rem = t.minute % step;
    if (rem !== 0) {
      t = t.plus({ minutes: step - rem }).set({ second: 0, millisecond: 0 });
    }

    while (t.plus({ minutes: durationMin }) <= win.end) {
      const slotEnd = t.plus({ minutes: durationMin });
      const dayKey = t.setZone(timezone).toISODate();

      // Check max sessions per day limit
      const currentDayCount = daySlotCount.get(dayKey) || 0;
      if (currentDayCount < maxSessionsPerDay) {
        slots.push({
          startAt: t.toUTC().toISO(),
          endAt: slotEnd.toUTC().toISO(),
          timezoneLabel: timezone,
          mentorLocalTime: t.setZone(timezone).toFormat("HH:mm"),
        });
      }

      t = t.plus({ minutes: step });
    }
  }

  // Count active meetings per day in mentor timezone to enforce maxSessionsPerDay
  for (const m of activeMeetings) {
    const mLocal = DateTime.fromJSDate(m.startAt, { zone: "utc" }).setZone(timezone);
    const dayKey = mLocal.toISODate();
    daySlotCount.set(dayKey, (daySlotCount.get(dayKey) || 0) + 1);
  }

  // Filter out slots on days that already have maxSessionsPerDay reached by existing meetings
  const filteredSlots = slots.filter((slot) => {
    const slotLocal = DateTime.fromISO(slot.startAt, { zone: "utc" }).setZone(timezone);
    const dayKey = slotLocal.toISODate();
    const existingCount = daySlotCount.get(dayKey) || 0;
    return existingCount < maxSessionsPerDay;
  });

  return filteredSlots;
}
