import type { Config } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";

// drizzle-kit doesn't auto-load .env.local the way Next.js does.
for (const file of [".env.local", ".env"]) {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const [, k, rawV] = m;
    const v = rawV.replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
} satisfies Config;
