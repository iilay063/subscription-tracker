/**
 * Fixed list of categories the user can pick from. Colors are chosen to
 * read well next to each other in the dashboard pie chart.
 *
 * Migration policy: existing user-created categories (from before this
 * change) are NOT rewritten in the DB. We resolve colors at read time
 * via {@link resolveCategoryColor} so legacy categories still render
 * with a distinct color. On the next edit, the form preselects "Other"
 * for unmatched names — saving will reassign them.
 */
export const PRESET_CATEGORIES = [
  { name: "Streaming",        color: "#ef4444", icon: "tv" },
  { name: "Music",            color: "#f97316", icon: "music" },
  { name: "Gaming",           color: "#10b981", icon: "gamepad-2" },
  { name: "Software",         color: "#3b82f6", icon: "code" },
  { name: "AI",               color: "#a855f7", icon: "sparkles" },
  { name: "Cloud & Hosting",  color: "#06b6d4", icon: "cloud" },
  { name: "Productivity",     color: "#14b8a6", icon: "briefcase" },
  { name: "News & Reading",   color: "#8b5cf6", icon: "newspaper" },
  { name: "Education",        color: "#eab308", icon: "graduation-cap" },
  { name: "Fitness & Health", color: "#22c55e", icon: "dumbbell" },
  { name: "Food & Drink",     color: "#f59e0b", icon: "utensils" },
  { name: "Shopping",         color: "#ec4899", icon: "shopping-bag" },
  { name: "Utilities",        color: "#0ea5e9", icon: "bolt" },
  { name: "Insurance",        color: "#475569", icon: "shield" },
  { name: "Other",            color: "#94a3b8", icon: "tag" },
] as const;

export type PresetCategoryName = (typeof PRESET_CATEGORIES)[number]["name"];

/** Deterministic palette for legacy categories not in the preset list. */
const FALLBACK_PALETTE = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e",
];

export function findPreset(name: string) {
  const lower = name.trim().toLowerCase();
  return PRESET_CATEGORIES.find((p) => p.name.toLowerCase() === lower);
}

/** Returns a stable color for a category by name. Used everywhere we draw a category. */
export function resolveCategoryColor(name: string | null | undefined): string {
  if (!name) return "#94a3b8";
  const preset = findPreset(name);
  if (preset) return preset.color;
  // Hash the name into the fallback palette so legacy categories get distinct colors.
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return FALLBACK_PALETTE[Math.abs(hash) % FALLBACK_PALETTE.length];
}

/** True if a name doesn't match any preset (case-insensitive). */
export function isLegacyCategory(name: string | null | undefined): boolean {
  if (!name) return false;
  return !findPreset(name);
}
