"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, apiFetch } from "@/src/context/AuthContext";
import {
  Bell,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCheck,
  AlertCircle,
  Inbox,
  Sparkles,
} from "lucide-react";
import Footer from "@/src/components/Footer";

export default function NotificationsPage() {
  const { user, authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "unread"

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/notifications");
      setNotifications(res.notifications || []);
    } catch (err) {
      console.warn("Failed to fetch notifications:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchNotifications();
    }
  }, [user, authLoading]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.warn("Error marking read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch("/notifications/read-all", { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (err) {
      console.warn("Error marking all read:", err);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "COMPLETION_REQUESTED":
        return <Clock className="w-5 h-5 text-amber-600" />;
      case "COMPLETION_AGREED":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "NEW_ENROLLMENT":
        return <BookOpen className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getNotificationDetails = (n) => {
    const payload = n.payload || {};
    switch (n.type) {
      case "COMPLETION_REQUESTED":
        return {
          title: "Mentorship Completion Requested",
          description: `${payload.learnerName || "Learner"} has completed all modules and requested course conclusion for "${payload.gigTitle || "Mentorship"}". Your agreement is required.`,
          actionUrl: payload.enrollmentId ? `/dashboard/classes/${payload.enrollmentId}` : "/dashboard/classes",
          actionText: "Review & Agree to Complete",
          badge: "Action Required",
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
        };
      case "COMPLETION_AGREED":
        return {
          title: "Mentor Agreed to Completion",
          description: `${payload.mentorName || "Your mentor"} has approved your course completion for "${payload.gigTitle || "Mentorship"}". You can now finalize and release the escrow payout.`,
          actionUrl: payload.enrollmentId ? `/dashboard/classes/${payload.enrollmentId}` : "/dashboard/classes",
          actionText: "Release Escrow Payout",
          badge: "Ready to Finalize",
          badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        };
      case "NEW_ENROLLMENT":
        return {
          title: "New Student Enrollment",
          description: `${payload.learnerName || "A student"} enrolled in "${payload.gigTitle || "Mentorship"}" (${payload.packageName || "Package"}). Funds are locked in escrow.`,
          actionUrl: payload.enrollmentId ? `/dashboard/classes/${payload.enrollmentId}` : "/dashboard/classes",
          actionText: "Open Classroom",
          badge: "New Enrollment",
          badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
        };
      default:
        return {
          title: "Platform Notification",
          description: payload.message || "You have a new update regarding your mentorship activity.",
          actionUrl: payload.enrollmentId ? `/dashboard/classes/${payload.enrollmentId}` : "/dashboard/classes",
          actionText: "View Details",
          badge: "Update",
          badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
        };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between pt-24 selection:bg-purple-500 selection:text-white">
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Bell size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
                <p className="text-xs text-slate-500">
                  Real-time updates on your mentorship sessions, milestone escrows, and completion requests.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <CheckCheck size={14} className="text-slate-500" />
                <span>Mark all as read</span>
              </button>
            )}

            <div className="inline-flex p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filter === "all" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filter === "unread" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200/80 animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-1/3 h-4 bg-slate-100 rounded" />
                    <div className="w-2/3 h-3 bg-slate-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Inbox size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {filter === "unread"
                ? "You are all caught up! New requests and milestone agreements will appear here."
                : "When students enroll or request completion, you will receive notifications here."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => {
              const details = getNotificationDetails(n);
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) handleMarkAsRead(n.id);
                    if (details.actionUrl) router.push(details.actionUrl);
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    !n.isRead
                      ? "bg-purple-50/40 border-purple-200 hover:border-purple-300 shadow-2xs"
                      : "bg-white border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shrink-0 shadow-2xs">
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900">{details.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${details.badgeColor}`}>
                          {details.badge}
                        </span>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{details.description}</p>
                      <span className="text-[11px] font-medium text-slate-400 block pt-0.5">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    <Link
                      href={details.actionUrl}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!n.isRead) handleMarkAsRead(n.id);
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <span>{details.actionText}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
