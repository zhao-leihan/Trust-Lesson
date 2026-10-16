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
  Link as LinkIcon,
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

            {/* Permanent Room Link */}
            <Card className="p-6 sm:p-8 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <LinkIcon size={18} className="text-violet-600" />
                <span>Permanent Meeting Room Link (Fallback)</span>
              </h3>
              <p className="text-gray-500 text-xs">
                Your personal Google Meet, Zoom, or Teams link used when students book meetings.
              </p>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij or personal Zoom URL"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-violet-600 focus:bg-white"
              />
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

            {/* Date Exceptions & Vacation Blocks */}
            <Card className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                  <Calendar size={18} className="text-violet-600" />
                  <span>Date Overrides & Vacation Blocks</span>
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  Block specific vacation days from student booking.
                </p>
              </div>

              {/* Add Exception Controls */}
              <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <input
                  type="date"
                  value={newExceptionDate}
                  onChange={(e) => setNewExceptionDate(e.target.value)}
                  className="p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-violet-600"
                />

                <select
                  value={newExceptionKind}
                  onChange={(e) => setNewExceptionKind(e.target.value)}
                  className="p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-violet-600"
                >
                  <option value="BLOCK">Block Full Day (Unavailable)</option>
                  <option value="EXTRA">Extra Available Day</option>
                </select>

                <input
                  type="text"
                  placeholder="Note (e.g. Vacation, Holiday)"
                  value={newExceptionNote}
                  onChange={(e) => setNewExceptionNote(e.target.value)}
                  className="p-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-violet-600 flex-1 min-w-[140px]"
                />

                <PrimaryButton
                  type="button"
                  onClick={handleAddException}
                  disabled={!newExceptionDate}
                  className="!min-h-[38px] !py-2 !px-4 text-xs"
                >
                  <Plus size={14} />
                  <span>Add Override</span>
                </PrimaryButton>
              </div>

              {/* List of Exceptions */}
              {exceptions.length > 0 && (
                <div className="space-y-2">
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
                        className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              exc.kind === "BLOCK"
                                ? "bg-rose-50 text-rose-700 border border-rose-100"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            }`}
                          >
                            {exc.kind === "BLOCK" ? "BLOCKED" : "EXTRA"}
                          </span>
                          <span className="font-semibold text-gray-800">{startStr}</span>
                          {exc.note && <span className="text-gray-400">• {exc.note}</span>}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveException(idx)}
                          className="text-gray-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          title="Remove override"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
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
