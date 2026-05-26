import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Subscription Tracker",
  description:
    "Track recurring subscriptions, see what you pay, and get reminders before renewals.",
};

// Inline script that sets the html.dark class before paint so dark mode
// doesn't flash white on first load. We put it as the first child of <body>
// (rather than in <head>) because some browser extensions inject scripts into
// <head> which shifts React's fiber tree and causes hydration mismatches.
const setThemeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{ __html: setThemeScript }}
          suppressHydrationWarning
        />
        {children}
      </body>
    </html>
  );
}
