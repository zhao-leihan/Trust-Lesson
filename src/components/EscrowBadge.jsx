import { Shield, Lock, CheckCircle, AlertCircle, Clock } from "lucide-react";

const statusConfig = {
  locked: {
    label: "Locked",
    bg: "bg-violet-600",
    text: "text-white",
    Icon: Lock,
  },
  "in-session": {
    label: "In session",
    bg: "bg-sunshine",
    text: "text-navy",
    Icon: Clock,
  },
  released: {
    label: "Released",
    bg: "bg-mint",
    text: "text-white",
    Icon: CheckCircle,
  },
  disputed: {
    label: "Disputed",
    bg: "bg-coral",
    text: "text-white",
    Icon: AlertCircle,
  },
  pending: {
    label: "Pending",
    bg: "bg-sunshine",
    text: "text-navy",
    Icon: Clock,
  },
};

export default function EscrowBadge({ status = "locked", size = "sm" }) {
  const config = statusConfig[status] || statusConfig.locked;
  const { label, bg, text, Icon } = config;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${bg} ${text} ${
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-1.5 text-sm"
      }`}
    >
      <Icon size={size === "sm" ? 11 : 14} />
      {label}
    </span>
  );
}
