import { createClient } from "@supabase/supabase-js";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { accessUsers, financeCards } from "@/db/schema";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/app/supabase-config";

export type AppRole = "admin" | "user";
export type AccessStatus = "active" | "blocked";

export type AuthenticatedAppUser = {
  id: string;
  email: string;
  displayName: string;
  role: AppRole;
  status: AccessStatus;
};

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
});

export async function requireSupabaseUser(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return {
      user: null,
      response: Response.json(
        { error: "Faca login para acessar seus cards financeiros." },
        { status: 401 },
      ),
    };
  }

  const { data, error } = await supabase.auth.getUser(token);
  const authUser = data.user;
  const email = authUser?.email?.toLowerCase();

  if (error || !authUser || !email) {
    return {
      user: null,
      response: Response.json(
        { error: "Sessao invalida. Entre novamente." },
        { status: 401 },
      ),
    };
  }

  const db = getDb();
  const [access] = await db
    .select()
    .from(accessUsers)
    .where(eq(accessUsers.email, email))
    .limit(1);

  if (!access) {
    return {
      user: null,
      response: Response.json(
        {
          error:
            "Este e-mail ainda nao foi autorizado. Peca para o administrador liberar seu acesso.",
          status: "pending",
          email,
        },
        { status: 403 },
      ),
    };
  }

  const now = new Date().toISOString();
  await db
    .update(accessUsers)
    .set({ userId: authUser.id, lastLoginAt: now, updatedAt: now })
    .where(eq(accessUsers.email, email));
  await migrateLegacyCards(request, email, authUser.id);

  if (access.status !== "active") {
    return {
      user: null,
      response: Response.json(
        {
          error:
            "Seu acesso esta bloqueado. Fale com o administrador para reativar.",
          status: access.status,
          email,
        },
        { status: 403 },
      ),
    };
  }

  return {
    user: {
      id: authUser.id,
      email,
      displayName: getSupabaseDisplayName(authUser.user_metadata, email),
      role: access.role === "admin" ? "admin" : "user",
      status: "active" as const,
    },
    response: null,
  };
}

export async function requireAdminUser(request: Request) {
  const { user, response } = await requireSupabaseUser(request);
  if (!user) return { user: null, response };

  if (user.role !== "admin") {
    return {
      user: null,
      response: Response.json(
        { error: "Apenas administradores podem gerenciar acessos." },
        { status: 403 },
      ),
    };
  }

  return { user, response: null };
}

export async function listAccessUsers() {
  return getDb()
    .select()
    .from(accessUsers)
    .orderBy(accessUsers.email);
}

export async function upsertAccessUser(input: {
  email: string;
  role: AppRole;
  status: AccessStatus;
}) {
  const email = input.email.trim().toLowerCase();
  const now = new Date().toISOString();
  const role = input.role === "admin" ? "admin" : "user";
  const status = input.status === "blocked" ? "blocked" : "active";

  if (!email || !email.includes("@")) {
    return Response.json({ error: "Informe um e-mail valido." }, { status: 400 });
  }

  await getDb()
    .insert(accessUsers)
    .values({
      email,
      role,
      status,
      userId: null,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
    })
    .onConflictDoUpdate({
      target: accessUsers.email,
      set: { role, status, updatedAt: now },
    });

  return null;
}

export async function updateAccessUserStatus(
  email: string,
  status: AccessStatus,
) {
  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date().toISOString();

  await getDb()
    .update(accessUsers)
    .set({ status, updatedAt: now })
    .where(and(eq(accessUsers.email, normalizedEmail)));
}

export async function deleteAccessUser(email: string, currentAdminEmail: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === currentAdminEmail.trim().toLowerCase()) {
    return Response.json(
      { error: "Voce nao pode excluir o seu proprio acesso de administrador." },
      { status: 400 },
    );
  }

  await getDb()
    .delete(accessUsers)
    .where(eq(accessUsers.email, normalizedEmail));

  return null;
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const [scheme, token] = authorization.split(" ");

  if (scheme.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

function getSupabaseDisplayName(
  userMetadata: Record<string, unknown> | null | undefined,
  email: string,
) {
  const metadata = userMetadata ?? {};
  const firstName = metadataText(metadata, "first_name");
  const lastName = metadataText(metadata, "last_name");
  const fullNameFromParts = [firstName, lastName].filter(Boolean).join(" ");
  const emailPrefix = email.split("@")[0] ?? email;
  const candidates = [
    metadataText(metadata, "name"),
    metadataText(metadata, "full_name"),
    metadataText(metadata, "display_name"),
    fullNameFromParts,
  ];

  return (
    candidates.find((candidate) => isRealDisplayName(candidate, email, emailPrefix)) ??
    emailPrefix
  );
}

function metadataText(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" ? value.trim() : "";
}

function isRealDisplayName(candidate: string, email: string, emailPrefix: string) {
  if (!candidate) return false;

  const normalized = candidate.toLowerCase();
  return (
    !candidate.includes("@") &&
    normalized !== email.toLowerCase() &&
    normalized !== emailPrefix.toLowerCase()
  );
}

async function migrateLegacyCards(
  request: Request,
  email: string,
  supabaseUserId: string,
) {
  const legacyUserId = request.headers.get("oai-authenticated-user-id");
  const legacyEmail = request.headers
    .get("oai-authenticated-user-email")
    ?.toLowerCase();

  if (!legacyUserId || legacyUserId === supabaseUserId || legacyEmail !== email) {
    return;
  }

  await getDb()
    .update(financeCards)
    .set({ userId: supabaseUserId })
    .where(eq(financeCards.userId, legacyUserId));
}
