import { format } from "date-fns";
import { formatMoney } from "@/lib/money";

export function reminderEmail(params: {
  userName: string | null;
  subscriptionName: string;
  cost: number;
  currency: string;
  daysUntil: number;
  nextBillingDate: Date;
  appUrl: string;
  subscriptionId: string;
}) {
  const { userName, subscriptionName, cost, currency, daysUntil, nextBillingDate, appUrl, subscriptionId } =
    params;
  const dateStr = format(nextBillingDate, "EEEE, MMM d");
  const when =
    daysUntil <= 0 ? "today" : daysUntil === 1 ? "tomorrow" : `in ${daysUntil} days`;
  const subject = `${subscriptionName} renews ${when}`;
  const url = `${appUrl}/subscriptions/${subscriptionId}`;

  const text = [
    `Hi${userName ? " " + userName : ""},`,
    "",
    `${subscriptionName} is set to renew ${when} (${dateStr}) for ${formatMoney(cost, currency)}.`,
    "",
    `Manage it here: ${url}`,
    "",
    `— Subscription Tracker`,
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#0f172a; max-width:560px; margin:0 auto; padding:24px;">
      <h2 style="font-size:18px; margin:0 0 16px;">Heads up: ${escape(subscriptionName)} renews ${when}</h2>
      <p style="margin:0 0 12px;">Hi${userName ? " " + escape(userName) : ""},</p>
      <p style="margin:0 0 12px;">
        <strong>${escape(subscriptionName)}</strong> is set to renew on
        <strong>${escape(dateStr)}</strong> for
        <strong>${escape(formatMoney(cost, currency))}</strong>.
      </p>
      <p style="margin:0 0 24px;">
        If you want to cancel, do it before then.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${url}" style="display:inline-block; background:#0f172a; color:white; padding:10px 16px; border-radius:6px; text-decoration:none;">
          View subscription
        </a>
      </p>
      <p style="margin:0; color:#64748b; font-size:12px;">
        Sent by Subscription Tracker. Manage reminder preferences in your settings.
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
