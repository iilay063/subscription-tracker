import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/lib/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  pages: { signIn: "/sign-in" },
  callbacks: {
    session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    // Auth.js does not refresh stored OAuth tokens when a user signs in again
    // with an already-linked account, so a re-consent (e.g. to grant the Gmail
    // scope) would otherwise be discarded. Write the fresh tokens/scope back to
    // the account row on every Google sign-in.
    async signIn({ account }) {
      if (account?.provider === "google" && account.scope) {
        await db
          .update(accounts)
          .set({
            access_token: account.access_token,
            expires_at: account.expires_at,
            scope: account.scope,
            ...(account.refresh_token
              ? { refresh_token: account.refresh_token }
              : {}),
          })
          .where(
            and(
              eq(accounts.provider, "google"),
              eq(accounts.providerAccountId, account.providerAccountId),
            ),
          );
      }
    },
  },
});