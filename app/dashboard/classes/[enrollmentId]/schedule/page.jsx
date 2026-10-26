"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, apiFetch } from "@/src/context/AuthContext";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  Video,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";
import Footer from "@/src/components/Footer";
import { Card, PrimaryButton } from "@/src/components/ui/DesignTokens";

export default function ScheduleSessionPage() {
  const params = useParams();
  const enrollmentId = params?.enrollmentId;
  const router = useRouter();
  const { user, authLoading } = useAuth();

  const [enrollmentData, setEnrollmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Scheduling Form State
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [platform, setPlatform] = useState("GOOGLE_MEET");
  const [agenda, setAgenda] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Interactive Month Calendar State
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

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
  };

  // User detected timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  // 1. Fetch Enrollment Details
  useEffect(() => {
    let isMounted = true;
    async function fetchEnrollment() {
      if (!enrollmentId || !user) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const data = await apiFetch(`/enrollments/${enrollmentId}`);
        if (isMounted) {
          setEnrollmentData(data);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (!authLoading) {
      fetchEnrollment();
    }

    return () => {
      isMounted = false;
    };
  }, [enrollmentId, user, authLoading]);

  // 2. Fetch Slots for Mentor
  const fetchAvailableSlots = async (mentorId, durationMin) => {
    setLoadingSlots(true);
    setSubmitError("");
    try {
      const res = await fetch(`/api/mentors/${mentorId}/slots?durationMin=${durationMin || 60}`);
      const data = await res.json();
      if (res.ok) {
        setSlots(data.slots || []);
        // Pre-select first date that has available slots
        if (data.slots && data.slots.length > 0) {
          const firstDate = new Date(data.slots[0].startAt).toISOString().split("T")[0];
          setSelectedDate(firstDate);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch slots:", e);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (enrollmentData?.enrollment?.mentorId) {
      fetchAvailableSlots(
        enrollmentData.enrollment.mentorId,
        enrollmentData.enrollment.sessionDurationMin || 60
      );
    }
  }, [enrollmentData]);

  // Handle Form Submit
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!selectedSlot) {
      setSubmitError("Please choose a time slot for your session.");
      return;
    }

    setIsSubmitting(true);
    try {
      const idempotencyKey = `book-${enrollmentId}-${Date.now()}`;

      const data = await apiFetch(`/enrollments/${enrollmentId}/meetings`, {
        method: "POST",
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          startAt: selectedSlot.startAt,
          endAt: selectedSlot.endAt,
          platform,
          agenda: agenda.trim() || null,
        }),
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/classes/${enrollmentId}`);
      }, 1500);
    } catch (err) {
      setSubmitError(err.message || "Failed to schedule meeting request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-28">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !enrollmentData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <div className="pt-28 pb-20 px-4 flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
            <AlertCircle size={28} className="mx-auto text-rose-600" />
            <h3 className="font-bold text-slate-900 text-base">Unable to Access Scheduling</h3>
            <p className="text-slate-500 text-xs">{error || "Enrollment details not found"}</p>
            <Link
              href="/dashboard/classes"
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold inline-block"
            >
              Back to Classes
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { enrollment, quota } = enrollmentData;
  const gig = enrollment?.gig;
  const mentor = enrollment?.mentor;

  // Filter slots for currently selected date
  const dateSlots = slots.filter((s) => {
    const sDate = new Date(s.startAt).toLocaleDateString("en-CA"); // "YYYY-MM-DD"
    return sDate === selectedDate;
  });

  // Extract unique available dates
  const availableDates = Array.from(
    new Set(slots.map((s) => new Date(s.startAt).toLocaleDateString("en-CA")))
  ).slice(0, 14);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between selection:bg-violet-500 selection:text-white">
      <main className="pt-28 pb-20 px-4 sm:px-6 flex-1">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Top Breadcrumb */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <Link
              href={`/dashboard/classes/${enrollmentId}`}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-violet-600 text-xs font-semibold transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Classroom</span>
            </Link>

            <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
              {quota.remaining} Sessions Remaining
            </span>
          </div>

          {/* Form Header */}
          <Card className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Schedule Meeting Request
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {gig?.title || "1:1 Live Mentorship Session"}
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm">
                Pick a slot from mentor <strong className="text-gray-800">{mentor?.name}</strong>. Slots are automatically converted to your local time.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-2xl border border-violet-100 text-xs text-violet-900 shrink-0">
              <Clock size={16} className="text-violet-600" />
              <div>
                <p className="font-bold">{enrollment.sessionDurationMin || 60} Minutes</p>
                <p className="text-[11px] text-violet-700">1 Quota Unit Reserved</p>
              </div>
            </div>
          </Card>

          {/* Success Banner */}
          {submitSuccess && (
            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 animate-fadeIn">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Meeting Request Sent</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Your reservation is saved and the mentor has been notified. Redirecting to classroom...
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {submitError && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
              <AlertTriangle size={18} className="text-rose-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Main Scheduling Form */}
          <form onSubmit={handleScheduleSubmit} className="space-y-8">
            {/* Step 1: Interactive Date Selector Calendar */}
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                    <Calendar size={18} className="text-violet-600" />
                    <span>1. Choose a Session Date</span>
                  </h3>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Click any highlighted date on the calendar to reveal available time slots.
                  </p>
                </div>
                <span className="text-[11px] text-gray-500 flex items-center gap-1.5 font-medium bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                  <Globe size={13} className="text-violet-600" />
                  <span>Timezone: {userTimezone}</span>
                </span>
              </div>

              {loadingSlots ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  <div className="w-7 h-7 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
                  Checking mentor availability...
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Month Navigation */}
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

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={jumpToToday}
                        className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Jump to Today
                      </button>
                    </div>
                  </div>

                  {/* 7-Column Calendar Grid */}
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    {/* Header */}
                    <div className="grid grid-cols-7 bg-gray-50/90 border-b border-gray-200 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider py-2.5">
                      <span>Sun</span>
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
                      {/* Leading empty cells */}
                      {Array.from({ length: new Date(calYear, calMonth, 1).getDay() }).map((_, idx) => (
                        <div key={`blank-${idx}`} className="min-h-[72px] bg-gray-50/30 p-2" />
                      ))}

                      {/* Month Days */}
                      {Array.from({ length: new Date(calYear, calMonth + 1, 0).getDate() }).map((_, idx) => {
                        const dayNum = idx + 1;
                        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                        const daySlots = slots.filter((s) => {
                          const sDate = new Date(s.startAt).toLocaleDateString("en-CA");
                          return sDate === dateStr;
                        });

                        const hasSlots = daySlots.length > 0;
                        const isToday = new Date().toLocaleDateString("en-CA") === dateStr;
                        const isSelected = selectedDate === dateStr;
                        const isPast = new Date(calYear, calMonth, dayNum, 23, 59, 59) < new Date();

                        if (!hasSlots || isPast) {
                          return (
                            <div
                              key={dateStr}
                              className="min-h-[72px] p-2 bg-gray-50/40 text-gray-300 flex flex-col justify-between cursor-not-allowed select-none"
                            >
                              <span className="text-xs font-medium">{dayNum}</span>
                              <span className="text-[10px] text-gray-300">-</span>
                            </div>
                          );
                        }

                        return (
                          <button
                            type="button"
                            key={dateStr}
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setSelectedSlot(null);
                            }}
                            className={`min-h-[72px] p-2 flex flex-col justify-between text-left transition-all cursor-pointer relative ${
                              isSelected
                                ? "bg-violet-600 text-white font-bold ring-2 ring-violet-600 z-10 shadow-sm"
                                : "bg-white hover:bg-violet-50/70 text-gray-900 border-violet-100"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span
                                className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                                  isToday && !isSelected
                                    ? "bg-violet-100 text-violet-800"
                                    : ""
                                }`}
                              >
                                {dayNum}
                              </span>
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? "bg-white" : "bg-emerald-500"
                                }`}
                              />
                            </div>
                            <span
                              className={`text-[10px] font-semibold truncate ${
                                isSelected ? "text-violet-100" : "text-emerald-700"
                              }`}
                            >
                              {daySlots.length} open
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Date Indicator Banner */}
                  {selectedDate && (
                    <div className="p-3 bg-violet-50 rounded-xl border border-violet-200 text-violet-950 text-xs flex items-center justify-between">
                      <span className="font-semibold">
                        Selected:{" "}
                        <strong className="font-extrabold text-violet-900">
                          {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </strong>
                      </span>
                      <span className="text-[11px] bg-white text-violet-700 font-bold px-2 py-0.5 rounded-md border border-violet-200">
                        {dateSlots.length} slot(s) available below
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Step 2: Slot Selector */}
            {selectedDate && (
              <Card className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                    <Clock size={18} className="text-violet-600" />
                    <span>2. Select a Free Time Slot</span>
                  </h3>
                  <span className="text-xs text-gray-400 font-normal">
                    {dateSlots.length} available slot(s)
                  </span>
                </div>

                {dateSlots.length === 0 ? (
                  <div className="p-6 bg-gray-50 rounded-2xl text-center text-gray-400 text-xs">
                    No open slots on this specific day. Please pick another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {dateSlots.map((slot, sIdx) => {
                      const startTime = new Date(slot.startAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const isSelected = selectedSlot?.startAt === slot.startAt;

                      return (
                        <button
                          type="button"
                          key={sIdx}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 px-3 rounded-full border text-center transition-all cursor-pointer font-semibold text-xs flex flex-col items-center justify-center gap-0.5 ${
                            isSelected
                              ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                              : "bg-white hover:bg-violet-50 text-gray-800 border-gray-200 hover:border-violet-200"
                          }`}
                        >
                          <span>{startTime}</span>
                          <span className="text-[10px] font-normal opacity-75">
                            Mentor: {slot.mentorLocalTime || startTime}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>
            )}

            {/* Step 3: Platform & Agenda */}
            <Card className="p-6 sm:p-8 space-y-6">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <Video size={18} className="text-violet-600" />
                <span>3. Meeting Platform & Agenda</span>
              </h3>

              {/* Platform options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "GOOGLE_MEET", label: "Google Meet", desc: "Interactive browser meeting link" },
                  { id: "ZOOM", label: "Zoom Meetings", desc: "Zoom audio/video meeting room" },
                ].map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      platform === p.id
                        ? "bg-violet-50 border-violet-600 text-violet-950 shadow-xs"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-xs">{p.label}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{p.desc}</p>
                    </div>
                    {platform === p.id && <CheckCircle2 size={16} className="text-violet-600" />}
                  </button>
                ))}
              </div>

              {/* Agenda Note */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Agenda & Topics to Cover (Optional)
                </label>
                <textarea
                  rows={3}
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="E.g., Review smart contract security patterns, discuss architecture for capstone project..."
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-600 focus:bg-white transition-colors"
                />
              </div>
            </Card>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-xs">
              <div className="text-xs text-gray-400">
                <span className="font-semibold text-gray-700">Anti-Overbooking Guarantee:</span> Time slot is reserved atomically with double-booking prevention.
              </div>

              <PrimaryButton
                type="submit"
                disabled={isSubmitting || !selectedSlot}
                className="w-full sm:w-auto px-8 py-3 text-xs"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Reserving Slot...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Send Request</span>
                    <ChevronRight size={14} />
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
