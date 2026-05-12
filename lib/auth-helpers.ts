import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  return session.user as { id: string; name?: string | null; email?: string | null; image?: string | null };
}
