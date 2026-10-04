"use client";

import { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  Play,
  FileText,
  Download,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Loader2,
  Eye,
  FileCode,
} from "lucide-react";
import { YouTubeIcon, GoogleDriveIcon } from "@/src/components/PlatformIcons";

/**
 * Safely extracts clean YouTube embed URL
 */
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2] && match[2].length === 11) {
      return `https://www.youtube-nocookie.com/embed/${match[2]}`;
    }
  } catch {}
  return null;
}

/**
 * GatedModulePlayer
 * Handles student gated video playback and document downloads:
 * 1. Supports YouTube (Unlisted) and Cloudflare Stream (Encrypted).
 * 2. Supports Google Drive (Restricted) and Cloudflare R2 (15-minute presigned URLs).
 * 3. Enforces 403 Forbidden gating if learner has not deposited milestone escrow on Arbitrum.
 * 4. 100% English UI, zero emojis, clean SVG icons.
 */
export default function GatedModulePlayer({
  module,
  offeringId,
  sessionId,
  isPaidPreview = false,
  forceUnpaidPreview = false,
  className = "",
}) {
  const [tokenLoading, setTokenLoading] = useState(false);
  const [playbackData, setPlaybackData] = useState(null);
  const [playbackError, setPlaybackError] = useState(null);

  const [downloadingResId, setDownloadingResId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  const moduleId = module?.id || "mod-1";
  const videoUid = module?.videoUid;
  const youtubeUrl = module?.videoUrl || module?.youtubeUrl || "";
  const gdriveUrl = module?.gdriveUrl || "";
  const resources = module?.resources || [];
  const githubUrl = module?.githubUrl;

  // Unlocked state if user has paid or is in paid preview mode
  const isUnlocked = Boolean(
    (isPaidPreview || (playbackData && playbackData.playbackUrl)) && !forceUnpaidPreview
  );

  // Fetch Cloudflare Stream token if videoUid exists
  useEffect(() => {
    if (!videoUid) {
      setPlaybackData(null);
      setPlaybackError(null);
      return;
    }

    if (forceUnpaidPreview) {
      setPlaybackData(null);
      setPlaybackError({
        status: 403,
        message: "Payment required. Complete milestone escrow deposit on Arbitrum to unlock this module.",
        code: "PAYMENT_REQUIRED",
      });
      return;
    }

    let isMounted = true;
    setTokenLoading(true);
    setPlaybackError(null);

    async function fetchToken() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("tl_jwt") : null;
        const q = new URLSearchParams({
          videoUid,
          ...(offeringId ? { offeringId } : {}),
          ...(sessionId ? { sessionId } : {}),
        });

        const res = await fetch(`/api/modules/${moduleId}/playback-token?${q.toString()}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await res.json();

        if (!isMounted) return;

        if (!res.ok) {
          setPlaybackError({
            status: res.status,
            message: data.error || "Payment required to unlock this module.",
            code: data.code || "PAYMENT_REQUIRED",
          });
          setPlaybackData(null);
        } else {
          setPlaybackData(data);
          setPlaybackError(null);
        }
      } catch (err) {
        if (!isMounted) return;
        setPlaybackError({
          status: 500,
          message: err.message || "Failed to verify playback authorization",
        });
      } finally {
        if (isMounted) setTokenLoading(false);
      }
    }

    fetchToken();

    return () => {
      isMounted = false;
    };
  }, [moduleId, videoUid, offeringId, sessionId, forceUnpaidPreview, isPaidPreview]);

  // Handle Cloudflare R2 document download
  const handleDownloadResource = async (resItem) => {
    if (forceUnpaidPreview || !isUnlocked) {
      alert("This document is gated by milestone escrow. Enroll and deposit payment on Arbitrum to download.");
      return;
    }

    const resId = resItem.id || resItem.resourceId;
    setDownloadingResId(resId);
    setDownloadError(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("tl_jwt") : null;
      const q = new URLSearchParams({
        key: resItem.key || "",
        filename: resItem.name || "document.pdf",
        ...(offeringId ? { offeringId } : {}),
        ...(sessionId ? { sessionId } : {}),
      });

      const res = await fetch(
        `/api/modules/${moduleId}/resources/${resId}/download?${q.toString()}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment required to download this document.");
      }

      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      }
    } catch (err) {
      setDownloadError({ resId, message: err.message });
      alert(`Download restricted: ${err.message}`);
    } finally {
      setDownloadingResId(null);
    }
  };

  const ytEmbedUrl = getYouTubeEmbedUrl(youtubeUrl);

  return (
    <div className={`rounded-3xl border-2 border-slate-200/90 bg-white overflow-hidden shadow-xs space-y-5 p-5 sm:p-6 ${className}`}>
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider">
              Curriculum Module
            </span>
            {isUnlocked ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span>Escrow Confirmed • Unlocked</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                <Lock size={12} className="text-amber-600" />
                <span>Milestone Escrow Gated</span>
              </span>
            )}
          </div>
          <h3 className="text-slate-950 font-black text-base sm:text-lg">
            {module?.title || "Untitled Module"}
          </h3>
          {module?.description && (
            <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
              {module.description}
            </p>
          )}
        </div>
      </div>

      {/* Video Lecture Section */}
      {(youtubeUrl || videoUid) && (
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              {youtubeUrl ? (
                <>
                  <YouTubeIcon size={16} />
                  <span>YouTube Video Lecture (Unlisted)</span>
                </>
              ) : (
                <>
                  <Play size={14} className="text-purple-600" />
                  <span>Cloudflare Stream Video Lecture</span>
                </>
              )}
            </span>
            {videoUid && (
              <span className="text-[10px] text-purple-700 lowercase font-mono">
                uid: {videoUid.slice(0, 16)}...
              </span>
            )}
          </label>

          {/* Locked State (Unpaid) */}
          {!isUnlocked ? (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white flex flex-col items-center justify-center p-6 text-center border-2 border-slate-800 shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border-2 border-purple-400/40 flex items-center justify-center mb-3 shadow-lg backdrop-blur-xs">
                <Lock size={26} className="text-purple-300" />
              </div>

              <h4 className="font-black text-base sm:text-lg text-white">
                Video Lesson Gated by Smart Contract
              </h4>

              <p className="text-slate-300 text-xs sm:text-sm max-w-md mt-1 leading-relaxed">
                {youtubeUrl
                  ? "This unlisted YouTube video lecture unlocks automatically once milestone escrow payment is confirmed on Arbitrum One."
                  : playbackError?.message ||
                    "Deposit milestone escrow payment to Arbitrum One to unlock the Cloudflare Stream signed playback token."}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                <AlertCircle size={13} />
                <span>Complete payment to unlock this module</span>
              </div>
            </div>
          ) : youtubeUrl ? (
            /* Unlocked State: YouTube Embed */
            <div className="space-y-2">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-inner border border-red-200">
                {ytEmbedUrl ? (
                  <iframe
                    src={ytEmbedUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={module?.title || "Video Lecture"}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900">
                    <YouTubeIcon size={40} className="mb-3" />
                    <p className="text-sm font-bold">YouTube Video Ready for Playback</p>
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
                    >
                      <ExternalLink size={14} />
                      <span>Open Video on YouTube</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-red-600" />
                  <span>YouTube Access Active • Escrow Confirmed</span>
                </span>
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-700 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <ExternalLink size={12} />
                  <span>Watch in New Tab</span>
                </a>
              </div>
            </div>
          ) : tokenLoading ? (
            /* Cloudflare Token Loading */
            <div className="w-full aspect-video rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center gap-2">
              <Loader2 size={28} className="animate-spin text-purple-400" />
              <p className="text-xs font-bold text-slate-300">
                Verifying Arbitrum milestone escrow payment and issuing signed playback token...
              </p>
            </div>
          ) : playbackData ? (
            /* Unlocked State: Cloudflare Stream */
            <div className="space-y-2">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-inner border border-purple-200">
                {playbackData.iframeUrl ? (
                  <iframe
                    src={playbackData.iframeUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    className="w-full h-full object-cover"
                    src={playbackData.playbackUrl}
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-purple-600" />
                  <span>Signed Playback Token Active • Valid for 1 Hour</span>
                </span>
                {playbackData.expiresAt && (
                  <span className="text-[11px] text-slate-500 font-mono">
                    Expires: {new Date(playbackData.expiresAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Google Drive Resources Section */}
      {gdriveUrl && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <GoogleDriveIcon size={16} />
            <span>Google Drive Course Documents (Restricted Access)</span>
          </label>

          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white border border-blue-200 flex items-center justify-center shrink-0">
                <GoogleDriveIcon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-slate-900 font-bold text-xs truncate">
                  Course Materials & Companion Files
                </p>
                <p className="text-slate-500 text-[10px]">
                  Google Drive Storage • Restricted Access Mode
                </p>
              </div>
            </div>

            {isUnlocked ? (
              <a
                href={gdriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shrink-0 shadow-2xs"
              >
                <ExternalLink size={12} />
                <span>Open in Google Drive</span>
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/70 border border-amber-300 px-3 py-1.5 rounded-xl shrink-0">
                <Lock size={12} />
                <span>Locked</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Cloudflare R2 Documents Section */}
      {resources.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileText size={13} className="text-purple-600" />
            <span>Encrypted Documents & Slides ({resources.length})</span>
          </label>

          <div className="space-y-2">
            {resources.map((resItem, rIdx) => {
              const resId = resItem.id || resItem.resourceId || `res-${rIdx}`;
              const isDownloading = downloadingResId === resId;

              return (
                <div
                  key={resId}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-purple-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-900 font-bold text-xs truncate">
                        {resItem.name}
                      </p>
                      <p className="text-slate-400 text-[10px]">
                        Private R2 Vault • 15m Presigned Download
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadResource(resItem)}
                    disabled={isDownloading || !isUnlocked}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      !isUnlocked
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 text-white shadow-2xs"
                    }`}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Downloading...</span>
                      </>
                    ) : !isUnlocked ? (
                      <>
                        <Lock size={12} />
                        <span>Locked</span>
                      </>
                    ) : (
                      <>
                        <Download size={12} />
                        <span>Download File</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GitHub Practice Repository */}
      {githubUrl && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <FileCode size={14} className="text-slate-500" />
            <span className="font-bold">Practice Code Repository:</span>
            <span className="font-mono text-slate-500 text-[11px] truncate max-w-xs">
              {githubUrl}
            </span>
          </div>

          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-purple-700 hover:underline font-bold shrink-0 text-xs"
          >
            <span>View on GitHub</span>
            <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  );
}
