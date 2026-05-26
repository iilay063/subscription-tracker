import { format } from "date-fns";

export function trialEndingEmail(params: {
  userName: string | null;
  subscriptionName: string;
  daysUntil: number;
  trialEndsAt: Date;
  appUrl: string;
  subscriptionId: string;
}) {
  const {
    userName,
    subscriptionName,
    daysUntil,
    trialEndsAt,
    appUrl,
    subscriptionId,
  } = params;
  const dateStr = format(trialEndsAt, "EEEE, MMM d");
  const when =
    daysUntil <= 0 ? "today" : daysUntil === 1 ? "tomorrow" : `in ${daysUntil} days`;
  const subject = `${subscriptionName} trial ends ${when}`;
  const url = `${appUrl}/subscriptions/${subscriptionId}`;

  const text = [
    `Hi${userName ? " " + userName : ""},`,
    "",
    `Your free trial of ${subscriptionName} ends ${when} (${dateStr}). After that you'll be charged the regular price.`,
    "",
    `If you're not planning to keep it, cancel before then.`,
    "",
    `Subscription details: ${url}`,
    "",
    `— Subscription Tracker`,
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#0f172a; max-width:560px; margin:0 auto; padding:24px;">
      <h2 style="font-size:18px; margin:0 0 16px;">⏳ Your ${escape(subscriptionName)} trial ends ${when}</h2>
      <p style="margin:0 0 12px;">Hi${userName ? " " + escape(userName) : ""},</p>
      <p style="margin:0 0 12px;">
        Your free trial of <strong>${escape(subscriptionName)}</strong> ends on
        <strong>${escape(dateStr)}</strong>. After that you'll start getting
        charged at the regular price.
      </p>
      <p style="margin:0 0 24px;">
        If you don't want to keep it, cancel before then.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${url}" style="display:inline-block; background:#7c3aed; color:white; padding:10px 16px; border-radius:6px; text-decoration:none;">
          View subscription
        </a>
      </p>
      <p style="margin:0; color:#64748b; font-size:12px;">
        Sent by Subscription Tracker.
      </p>
    </div>
  `;

  return { subject, text, html };
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
