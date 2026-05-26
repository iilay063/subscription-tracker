/**
 * Fixed list of categories the user can pick from. Colors come from the Halo
 * design palette — a smaller, harmonious set that reads well on both warm
 * dark and warm light canvases.
 *
 * Migration policy: existing user-created categories (from before this
 * change) are NOT rewritten in the DB. We resolve colors at read time
 * via {@link resolveCategoryColor} so legacy categories still render
 * with a distinct color. On the next edit, the form preselects "Other"
 * for unmatched names — saving will reassign them.
 */
const HALO = {
  emerald: "#2B8F66",
  coral: "#E18B6B",
  periwinkle: "#7C9CFF",
  teal: "#5DC2D0",
  sand: "#C9A87C",
  pink: "#E879B7",
  violet: "#8C6FFF",
  grey: "#84807A",
} as const;

export const PRESET_CATEGORIES = [
  { name: "Streaming",        color: HALO.coral,      icon: "tv" },
  { name: "Music",            color: HALO.coral,      icon: "music" },
  { name: "Gaming",           color: HALO.coral,      icon: "gamepad-2" },
  { name: "Software",         color: HALO.periwinkle, icon: "code" },
  { name: "AI",               color: HALO.violet,     icon: "sparkles" },
  { name: "Cloud & Hosting",  color: HALO.teal,       icon: "cloud" },
  { name: "Productivity",     color: HALO.emerald,    icon: "briefcase" },
  { name: "News & Reading",   color: HALO.sand,       icon: "newspaper" },
  { name: "Education",        color: HALO.sand,       icon: "graduation-cap" },
  { name: "Fitness & Health", color: HALO.pink,       icon: "dumbbell" },
  { name: "Food & Drink",     color: HALO.coral,      icon: "utensils" },
  { name: "Shopping",         color: HALO.pink,       icon: "shopping-bag" },
  { name: "Utilities",        color: HALO.teal,       icon: "bolt" },
  { name: "Insurance",        color: HALO.grey,       icon: "shield" },
  { name: "Other",            color: HALO.grey,       icon: "tag" },
] as const;

export type PresetCategoryName = (typeof PRESET_CATEGORIES)[number]["name"];

const FALLBACK_PALETTE = [
  HALO.coral, HALO.emerald, HALO.periwinkle, HALO.teal,
  HALO.sand, HALO.pink, HALO.violet,
];

export function findPreset(name: string) {
  const lower = name.trim().toLowerCase();
  return PRESET_CATEGORIES.find((p) => p.name.toLowerCase() === lower);
}

/** Returns a stable color for a category by name. Used everywhere we draw a category. */
export function resolveCategoryColor(name: string | null | undefined): string {
  if (!name) return HALO.grey;
  const preset = findPreset(name);
  if (preset) return preset.color;
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
