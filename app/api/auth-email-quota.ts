import { env } from "cloudflare:workers";

const HOURLY_LIMIT = 2;
const WINDOW_MS = 60 * 60 * 1000;

export type AuthEmailQuota = {
  limit: number;
  used: number;
  available: number;
  nextAvailableAt: string | null;
};

export async function getAuthEmailQuota(now = new Date()): Promise<AuthEmailQuota> {
  const cutoff = new Date(now.getTime() - WINDOW_MS).toISOString();
  const row = await env.DB.prepare(
    `SELECT COUNT(*) AS total, MIN(created_at) AS oldest
     FROM auth_email_events
     WHERE created_at > ?`,
  ).bind(cutoff).first<{ total: number; oldest: string | null }>();
  const used = Math.min(HOURLY_LIMIT, Number(row?.total ?? 0));
  const oldest = row?.oldest ? new Date(row.oldest) : null;

  return {
    limit: HOURLY_LIMIT,
    used,
    available: Math.max(0, HOURLY_LIMIT - used),
    nextAvailableAt:
      used >= HOURLY_LIMIT && oldest
        ? new Date(oldest.getTime() + WINDOW_MS).toISOString()
        : null,
  };
}

export async function reserveAuthEmail(email: string) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - WINDOW_MS).toISOString();
  const id = crypto.randomUUID();
  const result = await env.DB.prepare(
    `INSERT INTO auth_email_events (id, email, created_at)
     SELECT ?, ?, ?
     WHERE EXISTS (SELECT 1 FROM access_users WHERE email = ? AND status = 'active')
       AND (SELECT COUNT(*) FROM auth_email_events WHERE created_at > ?) < ?`,
  ).bind(id, email, now.toISOString(), email, cutoff, HOURLY_LIMIT).run();

  return result.meta.changes ? id : null;
}

export async function releaseAuthEmail(id: string) {
  await env.DB.prepare("DELETE FROM auth_email_events WHERE id = ?").bind(id).run();
}

export async function markAuthEmailRateLimited(id: string) {
  const existing = await env.DB.prepare(
    "SELECT email FROM auth_email_events WHERE id = ?",
  ).bind(id).first<{ email: string }>();
  if (!existing) return;

  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT OR IGNORE INTO auth_email_events (id, email, created_at)
     VALUES (?, ?, ?)`,
  ).bind(crypto.randomUUID(), existing.email, now).run();
}
