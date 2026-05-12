import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Subscription Tracker",
  description:
    "Track recurring subscriptions, see what you pay, and get reminders before renewals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
