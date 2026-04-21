import fs from "fs";
import path from "path";
import crypto from "crypto";

const dbPath = process.env.DATABASE_PATH ?? "./data/keys.json";
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

interface KeyRecord {
  email: string;
  tier: "free" | "pro";
  stripe_id?: string;
  created_at: number;
}

interface UsageRecord {
  [date: string]: number;
}

interface Store {
  keys: Record<string, KeyRecord>;
  usage: Record<string, UsageRecord>;
}

const FREE_DAILY_LIMIT = 100;

function load(): Store {
  try {
    return JSON.parse(fs.readFileSync(dbPath, "utf8"));
  } catch {
    return { keys: {}, usage: {} };
  }
}

function save(store: Store): void {
  fs.writeFileSync(dbPath, JSON.stringify(store, null, 2));
}

export function createKey(email: string, tier: "free" | "pro", stripeId?: string): string {
  const store = load();
  const key = "sk_" + crypto.randomBytes(24).toString("hex");
  store.keys[key] = { email, tier, stripe_id: stripeId, created_at: Date.now() };
  save(store);
  return key;
}

export function lookupKey(key: string): { email: string; tier: string } | null {
  const record = load().keys[key];
  return record ? { email: record.email, tier: record.tier } : null;
}

export function upgradeKey(stripeId: string): void {
  const store = load();
  for (const record of Object.values(store.keys)) {
    if (record.stripe_id === stripeId) record.tier = "pro";
  }
  save(store);
}

export function downgradeKey(stripeId: string): void {
  const store = load();
  for (const record of Object.values(store.keys)) {
    if (record.stripe_id === stripeId) record.tier = "free";
  }
  save(store);
}

export function checkAndIncrementUsage(
  key: string,
  tier: string
): { allowed: boolean; used: number; limit: number | null } {
  const store = load();
  const today = new Date().toISOString().slice(0, 10);
  store.usage[key] ??= {};
  store.usage[key][today] ??= 0;
  const used = store.usage[key][today];

  if (tier !== "free") {
    store.usage[key][today]++;
    save(store);
    return { allowed: true, used: used + 1, limit: null };
  }

  if (used >= FREE_DAILY_LIMIT) {
    return { allowed: false, used, limit: FREE_DAILY_LIMIT };
  }

  store.usage[key][today]++;
  save(store);
  return { allowed: true, used: used + 1, limit: FREE_DAILY_LIMIT };
}

export function getUsage(key: string): { date: string; count: number }[] {
  const usageByKey = load().usage[key] ?? {};
  return Object.entries(usageByKey)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 30)
    .map(([date, count]) => ({ date, count }));
}
