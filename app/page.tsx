import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-8 py-16 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Know what you&apos;re paying for.
        </h1>
        <p className="mx-auto max-w-prose text-lg text-muted-foreground">
          Track recurring subscriptions in one place. See monthly and yearly
          totals, get email reminders before renewals, and cancel what you
          don&apos;t use.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/sign-in">Sign in with Google</Link>
      </Button>
    </main>
  );
}
