import { formatMoney } from "@/lib/money";

export function budgetAlertEmail(params: {
  userName: string | null;
  monthlyTotal: number;
  budget: number;
  currency: string;
  appUrl: string;
}) {
  const { userName, monthlyTotal, budget, currency, appUrl } = params;
  const over = monthlyTotal - budget;
  const subject = `You're over your monthly subscription budget`;
  const totalStr = formatMoney(monthlyTotal, currency);
  const budgetStr = formatMoney(budget, currency);
  const overStr = formatMoney(over, currency);

  const text = [
    `Hi${userName ? " " + userName : ""},`,
    "",
    `Your active subscriptions add up to ${totalStr} per month, which is ${overStr} over your ${budgetStr} budget.`,
    "",
    `Review them and cancel anything you don't use:`,
    `${appUrl}/dashboard`,
    "",
    `— Subscription Tracker`,
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#0f172a; max-width:560px; margin:0 auto; padding:24px;">
      <h2 style="font-size:18px; margin:0 0 16px;">📊 You're over your monthly budget</h2>
      <p style="margin:0 0 12px;">Hi${userName ? " " + escape(userName) : ""},</p>
      <p style="margin:0 0 12px;">
        Your active subscriptions add up to <strong>${totalStr}</strong> per month.
        That's <strong style="color:#dc2626;">${overStr}</strong> over your
        ${budgetStr} budget.
      </p>
      <p style="margin:0 0 24px;">
        Take a minute to review them and cancel anything you don't use.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${appUrl}/dashboard" style="display:inline-block; background:#0f172a; color:white; padding:10px 16px; border-radius:6px; text-decoration:none;">
          Review subscriptions
        </a>
      </p>
      <p style="margin:0; color:#64748b; font-size:12px;">
        You only get one of these per month. Adjust or disable in Settings.
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
