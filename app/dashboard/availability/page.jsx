"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Globe,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Video,
  Shield,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Footer from "@/src/components/Footer";
import { Card, PrimaryButton, GhostButton } from "@/src/components/ui/DesignTokens";

const COMMON_TIMEZONES = [
  "Asia/Jakarta",
  "Asia/Singapore",
  "Asia/Tokyo",
  "UTC",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Australia/Sydney",
];

const WEEKDAY_NAMES = [
  { day: 1, name: "Monday" },
  { day: 2, name: "Tuesday" },
  { day: 3, name: "Wednesday" },
  { day: 4, name: "Thursday" },
  { day: 5, name: "Friday" },
  { day: 6, name: "Saturday" },
  { day: 0, name: "Sunday" },
];

export default function MentorAvailabilityPage() {
  const { user, authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Settings State
  const [timezone, setTimezone] = useState("UTC");
  const [minNoticeHours, setMinNoticeHours] = useState(2);
  const [maxHorizonDays, setMaxHorizonDays] = useState(30);
  const [bufferBeforeMin, setBufferBeforeMin] = useState(0);
  const [bufferAfterMin, setBufferAfterMin] = useState(15);
  const [slotStepMin, setSlotStepMin] = useState(30);
  const [maxSessionsPerDay, setMaxSessionsPerDay] = useState(6);
  const [meetingLink, setMeetingLink] = useState("");

  // Weekly Rules State: Map of weekday -> { enabled: boolean, start: "09:00", end: "17:00" }
  const [weeklySchedule, setWeeklySchedule] = useState({
    1: { enabled: true, start: "09:00", end: "17:00" },
    2: { enabled: true, start: "09:00", end: "17:00" },
    3: { enabled: true, start: "09:00", end: "17:00" },
    4: { enabled: true, start: "09:00", end: "17:00" },
    5: { enabled: true, start: "09:00", end: "17:00" },
    6: { enabled: false, start: "10:00", end: "14:00" },
    0: { enabled: false, start: "10:00", end: "14:00" },
  });

  // Exceptions State
  const [exceptions, setExceptions] = useState([]);
  const [newExceptionDate, setNewExceptionDate] = useState("");
  const [newExceptionKind, setNewExceptionKind] = useState("BLOCK");
  const [newExceptionNote, setNewExceptionNote] = useState("");

  // Interactive Calendar State
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [selectedCalDate, setSelectedCalDate] = useState("");

  // Fetch Existing Settings
  useEffect(() => {
    let isMounted = true;
    async function loadAvailability() {
      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("tl_jwt");
        const res = await fetch(`/api/mentors/${user.id}/availability`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        if (isMounted && res.ok) {
          if (data.settings) {
            setTimezone(data.settings.timezone || "UTC");
            setMinNoticeHours(data.settings.minNoticeHours ?? 2);
            setMaxHorizonDays(data.settings.maxHorizonDays ?? 30);
            setBufferBeforeMin(data.settings.bufferBeforeMin ?? 0);
            setBufferAfterMin(data.settings.bufferAfterMin ?? 15);
            setSlotStepMin(data.settings.slotStepMin ?? 30);
            setMaxSessionsPerDay(data.settings.maxSessionsPerDay ?? 6);
          }
          if (data.mentor?.meetingLink) {
            setMeetingLink(data.mentor.meetingLink);
          }
          if (data.rules && data.rules.length > 0) {
            const sched = { ...weeklySchedule };
            // Reset all to disabled first
            Object.keys(sched).forEach((k) => (sched[k].enabled = false));
            for (const r of data.rules) {
              const startH = String(Math.floor(r.startMinute / 60)).padStart(2, "0");
              const startM = String(r.startMinute % 60).padStart(2, "0");
              const endH = String(Math.floor(r.endMinute / 60)).padStart(2, "0");
              const endM = String(r.endMinute % 60).padStart(2, "0");
              sched[r.weekday] = {
                enabled: true,
                start: `${startH}:${startM}`,
                end: `${endH}:${endM}`,
              };
            }
            setWeeklySchedule(sched);
          }
          if (data.exceptions) {
            setExceptions(data.exceptions);
          }
        }
      } catch (err) {
        console.warn("Error loading availability:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (!authLoading) {
      loadAvailability();
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem("tl_jwt");

      // Transform weekly schedule into rules array
      const rules = [];
      for (const [weekdayStr, config] of Object.entries(weeklySchedule)) {
        if (config.enabled) {
          const [sH, sM] = config.start.split(":").map(Number);
          const [eH, eM] = config.end.split(":").map(Number);
          const startMinute = (sH || 0) * 60 + (sM || 0);
          const endMinute = (eH || 0) * 60 + (eM || 0);

          if (startMinute >= endMinute) {
            throw new Error(`Invalid time range on day ${weekdayStr}: start must be before end.`);
          }

          rules.push({
            weekday: Number(weekdayStr),
            startMinute,
            endMinute,
          });
        }
      }

      const res = await fetch("/api/mentors/me/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          timezone,
          minNoticeHours,
          maxHorizonDays,
          bufferBeforeMin,
          bufferAfterMin,
          slotStepMin,
          maxSessionsPerDay,
          rules,
          exceptions,
          meetingLink: meetingLink.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to save availability settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddException = () => {
    if (!newExceptionDate) return;
    const startAt = new Date(`${newExceptionDate}T00:00:00Z`);
    const endAt = new Date(`${newExceptionDate}T23:59:59Z`);

    setExceptions((prev) => [
      ...prev,
      {
        id: `exc-${Date.now()}`,
        startAt,
        endAt,
        kind: newExceptionKind,
        note: newExceptionNote.trim() || null,
      },
    ]);

    setNewExceptionDate("");
    setNewExceptionNote("");
  };

  const handleToggleDateException = (dateStr, kind, note = "") => {
    if (!dateStr) return;
    const startAt = new Date(`${dateStr}T00:00:00Z`);
    const endAt = new Date(`${dateStr}T23:59:59Z`);

    setExceptions((prev) => {
      const filtered = prev.filter((e) => {
        const d = new Date(e.startAt).toISOString().split("T")[0];
        return d !== dateStr;
      });

      if (!kind) {
        return filtered;
      }

      return [
        ...filtered,
        {
          id: `exc-${Date.now()}`,
          startAt,
          endAt,
          kind,
          note: note ? note.trim() : null,
        },
      ];
    });
  };

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalYear((y) => y - 1);
      setCalMonth(11);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalYear((y) => y + 1);
      setCalMonth(0);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const jumpToToday = () => {
    const d = new Date();
    setCalYear(d.getFullYear());
    setCalMonth(d.getMonth());
    setSelectedCalDate(d.toISOString().split("T")[0]);
  };

  const handleRemoveException = (index) => {
    setExceptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-28">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between selection:bg-violet-500 selection:text-white">
      <main className="pt-28 pb-20 px-4 sm:px-6 flex-1">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-violet-600 text-xs font-semibold transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Mentor Dashboard</span>
            </Link>

            <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
              Availability Manager
            </span>
          </div>

          {/* Title Card */}
          <Card className="p-6 sm:p-8 space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Scheduling Configuration
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Mentor Calendar & Working Hours
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Define your recurring available hours, timezone, buffer periods, and permanent meeting room fallback.
            </p>
          </Card>

          {/* Feedback Banners */}
          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Your availability rules and scheduling settings have been saved!</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs font-semibold">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
            {/* General Settings */}
            <Card className="p-6 sm:p-8 space-y-6">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <Globe size={18} className="text-violet-600" />
                <span>General Scheduling Settings</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Timezone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Primary Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-violet-600 focus:bg-white cursor-pointer"
                  >
                    {COMMON_TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Notice Hours */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Minimum Notice (Hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="72"
                    value={minNoticeHours}
                    onChange={(e) => setMinNoticeHours(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-violet-600 focus:bg-white"
                  />
                  <span className="text-[10px] text-gray-400">Min hours before first booking</span>
                </div>

                {/* Buffer After Min */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Buffer After Session (Min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    step="5"
                    value={bufferAfterMin}
                    onChange={(e) => setBufferAfterMin(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-violet-600 focus:bg-white"
                  />
                  <span className="text-[10px] text-gray-400">Cooldown between back-to-back sessions</span>
                </div>

                {/* Slot Step Min */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Slot Step Interval (Min)
                  </label>
                  <select
                    value={slotStepMin}
                    onChange={(e) => setSlotStepMin(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-violet-600 focus:bg-white cursor-pointer"
                  >
                    <option value={15}>Every 15 minutes</option>
                    <option value={30}>Every 30 minutes</option>
                    <option value={60}>Every 60 minutes</option>
                  </select>
                </div>

                {/* Max Sessions Per Day */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Max Sessions Per Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={maxSessionsPerDay}
                    onChange={(e) => setMaxSessionsPerDay(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-violet-600 focus:bg-white"
                  />
                  <span className="text-[10px] text-gray-400">Cap on daily workload</span>
                </div>

                {/* Max Horizon Days */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Booking Horizon (Days)
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="180"
                    value={maxHorizonDays}
                    onChange={(e) => setMaxHorizonDays(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-violet-600 focus:bg-white"
                  />
                  <span className="text-[10px] text-gray-400">How far in advance students can book</span>
                </div>
              </div>
            </Card>


            {/* Weekly Recurring Availability Matrix */}
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                    <Clock size={18} className="text-violet-600" />
                    <span>Weekly Working Hours</span>
                  </h3>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Specify hours in your local timezone ({timezone}).
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {WEEKDAY_NAMES.map(({ day, name }) => {
                  const schedule = weeklySchedule[day] || { enabled: false, start: "09:00", end: "17:00" };

                  return (
                    <div
                      key={day}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Day toggle */}
                      <div className="flex items-center gap-3 w-40">
                        <input
                          type="checkbox"
                          id={`day-${day}`}
                          checked={schedule.enabled}
                          onChange={(e) =>
                            setWeeklySchedule((prev) => ({
                              ...prev,
                              [day]: { ...prev[day], enabled: e.target.checked },
                            }))
                          }
                          className="w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500 accent-violet-600 cursor-pointer"
                        />
                        <label
                          htmlFor={`day-${day}`}
                          className={`text-xs font-semibold cursor-pointer ${
                            schedule.enabled ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {name}
                        </label>
                      </div>

                      {/* Time Pickers */}
                      {schedule.enabled ? (
                        <div className="flex items-center gap-2 text-xs">
                          <input
                            type="time"
                            value={schedule.start}
                            onChange={(e) =>
                              setWeeklySchedule((prev) => ({
                                ...prev,
                                [day]: { ...prev[day], start: e.target.value },
                              }))
                            }
                            className="p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-violet-600 focus:bg-white"
                          />
                          <span className="text-gray-400">to</span>
                          <input
                            type="time"
                            value={schedule.end}
                            onChange={(e) =>
                              setWeeklySchedule((prev) => ({
                                ...prev,
                                [day]: { ...prev[day], end: e.target.value },
                              }))
                            }
                            className="p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-violet-600 focus:bg-white"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unavailable</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Interactive Availability Calendar & Date Overrides */}
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                    <Calendar size={18} className="text-violet-600" />
                    <span>Interactive Calendar Overrides & Vacation Blocks</span>
                  </h3>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Click any date on the calendar to toggle vacation blocks or set extra working hours.
                  </p>
                </div>

                {/* Calendar Legend */}
                <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block" />
                    <span>Working Day</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span>Blocked (Vacation)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Extra Available</span>
                  </span>
                </div>
              </div>

              {/* Month Navigation Header */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200/80">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                    title="Previous month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <h4 className="font-extrabold text-sm text-gray-900 tracking-tight min-w-[140px] text-center">
                    {new Date(calYear, calMonth, 1).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h4>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                    title="Next month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={jumpToToday}
                  className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Jump to Today
                </button>
              </div>

              {/* 7-Day Calendar Grid */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 bg-gray-50/90 border-b border-gray-200 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider py-2.5">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                {/* Day Grid Cells */}
                <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
                  {/* Leading empty cells */}
                  {Array.from({ length: new Date(calYear, calMonth, 1).getDay() }).map((_, idx) => (
                    <div key={`blank-${idx}`} className="min-h-[82px] bg-gray-50/30 p-2" />
                  ))}

                  {/* Day cells of current month */}
                  {Array.from({ length: new Date(calYear, calMonth + 1, 0).getDate() }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                    const dObj = new Date(calYear, calMonth, dayNum);
                    const weekdayIndex = dObj.getDay();
                    const isRegularWorking = weeklySchedule[weekdayIndex]?.enabled;
                    const isToday = new Date().toISOString().split("T")[0] === dateStr;
                    const isSelected = selectedCalDate === dateStr;

                    const exc = exceptions.find((e) => {
                      const d = new Date(e.startAt).toISOString().split("T")[0];
                      return d === dateStr;
                    });
                    const isBlocked = exc?.kind === "BLOCK";
                    const isExtra = exc?.kind === "EXTRA";

                    return (
                      <button
                        type="button"
                        key={dateStr}
                        onClick={() => setSelectedCalDate(dateStr)}
                        className={`min-h-[82px] p-2 flex flex-col justify-between text-left transition-all cursor-pointer relative ${
                          isSelected
                            ? "bg-violet-50/90 ring-2 ring-violet-600 ring-inset z-10"
                            : isBlocked
                            ? "bg-rose-50/50 hover:bg-rose-50"
                            : isExtra
                            ? "bg-emerald-50/50 hover:bg-emerald-50"
                            : isRegularWorking
                            ? "bg-white hover:bg-gray-50/80"
                            : "bg-gray-50/40 text-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                              isToday
                                ? "bg-violet-600 text-white"
                                : isSelected
                                ? "text-violet-700"
                                : "text-gray-800"
                            }`}
                          >
                            {dayNum}
                          </span>
                          {isRegularWorking && !isBlocked && (
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" title="Regular working day" />
                          )}
                        </div>

                        {/* Status Label */}
                        <div className="mt-1">
                          {isBlocked ? (
                            <span className="inline-block text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-200 px-1.5 py-0.5 rounded-md leading-none truncate max-w-full">
                              Blocked
                            </span>
                          ) : isExtra ? (
                            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-md leading-none truncate max-w-full">
                              Extra Day
                            </span>
                          ) : isRegularWorking ? (
                            <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                              {weeklySchedule[weekdayIndex].start}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-300 font-normal hidden sm:inline">
                              Off
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Action Panel (Shows when a date is selected) */}
              {selectedCalDate && (
                <div className="p-4 sm:p-5 bg-gradient-to-r from-violet-50/90 via-indigo-50/60 to-white rounded-2xl border border-violet-200 space-y-3 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-violet-600" />
                        <h4 className="font-extrabold text-sm text-gray-900">
                          {new Date(selectedCalDate + "T00:00:00").toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </h4>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {(() => {
                          const exc = exceptions.find((e) => {
                            const d = new Date(e.startAt).toISOString().split("T")[0];
                            return d === selectedCalDate;
                          });
                          if (exc?.kind === "BLOCK") return "This date is currently BLOCKED from student bookings.";
                          if (exc?.kind === "EXTRA") return "This date is marked as EXTRA AVAILABLE for student bookings.";
                          const weekday = new Date(selectedCalDate + "T00:00:00").getDay();
                          return weeklySchedule[weekday]?.enabled
                            ? `Regular working day (${weeklySchedule[weekday].start} - ${weeklySchedule[weekday].end}).`
                            : "Regular weekly day off.";
                        })()}
                      </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {(() => {
                        const exc = exceptions.find((e) => {
                          const d = new Date(e.startAt).toISOString().split("T")[0];
                          return d === selectedCalDate;
                        });

                        if (exc) {
                          return (
                            <button
                              type="button"
                              onClick={() => handleToggleDateException(selectedCalDate, null)}
                              className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              <X size={13} />
                              <span>Remove Override</span>
                            </button>
                          );
                        }

                        return (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleDateException(selectedCalDate, "BLOCK", "Vacation / Blocked")}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              <span>Block Date (Off)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleDateException(selectedCalDate, "EXTRA", "Extra Session Day")}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              <Plus size={13} />
                              <span>Set Extra Available</span>
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* List of Active Overrides */}
              {exceptions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-700 block">
                    Active Calendar Overrides ({exceptions.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {exceptions.map((exc, idx) => {
                      const startStr = new Date(exc.startAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });

                      return (
                        <div
                          key={idx}
                          className="p-2.5 bg-gray-50 border border-gray-200/80 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                exc.kind === "BLOCK"
                                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              {exc.kind === "BLOCK" ? "BLOCKED" : "EXTRA"}
                            </span>
                            <span className="font-semibold text-gray-800">{startStr}</span>
                            {exc.note && <span className="text-gray-400 text-[11px] truncate max-w-[120px]">• {exc.note}</span>}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveException(idx)}
                            className="text-gray-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                            title="Remove override"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            {/* Save Button */}
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-end">
              <PrimaryButton
                type="submit"
                disabled={saving}
                className="px-8 py-3 text-xs"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Schedule...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Availability Rules</span>
                  </>
                )}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
