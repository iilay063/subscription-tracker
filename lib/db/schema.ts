import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  decimal,
  uuid,
  pgEnum,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccount } from "next-auth/adapters";

export const billingCycleEnum = pgEnum("billing_cycle", [
  "monthly",
  "yearly",
  "weekly",
  "custom_days",
]);

export const reminderChannelEnum = pgEnum("reminder_channel", ["email"]);

export const reminderKindEnum = pgEnum("reminder_kind", [
  "renewal",
  "trial_ending",
  "budget_alert",
]);

// ---------- Auth.js tables ----------

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),

  preferredCurrency: text("preferred_currency").notNull().default("USD"),
  reminderLeadDays: integer("reminder_lead_days").notNull().default(3),
  monthlyBudget: decimal("monthly_budget", { precision: 12, scale: 2 }),
  budgetAlertSentForMonth: text("budget_alert_sent_for_month"), // YYYY-MM

  // Subscription detection — when the user last ran a Gmail inbox scan.
  gmailLastScannedAt: timestamp("gmail_last_scanned_at", {
    mode: "date",
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (a) => ({
    pk: primaryKey({ columns: [a.provider, a.providerAccountId] }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.identifier, t.token] }) }),
);

// ---------- App tables ----------

export const categories = pgTable(
  "category",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull().default("#64748b"),
    icon: text("icon").notNull().default("tag"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("category_user_idx").on(t.userId),
  }),
);

export const subscriptions = pgTable(
  "subscription",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),

    name: text("name").notNull(),
    description: text("description"),
    cost: decimal("cost", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),

    billingCycle: billingCycleEnum("billing_cycle").notNull(),
    customDays: integer("custom_days"),

    nextBillingDate: timestamp("next_billing_date", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    startedAt: timestamp("started_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    cancelledAt: timestamp("cancelled_at", {
      mode: "date",
      withTimezone: true,
    }),
    isActive: boolean("is_active").notNull().default(true),

    // Free trial tracking
    isTrial: boolean("is_trial").notNull().default(false),
    trialEndsAt: timestamp("trial_ends_at", {
      mode: "date",
      withTimezone: true,
    }),

    // Per-subscription reminder lead override (null → use user default)
    reminderLeadDaysOverride: integer("reminder_lead_days_override"),

    url: text("url"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("subscription_user_idx").on(t.userId),
    nextBillingIdx: index("subscription_next_billing_idx").on(
      t.nextBillingDate,
    ),
    activeIdx: index("subscription_active_idx").on(t.isActive),
  }),
);

export const billingHistory = pgTable(
  "billing_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull(),
    amountInUserCurrency: decimal("amount_in_user_currency", {
      precision: 12,
      scale: 2,
    }).notNull(),
    userCurrency: text("user_currency").notNull(),
    exchangeRate: decimal("exchange_rate", {
      precision: 18,
      scale: 8,
    }).notNull(),
    billedAt: timestamp("billed_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    subIdx: index("billing_history_sub_idx").on(t.subscriptionId),
    billedAtIdx: index("billing_history_billed_at_idx").on(t.billedAt),
  }),
);

export const reminderLog = pgTable(
  "reminder_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    sentAt: timestamp("sent_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    channel: reminderChannelEnum("channel").notNull().default("email"),
    kind: reminderKindEnum("kind").notNull().default("renewal"),
    success: boolean("success").notNull(),
    errorMessage: text("error_message"),
    // Used to dedupe: the date the reminder was about (renewal billing date,
    // or trial end date depending on kind).
    forBillingDate: timestamp("for_billing_date", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (t) => ({
    subIdx: index("reminder_log_sub_idx").on(t.subscriptionId),
    forBillingIdx: index("reminder_log_for_billing_idx").on(t.forBillingDate),
  }),
);

export const exchangeRatesCache = pgTable(
  "exchange_rates_cache",
  {
    baseCurrency: text("base_currency").notNull(),
    quoteCurrency: text("quote_currency").notNull(),
    rate: decimal("rate", { precision: 18, scale: 8 }).notNull(),
    fetchedAt: timestamp("fetched_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.baseCurrency, t.quoteCurrency] }),
  }),
);

// ---------- Relations ----------

export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  categories: many(categories),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(
  subscriptions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [subscriptions.userId],
      references: [users.id],
    }),
    category: one(categories, {
      fields: [subscriptions.categoryId],
      references: [categories.id],
    }),
    billingHistory: many(billingHistory),
    reminders: many(reminderLog),
  }),
);

export const billingHistoryRelations = relations(billingHistory, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [billingHistory.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type BillingHistoryRow = typeof billingHistory.$inferSelect;
export type ReminderLogRow = typeof reminderLog.$inferSelect;
export type BillingCycle = (typeof billingCycleEnum.enumValues)[number];
