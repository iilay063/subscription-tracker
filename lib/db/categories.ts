import { db } from "./index";
import { categories, type NewCategory } from "./schema";
import { and, asc, eq } from "drizzle-orm";

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

export async function findOrCreateCategory(
  userId: string,
  name: string,
  color = "#64748b",
  icon = "tag",
) {
  const existing = await db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.name, name)))
    .limit(1);
  if (existing[0]) return existing[0];
  return createCategory({ userId, name, color, icon });
}

export async function deleteCategory(id: string, userId: string) {
  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));
}
