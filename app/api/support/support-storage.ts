import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { supportMessages, supportThreads } from "@/db/schema";
import type { AuthenticatedAppUser } from "@/app/api/supabase-auth";

export type SupportStatus = "new" | "in_progress" | "resolved";
export type SupportSource = "user" | "visitor";
export type SupportSenderType = "user" | "visitor" | "admin";

export type SupportMessage = {
  id: string;
  threadId: string;
  senderType: SupportSenderType;
  senderName: string;
  senderEmail: string;
  body: string;
  createdAt: string;
};

export type SupportThread = {
  id: string;
  userId: string | null;
  source: SupportSource;
  name: string;
  email: string;
  subject: string;
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messages: SupportMessage[];
};

type SupportThreadRow = typeof supportThreads.$inferSelect;
type SupportMessageRow = typeof supportMessages.$inferSelect;

type VisitorSupportInput = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

type UserSupportInput = {
  subject?: string;
  message?: string;
};

const MAX_SHORT_TEXT = 120;
const MAX_MESSAGE_TEXT = 1800;

export async function createVisitorSupportThread(input: VisitorSupportInput) {
  const name = cleanText(input.name, 60);
  const email = cleanEmail(input.email);
  const subject = cleanText(input.subject, MAX_SHORT_TEXT);
  const message = cleanText(input.message, MAX_MESSAGE_TEXT);
  const validation = validateSupportRequest({ name, email, subject, message });

  if (validation) return { thread: null, response: validation };

  const now = new Date().toISOString();
  const threadId = createId();
  const db = getDb();

  await db.insert(supportThreads).values({
    id: threadId,
    userId: null,
    source: "visitor",
    name,
    email,
    subject,
    status: "new",
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
  });

  await db.insert(supportMessages).values({
    id: createId(),
    threadId,
    senderType: "visitor",
    senderName: name,
    senderEmail: email,
    body: message,
    createdAt: now,
  });

  return { thread: await getSupportThreadWithMessages(threadId), response: null };
}

export async function getUserSupportConversation(user: AuthenticatedAppUser) {
  const [thread] = await getDb()
    .select()
    .from(supportThreads)
    .where(eq(supportThreads.userId, user.id))
    .orderBy(desc(supportThreads.lastMessageAt))
    .limit(1);

  if (!thread) return null;

  return getSupportThreadWithMessages(thread.id);
}

export async function sendUserSupportMessage(
  user: AuthenticatedAppUser,
  input: UserSupportInput,
) {
  const message = cleanText(input.message, MAX_MESSAGE_TEXT);
  const subject = cleanText(input.subject, MAX_SHORT_TEXT) || "Suporte Finny";

  if (message.length < 5) {
    return {
      thread: null,
      response: Response.json(
        { error: "Escreva uma mensagem com um pouco mais de detalhe." },
        { status: 400 },
      ),
    };
  }

  const now = new Date().toISOString();
  const db = getDb();
  const existingThread = await getUserSupportConversation(user);
  const threadId = existingThread?.id ?? createId();

  if (!existingThread) {
    await db.insert(supportThreads).values({
      id: threadId,
      userId: user.id,
      source: "user",
      name: user.displayName,
      email: user.email,
      subject,
      status: "new",
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
    });
  }

  await db.insert(supportMessages).values({
    id: createId(),
    threadId,
    senderType: "user",
    senderName: user.displayName,
    senderEmail: user.email,
    body: message,
    createdAt: now,
  });

  await db
    .update(supportThreads)
    .set({
      status: existingThread?.status === "resolved" ? "in_progress" : existingThread?.status ?? "new",
      subject: existingThread?.subject || subject,
      name: user.displayName,
      email: user.email,
      updatedAt: now,
      lastMessageAt: now,
    })
    .where(eq(supportThreads.id, threadId));

  return { thread: await getSupportThreadWithMessages(threadId), response: null };
}

export async function listAdminSupportThreads() {
  const rows = await getDb()
    .select()
    .from(supportThreads)
    .orderBy(desc(supportThreads.lastMessageAt));

  return Promise.all(rows.map((row) => getSupportThreadWithMessages(row.id)));
}

export async function sendAdminSupportMessage(
  adminUser: AuthenticatedAppUser,
  threadId: string,
  body: string | undefined,
) {
  const message = cleanText(body, MAX_MESSAGE_TEXT);
  const thread = await getSupportThreadWithMessages(threadId);

  if (!thread) {
    return {
      thread: null,
      response: Response.json(
        { error: "Atendimento nao encontrado." },
        { status: 404 },
      ),
    };
  }

  if (message.length < 2) {
    return {
      thread: null,
      response: Response.json(
        { error: "Escreva a resposta antes de enviar." },
        { status: 400 },
      ),
    };
  }

  const now = new Date().toISOString();

  await getDb().insert(supportMessages).values({
    id: createId(),
    threadId,
    senderType: "admin",
    senderName: adminUser.displayName,
    senderEmail: adminUser.email,
    body: message,
    createdAt: now,
  });

  await getDb()
    .update(supportThreads)
    .set({
      status: "in_progress",
      updatedAt: now,
      lastMessageAt: now,
    })
    .where(eq(supportThreads.id, threadId));

  return { thread: await getSupportThreadWithMessages(threadId), response: null };
}

export async function updateSupportThreadStatus(
  threadId: string,
  status: SupportStatus,
) {
  const normalizedStatus = normalizeStatus(status);
  const thread = await getSupportThreadWithMessages(threadId);

  if (!thread) {
    return {
      thread: null,
      response: Response.json(
        { error: "Atendimento nao encontrado." },
        { status: 404 },
      ),
    };
  }

  await getDb()
    .update(supportThreads)
    .set({ status: normalizedStatus, updatedAt: new Date().toISOString() })
    .where(eq(supportThreads.id, threadId));

  return { thread: await getSupportThreadWithMessages(threadId), response: null };
}

async function getSupportThreadWithMessages(threadId: string) {
  const db = getDb();
  const [thread] = await db
    .select()
    .from(supportThreads)
    .where(eq(supportThreads.id, threadId))
    .limit(1);

  if (!thread) return null;

  const messages = await db
    .select()
    .from(supportMessages)
    .where(eq(supportMessages.threadId, threadId))
    .orderBy(supportMessages.createdAt);

  return rowToThread(thread, messages);
}

function rowToThread(
  thread: SupportThreadRow,
  messages: SupportMessageRow[],
): SupportThread {
  return {
    id: thread.id,
    userId: thread.userId,
    source: thread.source === "visitor" ? "visitor" : "user",
    name: thread.name,
    email: thread.email,
    subject: thread.subject,
    status: normalizeStatus(thread.status),
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    lastMessageAt: thread.lastMessageAt,
    messages: messages.map(rowToMessage),
  };
}

function rowToMessage(message: SupportMessageRow): SupportMessage {
  return {
    id: message.id,
    threadId: message.threadId,
    senderType: normalizeSender(message.senderType),
    senderName: message.senderName,
    senderEmail: message.senderEmail,
    body: message.body,
    createdAt: message.createdAt,
  };
}

function validateSupportRequest(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (input.name.length < 2) {
    return Response.json({ error: "Informe seu nome." }, { status: 400 });
  }

  if (!isValidEmail(input.email)) {
    return Response.json({ error: "Informe um e-mail valido." }, { status: 400 });
  }

  if (input.subject.length < 3) {
    return Response.json({ error: "Informe o assunto." }, { status: 400 });
  }

  if (input.message.length < 5) {
    return Response.json(
      { error: "Escreva uma mensagem com um pouco mais de detalhe." },
      { status: 400 },
    );
  }

  return null;
}

function normalizeStatus(status: string): SupportStatus {
  if (status === "resolved") return "resolved";
  if (status === "in_progress") return "in_progress";
  return "new";
}

function normalizeSender(senderType: string): SupportSenderType {
  if (senderType === "admin") return "admin";
  if (senderType === "visitor") return "visitor";
  return "user";
}

function cleanText(value: string | undefined, maxLength: number) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function cleanEmail(value: string | undefined) {
  return cleanText(value, 180).toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function createId() {
  return crypto.randomUUID();
}
