import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";

export async function getUserById(id: string) {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function updateUserSettings(
  id: string,
  patch: { preferredCurrency?: string; reminderLeadDays?: number },
) {
  const [row] = await db
    .update(users)
    .set(patch)
    .where(eq(users.id, id))
    .returning();
  return row;
}
