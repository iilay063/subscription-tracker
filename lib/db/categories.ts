import { db } from "./index";
import { categories, type NewCategory } from "./schema";
import { and, asc, eq, sql } from "drizzle-orm";
import { findPreset } from "@/lib/categories-presets";

export async function listCategoriesForUser(userId: string) {
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.name));
}

export async function createCategory(input: NewCategory) {
  const [row] = await db.insert(categories).values(input).returning();
  return row;
}

/**
 * Find a category by case-insensitive name match for the user, creating it
 * if missing. If the name matches a preset, the preset's name (canonical
 * casing), color and icon are used on creation.
 */
export async function findOrCreateCategory(
  userId: string,
  name: string,
  colorOverride?: string,
  iconOverride?: string,
) {
  const existing = await db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.userId, userId),
        sql`lower(${categories.name}) = lower(${name})`,
      ),
    )
    .limit(1);
  if (existing[0]) return existing[0];

  const preset = findPreset(name);
  return createCategory({
    userId,
    name: preset?.name ?? name,
    color: colorOverride ?? preset?.color ?? "#94a3b8",
    icon: iconOverride ?? preset?.icon ?? "tag",
  });
}

export async function deleteCategory(id: string, userId: string) {
  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));
}
