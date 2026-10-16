import React from "react";

/**
 * Design Tokens & Reusable UI Primitives for "Calm Learning Platform" (Notion/Linear vibe)
 * Palette: Violet-600 (Primary), Violet-50 (Soft), Violet-900 (Deep), Gray-900/500/400/100, Emerald-600, Amber-500, Rose-500
 */

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[44px] px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[44px] px-4 py-2.5 rounded-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-violet-200 font-medium text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[40px] px-3.5 py-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 font-medium text-xs sm:text-sm transition-all duration-200 inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
  hoverable = true,
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-xs ${
        hoverable ? "hover:border-violet-200 hover:shadow-md transition-all duration-200" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  highlight = false,
  className = "",
}) {
  return (
    <Card className={`p-5 sm:p-6 flex flex-col justify-between ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3 shrink-0">
        {Icon && <Icon size={20} />}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className="text-slate-900 text-3xl font-extrabold tracking-tight mt-1 tabular-nums">
          {value}
        </p>
        {subtext && (
          <p className="text-xs text-gray-400 mt-1 truncate">
            {subtext}
          </p>
        )}
      </div>
    </Card>
  );
}

export function StatusPill({ status, label, className = "" }) {
  const normalized = (status || "").toUpperCase();

  const colorMap = {
    ACCEPTED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    CONFIRMED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    VERIFIED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    FUNDED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    PENDING: "bg-amber-50 text-amber-600 border-amber-100",
    IN_SESSION: "bg-violet-50 text-violet-700 border-violet-100",
    DECLINED: "bg-gray-100 text-gray-600 border-gray-200",
    CANCELLED: "bg-rose-50 text-rose-600 border-rose-100",
    DISPUTED: "bg-rose-50 text-rose-600 border-rose-100",
    FROZEN: "bg-rose-50 text-rose-600 border-rose-100",
  };

  const style = colorMap[normalized] || "bg-gray-50 text-gray-600 border-gray-100";
  const displayLabel = label || status || "Status";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      <span className="truncate">{displayLabel}</span>
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  actionHref,
  className = "",
}) {
  return (
    <div
      className={`p-10 sm:p-14 bg-white rounded-2xl border border-gray-100 text-center flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-1">
          <Icon size={24} />
        </div>
      )}
      <h4 className="font-bold text-gray-900 text-base">{title}</h4>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {actionText && (
        <div className="pt-2">
          {actionHref ? (
            <a href={actionHref}>
              <PrimaryButton>{actionText}</PrimaryButton>
            </a>
          ) : (
            <PrimaryButton onClick={onAction}>{actionText}</PrimaryButton>
          )}
        </div>
      )}
    </div>
  );
}
