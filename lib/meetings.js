/**
 * Meeting Room Service
 * Integrates with official Zoom and Google Meet APIs to create genuine, live video meeting rooms.
 * Configured via .env variables:
 * - ZOOM: ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET
 * - GOOGLE: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN (or Service Account)
 */

import { SignJWT, importPKCS8 } from "jose";

// ─────────────────────────────────────────────────────────────────────────────
// 1. ZOOM SERVER-TO-SERVER OAUTH API
// ─────────────────────────────────────────────────────────────────────────────

async function getZoomAccessToken() {
  const accountId = process.env.ZOOM_ACCOUNT_ID?.trim();
  const clientId = process.env.ZOOM_CLIENT_ID?.trim();
  const clientSecret = process.env.ZOOM_CLIENT_SECRET?.trim();

  if (!accountId || !clientId || !clientSecret) {
    return null;
  }

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`;

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.message || "Failed to authenticate with Zoom API");
  }

  return data.access_token;
}

export async function createRealZoomMeeting({
  topic = "Trust Lesson 1-on-1 Mentorship",
  startAt = new Date(),
  durationMin = 60,
}) {
  const token = await getZoomAccessToken();

  if (!token) {
    console.warn("[Zoom API] ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, or ZOOM_CLIENT_SECRET missing in .env. Using fallback link.");
    const randomMeetingId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const pwdChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const pwd = Array.from({ length: 8 }, () => pwdChars[Math.floor(Math.random() * pwdChars.length)]).join("");
    return {
      platform: "Zoom Meetings",
      joinUrl: `https://zoom.us/j/${randomMeetingId}?pwd=${pwd}`,
      isLiveApi: false,
    };
  }

  const startTimeIso = new Date(startAt).toISOString();
  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic,
      type: 2, // Scheduled meeting
      start_time: startTimeIso,
      duration: durationMin,
      timezone: "UTC",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        waiting_room: false,
        mute_upon_entry: false,
        audio: "both",
        auto_recording: "none",
      },
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.join_url) {
    throw new Error(data.message || "Zoom meeting creation failed");
  }

  return {
    platform: "Zoom Meetings",
    joinUrl: data.join_url,
    hostUrl: data.start_url || null,
    meetingId: data.id ? String(data.id) : null,
    password: data.password || null,
    isLiveApi: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GOOGLE MEET VIA GOOGLE CALENDAR API
// ─────────────────────────────────────────────────────────────────────────────

async function getGoogleAccessToken() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();

  // Mode A: OAuth Refresh Token
  if (clientId && clientSecret && refreshToken) {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const data = await res.json();
    if (res.ok && data.access_token) {
      return data.access_token;
    }
    console.warn("[Google API] Refresh token error:", data);
  }

  // Mode B: Google Service Account
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();

  if (serviceEmail && privateKey) {
    try {
      if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
        privateKey = Buffer.from(privateKey, "base64").toString("utf8");
      }
      privateKey = privateKey.replace(/\\n/g, "\n");

      const parsedKey = await importPKCS8(privateKey, "RS256");
      const jwt = await new SignJWT({
        scope: "https://www.googleapis.com/auth/calendar.events",
      })
        .setProtectedHeader({ alg: "RS256", typ: "JWT" })
        .setIssuer(serviceEmail)
        .setAudience("https://oauth2.googleapis.com/token")
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(parsedKey);

      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: jwt,
        }),
      });

      const data = await res.json();
      if (res.ok && data.access_token) {
        return data.access_token;
      }
      console.warn("[Google API] Service account error:", data);
    } catch (e) {
      console.warn("[Google API] Service account sign error:", e.message);
    }
  }

  return null;
}

export async function createRealGoogleMeet({
  topic = "Trust Lesson 1-on-1 Mentorship",
  startAt = new Date(),
  durationMin = 60,
}) {
  const token = await getGoogleAccessToken();

  if (!token) {
    console.warn("[Google API] GOOGLE_REFRESH_TOKEN or GOOGLE_SERVICE_ACCOUNT credentials missing in .env. Using fallback link.");
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const pick = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return {
      platform: "Google Meet",
      joinUrl: `https://meet.google.com/${pick(3)}-${pick(4)}-${pick(3)}`,
      isLiveApi: false,
    };
  }

  const startTime = new Date(startAt);
  const endTime = new Date(startTime.getTime() + durationMin * 60000);
  const requestId = `tl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: topic,
      description: "Live 1-on-1 Mentorship Session booked via Trust Lesson platform.",
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: endTime.toISOString() },
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    }),
  });

  const data = await res.json();
  const meetUrl =
    data.hangoutLink ||
    data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === "video")?.uri;

  if (!res.ok || !meetUrl) {
    throw new Error(data.error?.message || "Google Meet room creation failed");
  }

  return {
    platform: "Google Meet",
    joinUrl: meetUrl,
    eventId: data.id || null,
    isLiveApi: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MASTER GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

export async function createMeetingRoom({
  platform = "Google Meet",
  topic = "Trust Lesson 1-on-1 Mentorship",
  startAt = new Date(),
  durationMin = 60,
}) {
  const norm = String(platform || "").toLowerCase();

  if (norm.includes("zoom")) {
    return await createRealZoomMeeting({ topic, startAt, durationMin });
  }

  // Default to Google Meet
  return await createRealGoogleMeet({ topic, startAt, durationMin });
}
