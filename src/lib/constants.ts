export const STATUS_COLORS: Record<string, string> = {
  LEAD: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  CONTACTED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  RESPONDED: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  NEGOTIATING: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  AGREED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  ONBOARDING: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  ACTIVE: "bg-green-500/20 text-green-300 border-green-500/30",
  PAUSED: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  CHURNED: "bg-red-500/20 text-red-300 border-red-500/30",
  REJECTED: "bg-red-700/20 text-red-400 border-red-700/30",
};

export const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-500/20 text-red-300 border-red-500/30",
  MEDIUM: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  LOW: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

export const PLATFORM_ICONS: Record<string, string> = {
  INSTAGRAM: "instagram",
  TIKTOK: "music-2",
  YOUTUBE: "youtube",
  MULTI_PLATFORM: "globe",
  INSTAGRAM_REEL: "instagram",
  INSTAGRAM_STORY: "instagram",
  YOUTUBE_SHORT: "youtube",
  YOUTUBE_VIDEO: "youtube",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  INVOICED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  PAID: "bg-green-500/20 text-green-300 border-green-500/30",
  DISPUTED: "bg-red-500/20 text-red-300 border-red-500/30",
  SCHEDULED: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  PROCESSING: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  COMPLETED: "bg-green-500/20 text-green-300 border-green-500/30",
  FAILED: "bg-red-500/20 text-red-300 border-red-500/30",
};

export const PIPELINE_STAGES = [
  "LEAD",
  "CONTACTED",
  "RESPONDED",
  "NEGOTIATING",
  "AGREED",
  "ONBOARDING",
  "ACTIVE",
] as const;

export const ALL_STATUSES = [
  "LEAD",
  "CONTACTED",
  "RESPONDED",
  "NEGOTIATING",
  "AGREED",
  "ONBOARDING",
  "ACTIVE",
  "PAUSED",
  "CHURNED",
  "REJECTED",
] as const;

export const CATEGORIES = [
  "TCG",
  "GAMBLING",
  "GAMING",
  "LIFESTYLE",
  "COMEDY",
  "OTHER",
] as const;

export const PLATFORMS = [
  "INSTAGRAM",
  "TIKTOK",
  "YOUTUBE",
  "MULTI_PLATFORM",
] as const;

export const VIDEO_PLATFORMS = [
  "INSTAGRAM_REEL",
  "INSTAGRAM_STORY",
  "TIKTOK",
  "YOUTUBE_SHORT",
  "YOUTUBE_VIDEO",
] as const;

export const CONTENT_TYPES = [
  "PACK_OPENING",
  "REVIEW",
  "UNBOXING",
  "GIVEAWAY",
  "TESTIMONIAL",
  "TUTORIAL",
  "OTHER",
] as const;

export const RATE_TYPES = [
  "FLAT",
  "CPM",
  "HYBRID",
  "REVENUE_SHARE",
  "BARTER",
] as const;

export const PAYMENT_TERMS = [
  "NET_15",
  "NET_30",
  "NET_60",
  "ON_DELIVERY",
] as const;

export const SOURCES = [
  "OUTBOUND_DM",
  "INBOUND",
  "REFERRAL",
  "AGENCY",
  "OTHER",
] as const;

export const TONES = [
  "CASUAL_MALE",
  "CASUAL_FEMALE",
  "FORMAL",
  "NEUTRAL",
] as const;

export const TEMPLATE_CATEGORIES = [
  "INITIAL_OUTREACH",
  "FOLLOW_UP",
  "NEGOTIATION",
  "ONBOARDING",
  "REACTIVATION",
  "RATE_RESPONSE",
  "INFO_RESPONSE",
  "CUSTOM",
] as const;

export const TEMPLATE_PLATFORMS = [
  "INSTAGRAM_DM",
  "EMAIL",
  "TIKTOK_DM",
  "UNIVERSAL",
] as const;

export const CHART_COLORS = {
  primary: "#7C3AED",
  primaryLight: "#9461F5",
  secondary: "#4C1D95",
  green: "#22C55E",
  amber: "#F59E0B",
  red: "#EF4444",
  blue: "#3B82F6",
  cyan: "#06B6D4",
  gray: "#64748B",
};
