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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <main className="pt-28 pb-20 px-4 sm:px-6 flex-1">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-700 text-xs font-bold transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Mentor Dashboard</span>
            </Link>

            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Availability Manager
            </span>
          </div>

          {/* Title Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-2">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              Scheduling Configuration
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Mentor Calendar & Working Hours
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              Define your recurring available hours, timezone, buffer periods, and permanent meeting room fallback.
            </p>
          </div>

          {/* Feedback Banners */}
          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-bold animate-fadeIn">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Your availability rules and scheduling settings have been saved!</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs font-bold">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
            {/* General Settings */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Globe size={18} className="text-purple-600" />
                <span>General Scheduling Settings</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Timezone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Primary Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600 cursor-pointer"
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
                  <label className="block text-xs font-bold text-slate-700">
                    Minimum Notice (Hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="72"
                    value={minNoticeHours}
                    onChange={(e) => setMinNoticeHours(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                  <span className="text-[10px] text-slate-400">Min hours before first booking</span>
                </div>

                {/* Buffer After Min */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Buffer After Session (Min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    step="5"
                    value={bufferAfterMin}
                    onChange={(e) => setBufferAfterMin(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                  <span className="text-[10px] text-slate-400">Cooldown between back-to-back sessions</span>
                </div>

                {/* Slot Step Min */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Slot Step Interval (Min)
                  </label>
                  <select
                    value={slotStepMin}
                    onChange={(e) => setSlotStepMin(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600 cursor-pointer"
                  >
                    <option value={15}>Every 15 minutes</option>
                    <option value={30}>Every 30 minutes</option>
                    <option value={60}>Every 60 minutes</option>
                  </select>
                </div>

                {/* Max Sessions Per Day */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Max Sessions Per Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={maxSessionsPerDay}
                    onChange={(e) => setMaxSessionsPerDay(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                  <span className="text-[10px] text-slate-400">Cap on daily workload</span>
                </div>

                {/* Max Horizon Days */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Booking Horizon (Days)
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="180"
                    value={maxHorizonDays}
                    onChange={(e) => setMaxHorizonDays(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                  <span className="text-[10px] text-slate-400">How far in advance students can book</span>
                </div>
              </div>
            </div>

            {/* Permanent Room Link (ManualLinkProvider fallback) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <LinkIcon size={18} className="text-purple-600" />
                <span>Permanent Meeting Room Link (Fallback)</span>
              </h3>
              <p className="text-slate-500 text-xs">
                Your personal Google Meet, Zoom, or Teams link used when students book meetings.
              </p>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij or personal Zoom URL"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* Weekly Recurring Availability Matrix */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Clock size={18} className="text-purple-600" />
                    <span>Weekly Working Hours</span>
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Specify hours in your local timezone ({timezone}).
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
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
                          className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                        />
                        <label
                          htmlFor={`day-${day}`}
                          className={`text-xs font-bold cursor-pointer ${
                            schedule.enabled ? "text-slate-900" : "text-slate-400"
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
                            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                          />
                          <span className="text-slate-400">to</span>
                          <input
                            type="time"
                            value={schedule.end}
                            onChange={(e) =>
                              setWeeklySchedule((prev) => ({
                                ...prev,
                                [day]: { ...prev[day], end: e.target.value },
                              }))
                            }
                            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unavailable</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date Exceptions & Vacation Blocks */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Calendar size={18} className="text-purple-600" />
                  <span>Date Overrides & Vacation Blocks</span>
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Block specific vacation days from student booking.
                </p>
              </div>

              {/* Add Exception Controls */}
              <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <input
                  type="date"
                  value={newExceptionDate}
                  onChange={(e) => setNewExceptionDate(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                />

                <select
                  value={newExceptionKind}
                  onChange={(e) => setNewExceptionKind(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                >
                  <option value="BLOCK">Block Full Day (Unavailable)</option>
                  <option value="EXTRA">Extra Available Day</option>
                </select>

                <input
                  type="text"
                  placeholder="Note (e.g. Vacation, Holiday)"
                  value={newExceptionNote}
                  onChange={(e) => setNewExceptionNote(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 flex-1 min-w-[140px]"
                />

                <button
                  type="button"
                  onClick={handleAddException}
                  disabled={!newExceptionDate}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus size={14} />
                  <span>Add Override</span>
                </button>
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
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              exc.kind === "BLOCK"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {exc.kind === "BLOCK" ? "BLOCKED" : "EXTRA"}
                          </span>
                          <span className="font-bold text-slate-800">{startStr}</span>
                          {exc.note && <span className="text-slate-500">• {exc.note}</span>}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveException(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove override"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition-all shadow-md shadow-purple-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
