import { env } from "cloudflare:workers";
import { and, desc, eq } from "drizzle-orm";
import { getChatGPTUser, type ChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { financeCards } from "@/db/schema";

type ReceiptType =
  | "Salário"
  | "Férias"
  | "Vale"
  | "Décimo terceiro"
  | "Comissão"
  | "Extra"
  | "Personalizado";

type PaymentCategory =
  | "Conta"
  | "Empréstimo"
  | "Cartão"
  | "Parcela"
  | "Assinatura"
  | "Investimento"
  | "Outro";

type Payment = {
  id: string;
  name: string;
  amountCents: number;
  category: PaymentCategory | "";
  note: string;
};

type GeneratedImage = {
  id: string;
  createdAt: string;
  format: "square" | "story" | "landscape";
  width: number;
  height: number;
  mimeType: "image/png" | "image/jpeg";
  dataUrl: string;
};

export type FinanceCard = {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: ReceiptType | "";
  customType: string;
  date: string;
  amountCents: number;
  description: string;
  payments: Payment[];
  images: GeneratedImage[];
};

type FinanceCardRow = typeof financeCards.$inferSelect;

export async function requireApiUser() {
  const user = await getChatGPTUser();

  if (!user) {
    return {
      user: null,
      response: Response.json(
        { error: "Faça login para acessar seus cards financeiros." },
        { status: 401 },
      ),
    };
  }

  return { user, response: null };
}

export async function listUserCards(user: ChatGPTUser) {
  const db = getDb();
  const rows = await db
    .select()
    .from(financeCards)
    .where(eq(financeCards.userId, user.userId))
    .orderBy(desc(financeCards.updatedAt));

  return rows.map(rowToCard);
}

export async function saveUserCard(user: ChatGPTUser, input: FinanceCard) {
  const card = normalizeCard(input);
  const db = getDb();
  const existing = await db
    .select({ userId: financeCards.userId })
    .from(financeCards)
    .where(eq(financeCards.id, card.id))
    .limit(1);

  if (existing[0] && existing[0].userId !== user.userId) {
    return {
      card: null,
      response: Response.json(
        { error: "Este card pertence a outro usuário." },
        { status: 403 },
      ),
    };
  }

  const images = await persistImages(user, card);
  const savedCard = { ...card, images };
  const row = cardToRow(user, savedCard);

  await db
    .insert(financeCards)
    .values(row)
    .onConflictDoUpdate({
      target: financeCards.id,
      set: {
        updatedAt: row.updatedAt,
        type: row.type,
        customType: row.customType,
        date: row.date,
        amountCents: row.amountCents,
        description: row.description,
        paymentsJson: row.paymentsJson,
        imagesJson: row.imagesJson,
      },
    });

  return { card: savedCard, response: null };
}

export async function deleteUserCard(user: ChatGPTUser, cardId: string) {
  const db = getDb();
  await db
    .delete(financeCards)
    .where(and(eq(financeCards.id, cardId), eq(financeCards.userId, user.userId)));

  await deleteStoredImages(user, cardId);
}

export async function getUserCardImage(
  user: ChatGPTUser,
  cardId: string,
  imageId: string,
) {
  const db = getDb();
  const [row] = await db
    .select({ id: financeCards.id })
    .from(financeCards)
    .where(and(eq(financeCards.id, cardId), eq(financeCards.userId, user.userId)))
    .limit(1);

  if (!row) return null;

  const object = await getImagesBucket().get(imageKey(user, cardId, imageId));
  if (!object) return null;

  return object;
}

function normalizeCard(card: FinanceCard): FinanceCard {
  const now = new Date().toISOString();

  return {
    id: String(card.id || crypto.randomUUID()),
    createdAt: card.createdAt || now,
    updatedAt: card.updatedAt || now,
    type: card.type || "",
    customType: card.customType || "",
    date: card.date || "",
    amountCents: Number.isFinite(card.amountCents) ? card.amountCents : 0,
    description: card.description || "",
    payments: Array.isArray(card.payments) ? card.payments.map(normalizePayment) : [],
    images: Array.isArray(card.images) ? card.images.map(normalizeImage) : [],
  };
}

function normalizePayment(payment: Payment): Payment {
  return {
    id: String(payment.id || crypto.randomUUID()),
    name: payment.name || "",
    amountCents: Number.isFinite(payment.amountCents) ? payment.amountCents : 0,
    category: payment.category || "",
    note: payment.note || "",
  };
}

function normalizeImage(image: GeneratedImage): GeneratedImage {
  return {
    id: String(image.id || crypto.randomUUID()),
    createdAt: image.createdAt || new Date().toISOString(),
    format: image.format || "square",
    width: Number.isFinite(image.width) ? image.width : 1080,
    height: Number.isFinite(image.height) ? image.height : 1080,
    mimeType: image.mimeType === "image/jpeg" ? "image/jpeg" : "image/png",
    dataUrl: image.dataUrl || "",
  };
}

async function persistImages(user: ChatGPTUser, card: FinanceCard) {
  const bucket = getImagesBucket();

  return Promise.all(
    card.images.map(async (image) => {
      if (!image.dataUrl.startsWith("data:")) return image;

      const { bytes, contentType } = dataUrlToBytes(image.dataUrl);
      await bucket.put(imageKey(user, card.id, image.id), bytes, {
        httpMetadata: { contentType },
      });

      return {
        ...image,
        mimeType: contentType === "image/jpeg" ? "image/jpeg" : "image/png",
        dataUrl: `/api/cards/${encodeURIComponent(card.id)}/images/${encodeURIComponent(
          image.id,
        )}`,
      };
    }),
  );
}

async function deleteStoredImages(user: ChatGPTUser, cardId: string) {
  const bucket = getImagesBucket();
  const listed = await bucket.list({ prefix: `${user.userId}/${cardId}/` });

  await Promise.all(listed.objects.map((object) => bucket.delete(object.key)));
}

function rowToCard(row: FinanceCardRow): FinanceCard {
  return {
    id: row.id,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    type: row.type as ReceiptType | "",
    customType: row.customType,
    date: row.date,
    amountCents: row.amountCents,
    description: row.description,
    payments: parseJson<Payment[]>(row.paymentsJson, []),
    images: parseJson<GeneratedImage[]>(row.imagesJson, []),
  };
}

function cardToRow(user: ChatGPTUser, card: FinanceCard) {
  return {
    id: card.id,
    userId: user.userId,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    type: card.type,
    customType: card.customType,
    date: card.date,
    amountCents: card.amountCents,
    description: card.description,
    paymentsJson: JSON.stringify(card.payments),
    imagesJson: JSON.stringify(card.images),
  };
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function dataUrlToBytes(dataUrl: string) {
  const [metadata, payload] = dataUrl.split(",");
  const contentType = metadata.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return { bytes, contentType };
}

function imageKey(user: ChatGPTUser, cardId: string, imageId: string) {
  return `${user.userId}/${cardId}/${imageId}`;
}

function getImagesBucket() {
  const bucket = (env as unknown as { CARD_IMAGES?: R2Bucket }).CARD_IMAGES;

  if (!bucket) {
    throw new Error(
      "Cloudflare R2 binding `CARD_IMAGES` is unavailable. Set the `r2` field in .openai/hosting.json to `CARD_IMAGES`.",
    );
  }

  return bucket;
}
