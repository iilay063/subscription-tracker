import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="container flex min-h-screen items-center justify-center py-16">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Use your Google account to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              Continue with Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
