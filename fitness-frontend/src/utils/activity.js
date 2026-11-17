const TYPES = {
  RUNNING: { label: "Running", icon: "🏃", color: "#0E9F6E" },
  WALKING: { label: "Walking", icon: "🚶", color: "#3B82F6" },
  CYCLING: { label: "Cycling", icon: "🚴", color: "#F59E0B" },
  SWIMMING: { label: "Swimming", icon: "🏊", color: "#06B6D4" },
  WEIGHT_TRAINING: { label: "Weight training", icon: "🏋️", color: "#8B5CF6" },
  YOGA: { label: "Yoga", icon: "🧘", color: "#EC4899" },
  HIIT: { label: "HIIT", icon: "⚡", color: "#EF4444" },
  CARDIO: { label: "Cardio", icon: "❤️", color: "#F43F5E" },
  STRETCHING: { label: "Stretching", icon: "🤸", color: "#14B8A6" },
  OTHER: { label: "Other", icon: "✨", color: "#6B7280" },
};

export const TYPE_OPTIONS = Object.entries(TYPES).map(([value, m]) => ({ value, ...m }));
export const typeMeta = (t) => TYPES[t] ?? { label: t ?? "Activity", icon: "✨", color: "#6B7280" };

// startTime is optional in the backend; older records only have createdAt.
export const activityDate = (a) => new Date(a.startTime ?? a.createdAt ?? Date.now());
export const dayKey = (d) => d.toLocaleDateString("en-CA"); // local YYYY-MM-DD
export const fmtDate = (d) =>
  d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
