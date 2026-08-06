"use client";

import {
  AlertTriangle,
  ArrowLeft,
  BadgeDollarSign,
  BarChart3,
  Calendar,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  Eye,
  FileImage,
  FileText,
  History,
  ImageDown,
  LayoutDashboard,
  LogOut,
  Moon,
  Pencil,
  PieChart,
  Plus,
  ReceiptText,
  RefreshCw,
  Save,
  Search,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sun,
  Trash2,
  UserCircle,
  Wallet,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

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

type ThemeName = "dark" | "light";

type CardFormatId = "square" | "story" | "landscape";

type CardFormat = {
  id: CardFormatId;
  label: string;
  width: number;
  height: number;
};

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
  format: CardFormatId;
  width: number;
  height: number;
  mimeType: "image/png" | "image/jpeg";
  dataUrl: string;
};

type FinanceCard = {
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

type FilterState = {
  month: string;
  year: string;
  type: string;
  minValue: string;
  maxValue: string;
  text: string;
};

type Metrics = {
  totalPaidCents: number;
  balanceCents: number;
  paymentCount: number;
  committedPercent: number;
};

type DraftBackupStatus = "idle" | "pending" | "saved" | "restored";

type AppUser = {
  id: string;
  displayName: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "blocked";
};

type AccessUser = {
  email: string;
  userId: string | null;
  role: "admin" | "user";
  status: "active" | "blocked";
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

type AuthEmailQuota = {
  limit: number;
  used: number;
  available: number;
  nextAvailableAt: string | null;
};

type DraftSnapshot = {
  card: FinanceCard;
  savedAt: string;
};

const receiptTypes: ReceiptType[] = [
  "Salário",
  "Férias",
  "Vale",
  "Décimo terceiro",
  "Comissão",
  "Extra",
  "Personalizado",
];

const paymentCategories: PaymentCategory[] = [
  "Conta",
  "Empréstimo",
  "Cartão",
  "Parcela",
  "Assinatura",
  "Investimento",
  "Outro",
];

const cardFormats: CardFormat[] = [
  { id: "square", label: "1080 x 1080", width: 1080, height: 1080 },
  { id: "story", label: "1080 x 1920", width: 1080, height: 1920 },
  { id: "landscape", label: "1920 x 1080", width: 1920, height: 1080 },
];

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const DB_NAME = "cards-financeiros";
const DB_VERSION = 1;
const STORE_NAME = "financeCards";
const STORAGE_KEY = "cards-financeiros:data";
const THEME_KEY = "cards-financeiros:theme";
const IOS_INSTALL_HINT_KEY = "cards-financeiros:ios-install-hint-dismissed";
const DRAFTS_KEY_PREFIX = "cards-financeiros:drafts:";
const DRAFT_SAVE_DELAY_MS = 450;

const emptyFilters: FilterState = {
  month: "",
  year: "",
  type: "",
  minValue: "",
  maxValue: "",
  text: "",
};

const blankPayment = (): Payment => ({
  id: createId(),
  name: "",
  amountCents: 0,
  category: "",
  note: "",
});

const blankCard = (): FinanceCard => {
  const now = new Date().toISOString();

  return {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    type: "",
    customType: "",
    date: "",
    amountCents: 0,
    description: "",
    payments: [],
    images: [],
  };
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatCompactCurrency(cents: number) {
  if (!cents) return "Sem dados";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatCurrencyInput(cents: number) {
  if (!cents) return "";
  return formatCurrency(cents);
}

function parseCurrencyToCents(value: string) {
  const onlyDigits = value.replace(/\D/g, "");
  if (!onlyDigits) return 0;
  return Number.parseInt(onlyDigits, 10);
}

function formatDateBR(dateValue: string) {
  if (!dateValue) return "";
  const [year, month, day] = dateValue.split("-");
  if (!year || !month || !day) return dateValue;
  return `${day}/${month}/${year}`;
}

function formatShortDate(dateValue: string) {
  if (!dateValue) return "";
  const [, month, day] = dateValue.split("-");
  return day && month ? `${day}/${month}` : formatDateBR(dateValue);
}

function readableTimestamp(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getReceiptLabel(card: FinanceCard) {
  if (card.type === "Personalizado") return card.customType.trim() || "Personalizado";
  return card.type || "Recebimento";
}

function getMetrics(card: FinanceCard): Metrics {
  const meaningfulPayments = card.payments.filter(isMeaningfulPayment);
  const totalPaidCents = meaningfulPayments.reduce(
    (sum, payment) => sum + payment.amountCents,
    0,
  );
  const balanceCents = card.amountCents - totalPaidCents;
  const committedPercent =
    card.amountCents > 0 ? Math.round((totalPaidCents / card.amountCents) * 100) : 0;

  return {
    totalPaidCents,
    balanceCents,
    paymentCount: meaningfulPayments.length,
    committedPercent,
  };
}

function isMeaningfulPayment(payment: Payment) {
  return (
    payment.name.trim().length > 0 ||
    payment.amountCents > 0 ||
    payment.category.length > 0 ||
    payment.note.trim().length > 0
  );
}

function progressTone(percent: number) {
  if (percent > 80) return "danger";
  if (percent > 50) return "warning";
  return "success";
}

function cloneCard(card: FinanceCard): FinanceCard {
  return {
    ...card,
    payments: card.payments.map((payment) => ({ ...payment })),
    images: card.images.map((image) => ({ ...image })),
  };
}

function cardHasDraftContent(card: FinanceCard) {
  return (
    Boolean(card.type || card.date || card.amountCents || card.description.trim()) ||
    card.payments.some(isMeaningfulPayment) ||
    card.images.length > 0
  );
}

function draftStorageKey(userId: string) {
  return `${DRAFTS_KEY_PREFIX}${userId}`;
}

function readDraftSnapshots(userId: string): Record<string, DraftSnapshot> {
  if (typeof localStorage === "undefined") return {};

  try {
    const raw = localStorage.getItem(draftStorageKey(userId));
    return raw ? (JSON.parse(raw) as Record<string, DraftSnapshot>) : {};
  } catch {
    return {};
  }
}

function saveLocalDraft(userId: string, card: FinanceCard, savedAt: string) {
  if (typeof localStorage === "undefined") return;

  const snapshots = readDraftSnapshots(userId);
  snapshots[card.id] = { card: cloneCard(card), savedAt };
  localStorage.setItem(draftStorageKey(userId), JSON.stringify(snapshots));
}

function removeLocalDraft(userId: string, cardId: string) {
  if (typeof localStorage === "undefined") return;

  const snapshots = readDraftSnapshots(userId);
  delete snapshots[cardId];

  if (Object.keys(snapshots).length) {
    localStorage.setItem(draftStorageKey(userId), JSON.stringify(snapshots));
    return;
  }

  localStorage.removeItem(draftStorageKey(userId));
}

function findRecoverableDraft(userId: string, cards: FinanceCard[]) {
  const cardsById = new Map(cards.map((card) => [card.id, card]));

  return Object.values(readDraftSnapshots(userId))
    .filter((snapshot) => cardHasDraftContent(snapshot.card))
    .filter((snapshot) => {
      const savedCard = cardsById.get(snapshot.card.id);
      if (!savedCard) return true;
      return new Date(snapshot.savedAt).getTime() > new Date(savedCard.updatedAt).getTime();
    })
    .sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    )[0];
}

function resolveCardDraft(userId: string, card: FinanceCard) {
  const snapshot = readDraftSnapshots(userId)[card.id];
  if (!snapshot || !cardHasDraftContent(snapshot.card)) return null;

  const draftTime = new Date(snapshot.savedAt).getTime();
  const cardTime = new Date(card.updatedAt).getTime();
  return draftTime > cardTime ? snapshot : null;
}

function draftBackupLabel(status: DraftBackupStatus) {
  if (status === "pending") return "Protegendo rascunho...";
  if (status === "saved") return "Rascunho salvo neste aparelho";
  if (status === "restored") return "Rascunho recuperado";
  return "";
}

function openFinanceDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB indisponível."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("date", "date", { unique: false });
        store.createIndex("type", "type", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withFinanceStore<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const database = await openFinanceDatabase();

  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = action(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

const localStorageRepository = {
  list(): FinanceCard[] {
    if (typeof localStorage === "undefined") return [];

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as FinanceCard[]) : [];
    } catch {
      return [];
    }
  },
  save(cards: FinanceCard[]) {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  },
};

const financeRepository = {
  async list(accessToken: string): Promise<FinanceCard[]> {
    const response = await fetch("/api/cards", {
      headers: authHeaders(accessToken),
      cache: "no-store",
    });
    const data = await readJsonResponse<{ cards: FinanceCard[] }>(response);

    return data.cards.sort(sortCardsByUpdatedAt);
  },
  async save(card: FinanceCard, accessToken: string) {
    const response = await fetch("/api/cards", {
      method: "PUT",
      headers: { ...authHeaders(accessToken), "content-type": "application/json" },
      body: JSON.stringify({ card }),
    });
    const data = await readJsonResponse<{ card: FinanceCard }>(response);

    return data.card;
  },
  async remove(cardId: string, accessToken: string) {
    const response = await fetch(`/api/cards/${encodeURIComponent(cardId)}`, {
      method: "DELETE",
      headers: authHeaders(accessToken),
    });

    await readJsonResponse<{ ok: boolean }>(response);
  },
};

function authHeaders(accessToken: string) {
  return { authorization: `Bearer ${accessToken}` };
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Nao foi possivel sincronizar seus cards.");
  }

  return data as T;
}

function sortCardsByUpdatedAt(a: FinanceCard, b: FinanceCard) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

function validateCard(card: FinanceCard) {
  const errors: string[] = [];

  if (!card.type) errors.push("Selecione o tipo do recebimento.");
  if (card.type === "Personalizado" && !card.customType.trim()) {
    errors.push("Informe o nome do recebimento personalizado.");
  }
  if (!card.date) errors.push("Informe a data do recebimento.");
  if (card.amountCents <= 0) errors.push("Informe o valor recebido.");

  card.payments.forEach((payment, index) => {
    if (!isMeaningfulPayment(payment)) return;

    const label = `Pagamento ${index + 1}`;
    if (!payment.name.trim()) errors.push(`${label}: informe o nome.`);
    if (payment.amountCents <= 0) errors.push(`${label}: informe o valor.`);
    if (!payment.category) errors.push(`${label}: selecione a categoria.`);
  });

  return errors;
}

function filterCards(cards: FinanceCard[], filters: FilterState) {
  const minValue = parseCurrencyToCents(filters.minValue);
  const maxValue = parseCurrencyToCents(filters.maxValue);
  const searchText = filters.text.trim().toLocaleLowerCase("pt-BR");

  return cards.filter((card) => {
    const [year, month] = card.date.split("-");

    if (filters.month && month !== filters.month) return false;
    if (filters.year && year !== filters.year) return false;
    if (filters.type && card.type !== filters.type) return false;
    if (minValue && card.amountCents < minValue) return false;
    if (maxValue && card.amountCents > maxValue) return false;

    if (searchText) {
      const searchable = [
        getReceiptLabel(card),
        card.description,
        card.date,
        ...card.payments.flatMap((payment) => [
          payment.name,
          payment.category,
          payment.note,
        ]),
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      if (!searchable.includes(searchText)) return false;
    }

    return true;
  });
}

function groupCardsByMonth(cards: FinanceCard[]) {
  return cards.reduce<Record<string, FinanceCard[]>>((groups, card) => {
    const [year, month] = card.date.split("-");
    const date = month && year ? new Date(Number(year), Number(month) - 1) : null;
    const label = date
      ? `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      : "Sem data";

    groups[label] ??= [];
    groups[label].push(card);
    return groups;
  }, {});
}

function getPeriodCards(cards: FinanceCard[], filters: FilterState) {
  const today = new Date();
  const month = filters.month || String(today.getMonth() + 1).padStart(2, "0");
  const year = filters.year || String(today.getFullYear());

  return cards.filter((card) => {
    const [cardYear, cardMonth] = card.date.split("-");
    return cardYear === year && cardMonth === month;
  });
}

function buildStatistics(cards: FinanceCard[], filters: FilterState) {
  const periodCards = getPeriodCards(cards, filters);
  const periodPayments = periodCards.flatMap((card) =>
    card.payments.filter(isMeaningfulPayment),
  );
  const receivedCents = periodCards.reduce((sum, card) => sum + card.amountCents, 0);
  const paidCents = periodPayments.reduce((sum, payment) => sum + payment.amountCents, 0);
  const balanceCents = receivedCents - paidCents;
  const sortedPayments = [...periodPayments].sort(
    (a, b) => b.amountCents - a.amountCents,
  );

  return {
    receivedCents,
    paidCents,
    balanceCents,
    paymentCount: periodPayments.length,
    largestPayment: sortedPayments[0],
    smallestPayment: sortedPayments[sortedPayments.length - 1],
    monthlyEvolution: buildMonthlyEvolution(cards),
    categoryTotals: buildCategoryTotals(periodPayments),
  };
}

function buildMonthlyEvolution(cards: FinanceCard[]) {
  const groups = new Map<string, { label: string; received: number; paid: number }>();

  cards.forEach((card) => {
    const [year, month] = card.date.split("-");
    if (!year || !month) return;

    const key = `${year}-${month}`;
    const label = `${monthNames[Number(month) - 1].slice(0, 3)} ${year.slice(2)}`;
    const metrics = getMetrics(card);
    const current = groups.get(key) ?? { label, received: 0, paid: 0 };
    current.received += card.amountCents;
    current.paid += metrics.totalPaidCents;
    groups.set(key, current);
  });

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, value]) => value);
}

function buildCategoryTotals(payments: Payment[]) {
  const groups = new Map<PaymentCategory, number>();

  payments.forEach((payment) => {
    if (!payment.category) return;
    groups.set(payment.category, (groups.get(payment.category) ?? 0) + payment.amountCents);
  });

  return [...groups.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

async function createCardImage(
  card: FinanceCard,
  format: CardFormat,
  mimeType: "image/png" | "image/jpeg" = "image/png",
) {
  const canvas = document.createElement("canvas");
  canvas.width = format.width;
  canvas.height = format.height;
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Não foi possível preparar a imagem.");

  await drawFinancialCard(context, card, format);

  return canvas.toDataURL(mimeType, mimeType === "image/jpeg" ? 0.94 : undefined);
}

async function drawFinancialCard(
  context: CanvasRenderingContext2D,
  card: FinanceCard,
  format: CardFormat,
) {
  await document.fonts?.ready;

  const metrics = getMetrics(card);
  const scale = Math.min(format.width, format.height) / 1080;
  const isStory = format.id === "story";
  const isLandscape = format.id === "landscape";
  const padding = Math.round((isLandscape ? 72 : 64) * scale);
  const radius = Math.round(34 * scale);
  const width = format.width;
  const height = format.height;
  const contentWidth = width - padding * 2;
  const contentBottom = height - padding;

  drawBackground(context, width, height);
  drawRoundedRect(
    context,
    padding,
    padding,
    contentWidth,
    height - padding * 2,
    radius,
    "#111827",
  );

  context.save();
  context.fillStyle = "rgba(34, 197, 94, 0.14)";
  context.beginPath();
  context.arc(width - padding * 1.7, padding * 1.35, 190 * scale, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "rgba(239, 68, 68, 0.10)";
  context.beginPath();
  context.arc(padding * 1.35, height - padding * 1.1, 210 * scale, 0, Math.PI * 2);
  context.fill();
  context.restore();

  let y = padding + 64 * scale;

  context.fillStyle = "#E5E7EB";
  context.font = `${Math.round(30 * scale)}px Arial, sans-serif`;
  drawIconBadge(context, padding + 48 * scale, y - 22 * scale, 42 * scale, "#22C55E");
  context.fillText("PAGAMENTOS", padding + 88 * scale, y);

  context.textAlign = "right";
  context.fillStyle = "#94A3B8";
  context.font = `${Math.round(28 * scale)}px Arial, sans-serif`;
  context.fillText(formatShortDate(card.date), width - padding - 48 * scale, y);
  context.textAlign = "left";

  y += (isStory ? 128 : 94) * scale;

  context.fillStyle = "#FFFFFF";
  context.font = `700 ${Math.round((isLandscape ? 78 : 72) * scale)}px Arial, sans-serif`;
  drawTruncatedText(
    context,
    getReceiptLabel(card),
    padding + 48 * scale,
    y,
    contentWidth - 96 * scale,
  );

  y += (isStory ? 92 : 84) * scale;

  context.fillStyle = "#22C55E";
  context.font = `700 ${Math.round((isLandscape ? 88 : 82) * scale)}px Arial, sans-serif`;
  context.fillText(formatCurrency(card.amountCents), padding + 48 * scale, y);

  y += (isStory ? 78 : 58) * scale;

  drawProgress(context, padding + 48 * scale, y, contentWidth - 96 * scale, 22 * scale, metrics);

  y += (isStory ? 112 : 82) * scale;

  const columns = isLandscape ? 2 : 1;
  const gap = 34 * scale;
  const listWidth = columns === 2 ? (contentWidth - 96 * scale - gap) / 2 : contentWidth - 96 * scale;
  const rowHeight = (isStory ? 96 : 84) * scale;
  const footerHeight = isStory ? 260 * scale : 214 * scale;
  const availableRows = Math.max(
    2,
    Math.floor((contentBottom - y - footerHeight) / rowHeight) * columns,
  );
  const payments = card.payments.filter(isMeaningfulPayment);
  const visiblePayments = payments.slice(0, availableRows);
  const hiddenCount = Math.max(0, payments.length - visiblePayments.length);

  visiblePayments.forEach((payment, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = padding + 48 * scale + column * (listWidth + gap);
    const rowY = y + row * rowHeight;

    drawPaymentRow(context, payment, x, rowY, listWidth, scale);
  });

  const rowsUsed = Math.ceil(visiblePayments.length / columns);
  y += rowsUsed * rowHeight;

  if (!payments.length) {
    context.fillStyle = "#94A3B8";
    context.font = `${Math.round(30 * scale)}px Arial, sans-serif`;
    context.fillText("Nenhum pagamento cadastrado", padding + 48 * scale, y);
    y += rowHeight;
  }

  if (hiddenCount > 0) {
    context.fillStyle = "#CBD5E1";
    context.font = `${Math.round(30 * scale)}px Arial, sans-serif`;
    context.fillText(`+ ${hiddenCount} pagamentos`, padding + 48 * scale, y + 20 * scale);
  }

  const footerTop = contentBottom - footerHeight + 28 * scale;
  drawSummaryFooter(context, card, metrics, padding + 48 * scale, footerTop, contentWidth - 96 * scale, scale, columns);

  context.fillStyle = "#64748B";
  context.font = `${Math.round(24 * scale)}px Arial, sans-serif`;
  context.textAlign = "center";
  context.fillText(
    "Gerado automaticamente pelo aplicativo.",
    width / 2,
    contentBottom - 44 * scale,
  );
  context.textAlign = "left";
}

function drawBackground(context: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#0B1220");
  gradient.addColorStop(0.55, "#111827");
  gradient.addColorStop(1, "#070B14");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string,
) {
  context.save();
  context.fillStyle = fillStyle;
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
  context.restore();
}

function drawIconBadge(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  context.save();
  context.fillStyle = color;
  context.beginPath();
  context.roundRect(x - size / 2, y - size / 2, size, size, size * 0.28);
  context.fill();
  context.strokeStyle = "#0B1220";
  context.lineWidth = size * 0.08;
  context.beginPath();
  context.moveTo(x - size * 0.17, y);
  context.lineTo(x - size * 0.02, y + size * 0.16);
  context.lineTo(x + size * 0.22, y - size * 0.18);
  context.stroke();
  context.restore();
}

function drawProgress(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  metrics: Metrics,
) {
  const tone = progressTone(metrics.committedPercent);
  const color = tone === "danger" ? "#EF4444" : tone === "warning" ? "#FACC15" : "#22C55E";
  const progress = Math.min(metrics.committedPercent, 100);

  drawRoundedRect(context, x, y, width, height, height / 2, "rgba(148, 163, 184, 0.18)");
  drawRoundedRect(context, x, y, Math.max(height, width * (progress / 100)), height, height / 2, color);

  context.fillStyle = "#94A3B8";
  context.font = `${Math.round(height * 1.55)}px Arial, sans-serif`;
  context.fillText(`${metrics.committedPercent}% utilizado`, x, y + height + 34);
}

function drawPaymentRow(
  context: CanvasRenderingContext2D,
  payment: Payment,
  x: number,
  y: number,
  width: number,
  scale: number,
) {
  context.save();
  context.fillStyle = "rgba(15, 23, 42, 0.72)";
  context.strokeStyle = "rgba(148, 163, 184, 0.16)";
  context.lineWidth = 1.5 * scale;
  context.beginPath();
  context.roundRect(x, y, width, 64 * scale, 20 * scale);
  context.fill();
  context.stroke();

  context.fillStyle = "#22C55E";
  context.beginPath();
  context.arc(x + 30 * scale, y + 32 * scale, 8 * scale, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#F8FAFC";
  context.font = `700 ${Math.round(26 * scale)}px Arial, sans-serif`;
  drawTruncatedText(context, payment.name.trim() || "Pagamento", x + 54 * scale, y + 40 * scale, width * 0.52);

  context.textAlign = "right";
  context.fillStyle = "#FFFFFF";
  context.font = `700 ${Math.round(26 * scale)}px Arial, sans-serif`;
  context.fillText(formatCurrency(payment.amountCents), x + width - 22 * scale, y + 40 * scale);
  context.textAlign = "left";
  context.restore();
}

function drawSummaryFooter(
  context: CanvasRenderingContext2D,
  card: FinanceCard,
  metrics: Metrics,
  x: number,
  y: number,
  width: number,
  scale: number,
  columns: number,
) {
  const itemWidth = columns === 2 ? (width - 28 * scale) / 2 : width;
  const itemHeight = 74 * scale;
  const items = [
    ["Total pago", formatCurrency(metrics.totalPaidCents), "#E5E7EB"],
    ["Saldo", formatCurrency(metrics.balanceCents), metrics.balanceCents < 0 ? "#EF4444" : "#22C55E"],
  ];

  items.forEach(([label, value, color], index) => {
    const itemX = x + (columns === 2 ? index * (itemWidth + 28 * scale) : 0);
    const itemY = y + (columns === 2 ? 0 : index * (itemHeight + 22 * scale));
    drawRoundedRect(context, itemX, itemY, itemWidth, itemHeight, 20 * scale, "rgba(148, 163, 184, 0.10)");
    context.fillStyle = "#94A3B8";
    context.font = `${Math.round(22 * scale)}px Arial, sans-serif`;
    context.fillText(label, itemX + 24 * scale, itemY + 28 * scale);
    context.fillStyle = color;
    context.font = `700 ${Math.round(28 * scale)}px Arial, sans-serif`;
    context.fillText(value, itemX + 24 * scale, itemY + 58 * scale);
  });

  if (card.description.trim()) {
    const noteY = y + (columns === 2 ? itemHeight + 34 * scale : itemHeight * 2 + 66 * scale);
    context.fillStyle = "#94A3B8";
    context.font = `${Math.round(22 * scale)}px Arial, sans-serif`;
    drawTruncatedText(context, card.description.trim(), x, noteY, width);
  }
}

function drawTruncatedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
) {
  if (context.measureText(text).width <= maxWidth) {
    context.fillText(text, x, y);
    return;
  }

  let truncated = text;
  while (truncated.length > 1 && context.measureText(`${truncated}...`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  context.fillText(`${truncated}...`, x, y);
}

function dataUrlToBlob(dataUrl: string) {
  const [metadata, payload] = dataUrl.split(",");
  const mime = metadata.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mime });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function createPdfBlob(jpegDataUrl: string, width: number, height: number) {
  const imageBytes = new Uint8Array(
    atob(jpegDataUrl.split(",")[1])
      .split("")
      .map((character) => character.charCodeAt(0)),
  );
  const encoder = new TextEncoder();
  const content = `q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ`;
  const objects: Uint8Array[] = [];

  const encode = (value: string) => encoder.encode(value);
  const addObject = (parts: Uint8Array[]) => {
    const objectNumber = objects.length + 1;
    objects.push(concatBytes([encode(`${objectNumber} 0 obj\n`), ...parts, encode("\nendobj\n")]));
  };

  addObject([encode("<< /Type /Catalog /Pages 2 0 R >>")]);
  addObject([encode("<< /Type /Pages /Kids [3 0 R] /Count 1 >>")]);
  addObject([
    encode(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
    ),
  ]);
  addObject([
    encode(
      `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`,
    ),
    imageBytes,
    encode("\nendstream"),
  ]);
  addObject([encode(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`)]);

  const header = encode("%PDF-1.4\n");
  const offsets: number[] = [0];
  let offset = header.length;

  objects.forEach((object) => {
    offsets.push(offset);
    offset += object.length;
  });

  const xrefOffset = offset;
  const xref = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((item) => `${String(item).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
  ].join("\n");

  return new Blob([concatBytes([header, ...objects, encode(xref)])], {
    type: "application/pdf",
  });
}

function concatBytes(parts: Uint8Array[]) {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;

  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });

  return output;
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isRunningAsInstalledApp() {
  if (typeof window === "undefined") return false;

  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

export default function CardsFinanceirosApp({
  accessToken,
  onSignOut,
  user,
}: {
  accessToken: string;
  onSignOut: () => void;
  user: AppUser;
}) {
  const [theme, setTheme] = useState<ThemeName>("dark");
  const [cards, setCards] = useState<FinanceCard[]>([]);
  const [draft, setDraft] = useState<FinanceCard | null>(null);
  const [screen, setScreen] = useState<"home" | "editor" | "admin">("home");
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [selectedFormat, setSelectedFormat] = useState<CardFormatId>("square");
  const [selectedImageId, setSelectedImageId] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isDraftDirty, setIsDraftDirty] = useState(false);
  const [draftBackupStatus, setDraftBackupStatus] =
    useState<DraftBackupStatus>("idle");
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);
  const [showIosInstallHint, setShowIosInstallHint] = useState(false);
  const [accessUsers, setAccessUsers] = useState<AccessUser[]>([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminRole, setAdminRole] = useState<"admin" | "user">("user");
  const [adminStatus, setAdminStatus] = useState<"active" | "blocked">("active");
  const [adminMessage, setAdminMessage] = useState("");
  const [authEmailQuota, setAuthEmailQuota] = useState<AuthEmailQuota | null>(null);

  useEffect(() => {
    let alive = true;

    financeRepository
      .list(accessToken)
      .then((storedCards) => {
        if (!alive) return;

        setCards(storedCards);

        const recoveredDraft = findRecoverableDraft(user.id, storedCards);
        if (recoveredDraft) {
          const nextDraft = cloneCard(recoveredDraft.card);
          setDraft(nextDraft);
          setSelectedImageId(nextDraft.images[nextDraft.images.length - 1]?.id ?? "");
          setIsDraftDirty(true);
          setDraftBackupStatus("restored");
          setNotice("Rascunho recuperado neste aparelho.");
          setScreen("editor");
        }
      })
      .catch((error) => {
        if (alive) {
          setMessages([
            error instanceof Error
              ? error.message
              : "Nao foi possivel carregar seus cards.",
          ]);
        }
      });

    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);

    return () => {
      alive = false;
    };
  }, [accessToken, user.id]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (screen !== "editor" || !draft || !isDraftDirty) return;

    if (!cardHasDraftContent(draft)) {
      removeLocalDraft(user.id, draft.id);
      setDraftBackupStatus("idle");
      return;
    }

    setDraftBackupStatus("pending");

    const timeout = window.setTimeout(() => {
      const savedAt = new Date().toISOString();
      saveLocalDraft(user.id, draft, savedAt);
      setDraftBackupStatus("saved");
    }, DRAFT_SAVE_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [draft, isDraftDirty, screen, user.id]);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) return;

    const registerServiceWorker = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    };

    if (document.readyState === "complete") {
      registerServiceWorker();
      return;
    }

    window.addEventListener("load", registerServiceWorker, { once: true });

    return () => window.removeEventListener("load", registerServiceWorker);
  }, []);

  useEffect(() => {
    const standalone = isRunningAsInstalledApp();
    const ios = isIosDevice();
    const dismissed = localStorage.getItem(IOS_INSTALL_HINT_KEY) === "true";

    setIsStandaloneApp(standalone);
    setShowIosInstallHint(ios && !standalone && !dismissed);
    document.documentElement.dataset.platform = ios ? "ios" : "other";
    document.documentElement.dataset.displayMode = standalone ? "standalone" : "browser";

    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = () => setIsStandaloneApp(isRunningAsInstalledApp());
    standaloneQuery.addEventListener?.("change", handleDisplayModeChange);

    return () => standaloneQuery.removeEventListener?.("change", handleDisplayModeChange);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") !== "new-card") return;

    openNewCard();
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  useEffect(() => {
    if (user.role !== "admin") return;
    loadAccessUsers();
  }, [accessToken, user.role]);

  useEffect(() => {
    if (screen === "admin" && user.role !== "admin") {
      setScreen("home");
    }
  }, [screen, user.role]);

  const filteredCards = useMemo(() => filterCards(cards, filters), [cards, filters]);
  const groupedHistory = useMemo(() => groupCardsByMonth(filteredCards), [filteredCards]);
  const statistics = useMemo(() => buildStatistics(cards, filters), [cards, filters]);
  const metrics = useMemo(() => (draft ? getMetrics(draft) : getMetrics(blankCard())), [draft]);
  const currentFormat = cardFormats.find((format) => format.id === selectedFormat) ?? cardFormats[0];
  const currentImage =
    draft?.images.find((image) => image.id === selectedImageId) ??
    draft?.images[draft.images.length - 1];
  const hasUserInput =
    Boolean(draft?.type || draft?.date || draft?.amountCents || draft?.description.trim()) ||
    Boolean(draft?.payments.some(isMeaningfulPayment));

  function openNewCard() {
    const nextDraft = blankCard();
    setDraft(nextDraft);
    setSelectedImageId("");
    setIsDraftDirty(false);
    setDraftBackupStatus("idle");
    setMessages([]);
    setNotice("");
    setScreen("editor");
  }

  function openCardsHome() {
    setMessages([]);
    setNotice("");
    setScreen("home");
  }

  function openAdminArea() {
    if (user.role !== "admin") return;
    setMessages([]);
    setNotice("");
    setScreen("admin");
    void loadAccessUsers();
  }

  function dismissIosInstallHint() {
    localStorage.setItem(IOS_INSTALL_HINT_KEY, "true");
    setShowIosInstallHint(false);
  }

  async function loadAccessUsers() {
    try {
      const response = await fetch("/api/admin/users", {
        headers: authHeaders(accessToken),
        cache: "no-store",
      });
      const data = await readJsonResponse<{ users: AccessUser[]; quota: AuthEmailQuota }>(response);
      setAccessUsers(data.users);
      setAuthEmailQuota(data.quota);
    } catch (error) {
      setAdminMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar usuarios.",
      );
    }
  }

  async function saveAccessUser() {
    setAdminMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { ...authHeaders(accessToken), "content-type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          role: adminRole,
          status: adminStatus,
        }),
      });
      const data = await readJsonResponse<{ users: AccessUser[]; quota: AuthEmailQuota }>(response);

      setAccessUsers(data.users);
      setAuthEmailQuota(data.quota);
      setAdminEmail("");
      setAdminRole("user");
      setAdminStatus("active");
      setAdminMessage("Acesso atualizado.");
    } catch (error) {
      setAdminMessage(
        error instanceof Error ? error.message : "Nao foi possivel salvar usuario.",
      );
    }
  }

  async function toggleAccessUser(target: AccessUser) {
    const nextStatus = target.status === "active" ? "blocked" : "active";
    setAdminMessage("");

    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(target.email)}`,
        {
          method: "PATCH",
          headers: {
            ...authHeaders(accessToken),
            "content-type": "application/json",
          },
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      await readJsonResponse<{ ok: boolean }>(response);
      await loadAccessUsers();
      setAdminMessage(
        nextStatus === "active" ? "Usuario desbloqueado." : "Usuario bloqueado.",
      );
    } catch (error) {
      setAdminMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel alterar o acesso.",
      );
    }
  }

  async function deleteAccessUser(target: AccessUser) {
    const confirmed = window.confirm(
      `Remover ${target.email} da lista de usuarios autorizados?`,
    );
    if (!confirmed) return;

    setAdminMessage("");
    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(target.email)}`,
        { method: "DELETE", headers: authHeaders(accessToken) },
      );
      await readJsonResponse<{ ok: boolean }>(response);
      await loadAccessUsers();
      setAdminMessage("Usuario removido da lista de acesso.");
    } catch (error) {
      setAdminMessage(
        error instanceof Error ? error.message : "Nao foi possivel remover o usuario.",
      );
    }
  }

  function openExistingCard(card: FinanceCard) {
    const localDraft = resolveCardDraft(user.id, card);
    const nextDraft = cloneCard(localDraft?.card ?? card);
    setDraft(nextDraft);
    setSelectedImageId(nextDraft.images[nextDraft.images.length - 1]?.id ?? "");
    setIsDraftDirty(Boolean(localDraft));
    setDraftBackupStatus(localDraft ? "restored" : "idle");
    setMessages([]);
    setNotice(localDraft ? "Rascunho recuperado neste aparelho." : "");
    setScreen("editor");
  }

  function patchDraft(patch: Partial<FinanceCard>) {
    setIsDraftDirty(true);
    setDraft((current) => (current ? { ...current, ...patch } : current));
  }

  function updatePayment(paymentId: string, patch: Partial<Payment>) {
    setIsDraftDirty(true);
    setDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        payments: current.payments.map((payment) =>
          payment.id === paymentId ? { ...payment, ...patch } : payment,
        ),
      };
    });
  }

  function addPayment() {
    setIsDraftDirty(true);
    setDraft((current) =>
      current ? { ...current, payments: [...current.payments, blankPayment()] } : current,
    );
  }

  function removePayment(paymentId: string) {
    setIsDraftDirty(true);
    setDraft((current) =>
      current
        ? {
            ...current,
            payments: current.payments.filter((payment) => payment.id !== paymentId),
          }
        : current,
    );
  }

  async function persistDraft(image?: GeneratedImage) {
    if (!draft) return null;

    const validationErrors = validateCard(draft);
    if (validationErrors.length) {
      setMessages(validationErrors);
      return null;
    }

    const now = new Date().toISOString();
    const nextCard: FinanceCard = {
      ...draft,
      updatedAt: now,
      payments: draft.payments.filter(isMeaningfulPayment),
      images: image ? [...draft.images, image] : draft.images,
    };

    const nextCards = [nextCard, ...cards.filter((card) => card.id !== nextCard.id)].sort(
      sortCardsByUpdatedAt,
    );
    setCards(nextCards);
    setDraft(cloneCard(nextCard));
    if (image) setSelectedImageId(image.id);

    try {
      const savedCard = await financeRepository.save(nextCard, accessToken);
      const syncedCards = [
        savedCard,
        ...cards.filter((card) => card.id !== savedCard.id),
      ].sort(sortCardsByUpdatedAt);

      setCards(syncedCards);
      setDraft(cloneCard(savedCard));
      removeLocalDraft(user.id, savedCard.id);
      setIsDraftDirty(false);
      setDraftBackupStatus("idle");
      if (image) setSelectedImageId(image.id);
      setMessages([]);
      return savedCard;
    } catch (error) {
      setCards(cards);
      setDraft(draft);
      setIsDraftDirty(true);
      setMessages([
        error instanceof Error ? error.message : "Nao foi possivel salvar o card.",
      ]);
      return null;
    }
  }

  async function saveChanges() {
    setIsBusy(true);
    setNotice("");
    try {
      const saved = await persistDraft();
      if (saved) setNotice("Card salvo no histórico.");
    } finally {
      setIsBusy(false);
    }
  }

  async function generateCard(mimeType: "image/png" | "image/jpeg" = "image/png") {
    if (!draft) return null;

    const validationErrors = validateCard(draft);
    if (validationErrors.length) {
      setMessages(validationErrors);
      return null;
    }

    setIsBusy(true);
    setNotice("");

    try {
      const dataUrl = await createCardImage(draft, currentFormat, mimeType);
      const image: GeneratedImage = {
        id: createId(),
        createdAt: new Date().toISOString(),
        format: currentFormat.id,
        width: currentFormat.width,
        height: currentFormat.height,
        mimeType,
        dataUrl,
      };
      const saved = await persistDraft(image);
      if (saved) setNotice("Imagem gerada e histórico atualizado.");
      return image;
    } finally {
      setIsBusy(false);
    }
  }

  async function renderExportImage(mimeType: "image/png" | "image/jpeg") {
    if (!draft) return null;

    const validationErrors = validateCard(draft);
    if (validationErrors.length) {
      setMessages(validationErrors);
      return null;
    }

    setIsBusy(true);
    setNotice("");

    try {
      const dataUrl = await createCardImage(draft, currentFormat, mimeType);
      setMessages([]);
      return {
        dataUrl,
        width: currentFormat.width,
        height: currentFormat.height,
        mimeType,
      };
    } finally {
      setIsBusy(false);
    }
  }

  async function exportImage(mimeType: "image/png" | "image/jpeg") {
    const image = await renderExportImage(mimeType);
    if (!image) return;

    const extension = mimeType === "image/png" ? "png" : "jpg";
    downloadBlob(dataUrlToBlob(image.dataUrl), buildFileName(extension));
  }

  async function exportPdf() {
    const image = await renderExportImage("image/jpeg");
    if (!image) return;
    downloadBlob(createPdfBlob(image.dataUrl, image.width, image.height), buildFileName("pdf"));
  }

  async function copyImage() {
    const image = await renderExportImage("image/png");
    if (!image) return;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [image.mimeType]: dataUrlToBlob(image.dataUrl) }),
      ]);
      setNotice("Imagem copiada para a área de transferência.");
    } catch {
      setMessages(["Seu navegador não permitiu copiar a imagem. Use Exportar PNG."]);
    }
  }

  async function shareImage() {
    const image = await renderExportImage("image/png");
    if (!image) return;

    const file = new File([dataUrlToBlob(image.dataUrl)], buildFileName("png"), {
      type: image.mimeType,
    });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: "Card financeiro",
        text: "Card financeiro gerado automaticamente.",
        files: [file],
      });
      return;
    }

    downloadBlob(dataUrlToBlob(image.dataUrl), buildFileName("png"));
    setNotice("Compartilhamento direto indisponível. Baixei a imagem para você.");
  }

  async function deleteCurrentCard() {
    if (!draft) return;

    const nextCards = cards.filter((card) => card.id !== draft.id);
    setCards(nextCards);
    removeLocalDraft(user.id, draft.id);
      await financeRepository.remove(draft.id, accessToken);
    setDraft(null);
    setIsDraftDirty(false);
    setDraftBackupStatus("idle");
    setScreen("home");
    setNotice("Card removido do histórico.");
  }

  function buildFileName(extension: string) {
    const label = draft ? getReceiptLabel(draft).toLocaleLowerCase("pt-BR") : "card";
    const cleanLabel = label
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/(^-|-$)/g, "");

    return `card-financeiro-${cleanLabel || "recebimento"}.${extension}`;
  }

  const isAdminArea = screen === "admin" && user.role === "admin";

  return (
    <main
      className={`finance-app${isStandaloneApp ? " is-standalone" : ""}${
        showIosInstallHint ? " has-ios-install-hint" : ""
      }`}
      data-theme={theme}
    >
      <aside className="app-menu">
        <div className="brand-block">
          <span className="brand-mark">
            <BadgeDollarSign size={22} aria-hidden="true" />
          </span>
          <div>
            <strong>Cards Financeiros</strong>
            <span>controle e compartilhamento</span>
          </div>
        </div>

        <nav aria-label="Menu principal">
          <button
            className={`menu-item${isAdminArea ? "" : " is-active"}`}
            type="button"
            onClick={openCardsHome}
          >
            <LayoutDashboard size={18} aria-hidden="true" />
            Cards Financeiros
          </button>
          {user.role === "admin" ? (
            <button
              className={`menu-item${isAdminArea ? " is-active" : ""}`}
              type="button"
              onClick={openAdminArea}
            >
              <ShieldCheck size={18} aria-hidden="true" />
              Admin
            </button>
          ) : null}
        </nav>

        <div className="account-card">
          <span className="account-avatar">
            <UserCircle size={19} aria-hidden="true" />
          </span>
          <div>
            <strong>{user.displayName}</strong>
            <span>{user.email}</span>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sair da conta"
            title="Sair da conta"
          >
            <LogOut size={17} aria-hidden="true" />
          </button>
        </div>

        <button
          className="theme-toggle"
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Alternar tema"
          title="Alternar tema"
        >
          {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
          <span>{theme === "dark" ? "Dark" : "Claro"}</span>
        </button>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div>
            <span className="eyebrow">{isAdminArea ? "Admin" : "Módulo"}</span>
            <h1>{isAdminArea ? "Controle de acesso" : "Cards Financeiros"}</h1>
          </div>
          {isAdminArea ? null : (
            <button className="primary-action" type="button" onClick={openNewCard}>
              <Plus size={20} aria-hidden="true" />
              Novo Card
            </button>
          )}
        </header>

        {notice ? (
          <div className="notice" role="status">
            <CheckCircle2 size={18} aria-hidden="true" />
            {notice}
          </div>
        ) : null}

        {screen === "home" ? (
          <HomeScreen
            cards={cards}
            filteredCards={filteredCards}
            filters={filters}
            groupedHistory={groupedHistory}
            statistics={statistics}
            onFilterChange={setFilters}
            onNewCard={openNewCard}
            onOpenCard={openExistingCard}
          />
        ) : isAdminArea ? (
          <section className="admin-page">
            <AdminAccessPanel
              adminEmail={adminEmail}
              adminMessage={adminMessage}
              adminRole={adminRole}
              adminStatus={adminStatus}
              quota={authEmailQuota}
              users={accessUsers}
              onEmailChange={setAdminEmail}
              onDeleteUser={deleteAccessUser}
              onRefresh={loadAccessUsers}
              onRoleChange={setAdminRole}
              onSave={saveAccessUser}
              onStatusChange={setAdminStatus}
              onToggleUser={toggleAccessUser}
            />
          </section>
        ) : draft ? (
          <section className="editor-shell">
            <div className="editor-main">
              <button className="ghost-action back-action" type="button" onClick={() => setScreen("home")}>
                <ArrowLeft size={18} aria-hidden="true" />
                Histórico
              </button>

              <SummaryPanel card={draft} metrics={metrics} hasUserInput={hasUserInput} />

              {messages.length ? (
                <div className="message-stack" role="alert">
                  {messages.map((message) => (
                    <p key={message}>
                      <AlertTriangle size={16} aria-hidden="true" />
                      {message}
                    </p>
                  ))}
                </div>
              ) : null}

              {metrics.balanceCents < 0 ? (
                <div className="negative-warning">
                  <AlertTriangle size={18} aria-hidden="true" />
                  O saldo ficou negativo. Revise os pagamentos antes de compartilhar.
                </div>
              ) : null}

              <section className="form-section" aria-labelledby="receipt-form-title">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Recebimento</span>
                    <h2 id="receipt-form-title">Dados do card</h2>
                  </div>
                  <div className="editor-actions">
                    {draftBackupStatus !== "idle" ? (
                      <span
                        className={`draft-indicator is-${draftBackupStatus}`}
                        role="status"
                      >
                        {draftBackupLabel(draftBackupStatus)}
                      </span>
                    ) : null}
                    <button className="ghost-action" type="button" onClick={saveChanges} disabled={isBusy}>
                      <Save size={18} aria-hidden="true" />
                      Salvar
                    </button>
                  </div>
                </div>

                <div className="form-grid">
                  <label className="field">
                    <span>Tipo do recebimento</span>
                    <select
                      value={draft.type}
                      onChange={(event) =>
                        patchDraft({
                          type: event.target.value as ReceiptType | "",
                          customType:
                            event.target.value === "Personalizado" ? draft.customType : "",
                        })
                      }
                    >
                      <option value="">Selecione</option>
                      {receiptTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>

                  {draft.type === "Personalizado" ? (
                    <label className="field">
                      <span>Nome personalizado</span>
                      <input
                        value={draft.customType}
                        onChange={(event) => patchDraft({ customType: event.target.value })}
                        placeholder="Informe o nome"
                      />
                    </label>
                  ) : null}

                  <label className="field">
                    <span>Data</span>
                    <input
                      type="date"
                      value={draft.date}
                      onChange={(event) => patchDraft({ date: event.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Valor recebido</span>
                    <input
                      inputMode="numeric"
                      value={formatCurrencyInput(draft.amountCents)}
                      onChange={(event) =>
                        patchDraft({ amountCents: parseCurrencyToCents(event.target.value) })
                      }
                      placeholder="Digite o valor"
                    />
                  </label>

                  <label className="field field-wide">
                    <span>Descrição opcional</span>
                    <textarea
                      value={draft.description}
                      onChange={(event) => patchDraft({ description: event.target.value })}
                      placeholder="Adicione uma observação"
                      rows={3}
                    />
                  </label>
                </div>
              </section>

              <section className="form-section" aria-labelledby="payments-title">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Lista de pagamentos</span>
                    <h2 id="payments-title">Pagamentos</h2>
                  </div>
                  <button className="secondary-action" type="button" onClick={addPayment}>
                    <Plus size={18} aria-hidden="true" />
                    Adicionar pagamento
                  </button>
                </div>

                {draft.payments.length ? (
                  <div className="payments-list">
                    {draft.payments.map((payment, index) => (
                      <div className="payment-item" key={payment.id}>
                        <div className="payment-index">{String(index + 1).padStart(2, "0")}</div>
                        <div className="payment-fields">
                          <label className="field">
                            <span>Nome</span>
                            <input
                              value={payment.name}
                              onChange={(event) =>
                                updatePayment(payment.id, { name: event.target.value })
                              }
                              placeholder="Nome do pagamento"
                            />
                          </label>

                          <label className="field">
                            <span>Valor</span>
                            <input
                              inputMode="numeric"
                              value={formatCurrencyInput(payment.amountCents)}
                              onChange={(event) =>
                                updatePayment(payment.id, {
                                  amountCents: parseCurrencyToCents(event.target.value),
                                })
                              }
                              placeholder="Digite o valor"
                            />
                          </label>

                          <label className="field">
                            <span>Categoria</span>
                            <select
                              value={payment.category}
                              onChange={(event) =>
                                updatePayment(payment.id, {
                                  category: event.target.value as PaymentCategory | "",
                                })
                              }
                            >
                              <option value="">Selecione</option>
                              {paymentCategories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="field">
                            <span>Observação opcional</span>
                            <input
                              value={payment.note}
                              onChange={(event) =>
                                updatePayment(payment.id, { note: event.target.value })
                              }
                              placeholder="Adicione uma observação"
                            />
                          </label>
                        </div>
                        <button
                          className="icon-button danger"
                          type="button"
                          onClick={() => removePayment(payment.id)}
                          aria-label="Excluir pagamento"
                          title="Excluir pagamento"
                        >
                          <Trash2 size={18} aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<ReceiptText size={26} aria-hidden="true" />}
                    title="Nenhum pagamento adicionado"
                    text="Use o botão acima para criar os pagamentos deste recebimento."
                  />
                )}
              </section>
            </div>

            <aside className="preview-rail">
              <section className="preview-panel" aria-labelledby="preview-title">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Imagem</span>
                    <h2 id="preview-title">Card gerado</h2>
                  </div>
                  <select
                    className="format-select"
                    value={selectedFormat}
                    onChange={(event) => setSelectedFormat(event.target.value as CardFormatId)}
                    aria-label="Formato da imagem"
                  >
                    {cardFormats.map((format) => (
                      <option key={format.id} value={format.id}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="card-preview-frame">
                  {currentImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={currentImage.dataUrl} alt="Card financeiro gerado" />
                  ) : (
                    <EmptyState
                      icon={<FileImage size={26} aria-hidden="true" />}
                      title="Imagem ainda não gerada"
                      text="Preencha os dados e gere o card para visualizar."
                    />
                  )}
                </div>

                {draft.images.length ? (
                  <div className="versions-list" aria-label="Versões de imagem salvas">
                    <span>Versões salvas</span>
                    {draft.images.map((image) => (
                      <button
                        key={image.id}
                        className={image.id === currentImage?.id ? "is-current" : ""}
                        type="button"
                        onClick={() => setSelectedImageId(image.id)}
                      >
                        <Eye size={14} aria-hidden="true" />
                        {readableTimestamp(image.createdAt)} · {image.width}x{image.height}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="preview-actions">
                  <button className="primary-action full" type="button" onClick={() => generateCard()} disabled={isBusy}>
                    <RefreshCw size={18} aria-hidden="true" />
                    Gerar Card
                  </button>

                  <button type="button" className="tool-action" onClick={() => exportImage("image/png")} disabled={isBusy}>
                    <Download size={17} aria-hidden="true" />
                    Exportar PNG
                  </button>
                  <button type="button" className="tool-action" onClick={() => exportImage("image/jpeg")} disabled={isBusy}>
                    <ImageDown size={17} aria-hidden="true" />
                    Exportar JPG
                  </button>
                  <button type="button" className="tool-action" onClick={exportPdf} disabled={isBusy}>
                    <FileText size={17} aria-hidden="true" />
                    Exportar PDF
                  </button>
                  <button type="button" className="tool-action" onClick={copyImage} disabled={isBusy}>
                    <Copy size={17} aria-hidden="true" />
                    Copiar imagem
                  </button>
                  <button type="button" className="tool-action" onClick={shareImage} disabled={isBusy}>
                    <Share2 size={17} aria-hidden="true" />
                    Compartilhar
                  </button>
                </div>

                {cards.some((card) => card.id === draft.id) ? (
                  <button className="delete-card" type="button" onClick={deleteCurrentCard}>
                    <Trash2 size={17} aria-hidden="true" />
                    Excluir card
                  </button>
                ) : null}
              </section>
            </aside>
          </section>
        ) : null}
      </section>

      {showIosInstallHint ? (
        <aside className="ios-install-card" role="status" aria-label="Instalar no iPhone">
          <span className="ios-install-icon">
            <Smartphone size={20} aria-hidden="true" />
          </span>
          <div>
            <strong>Instalar no iPhone</strong>
            <p>Toque em Compartilhar e depois em Adicionar à Tela de Início.</p>
          </div>
          <button type="button" onClick={dismissIosInstallHint} aria-label="Ocultar dica de instalação">
            <X size={18} aria-hidden="true" />
          </button>
        </aside>
      ) : null}
    </main>
  );
}

function HomeScreen({
  cards,
  filteredCards,
  filters,
  groupedHistory,
  statistics,
  onFilterChange,
  onNewCard,
  onOpenCard,
}: {
  cards: FinanceCard[];
  filteredCards: FinanceCard[];
  filters: FilterState;
  groupedHistory: Record<string, FinanceCard[]>;
  statistics: ReturnType<typeof buildStatistics>;
  onFilterChange: (filters: FilterState) => void;
  onNewCard: () => void;
  onOpenCard: (card: FinanceCard) => void;
}) {
  return (
    <section className="home-grid">
      <div className="home-primary">
        <button className="new-card-hero" type="button" onClick={onNewCard}>
          <span>
            <Plus size={28} aria-hidden="true" />
          </span>
          Novo Card
        </button>

        <HistoryPanel
          groupedHistory={groupedHistory}
          totalCards={cards.length}
          filteredCount={filteredCards.length}
          onOpenCard={onOpenCard}
        />
      </div>

      <aside className="home-side">
        <FiltersPanel filters={filters} onFilterChange={onFilterChange} />
        <StatisticsPanel statistics={statistics} />
      </aside>
    </section>
  );
}

function AdminAccessPanel({
  adminEmail,
  adminMessage,
  adminRole,
  adminStatus,
  quota,
  users,
  onEmailChange,
  onDeleteUser,
  onRefresh,
  onRoleChange,
  onSave,
  onStatusChange,
  onToggleUser,
}: {
  adminEmail: string;
  adminMessage: string;
  adminRole: "admin" | "user";
  adminStatus: "active" | "blocked";
  quota: AuthEmailQuota | null;
  users: AccessUser[];
  onEmailChange: (value: string) => void;
  onDeleteUser: (user: AccessUser) => void;
  onRefresh: () => void;
  onRoleChange: (value: "admin" | "user") => void;
  onSave: () => void;
  onStatusChange: (value: "active" | "blocked") => void;
  onToggleUser: (user: AccessUser) => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);
  const nextAvailableAt = quota?.nextAvailableAt ?? null;
  const remainingSeconds = nextAvailableAt
    ? Math.max(0, Math.ceil((new Date(nextAvailableAt).getTime() - now) / 1000))
    : 0;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!nextAvailableAt || remainingSeconds > 0 || refreshedAt === nextAvailableAt) {
      return;
    }
    setRefreshedAt(nextAvailableAt);
    onRefresh();
  }, [nextAvailableAt, onRefresh, refreshedAt, remainingSeconds]);

  return (
    <section className="admin-panel" aria-labelledby="admin-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Admin</span>
          <h2 id="admin-title">Controle de acesso</h2>
        </div>
        <button className="ghost-action" type="button" onClick={onRefresh}>
          <RefreshCw size={16} aria-hidden="true" />
          Atualizar
        </button>
      </div>

      <div className="email-quota" aria-live="polite">
        <strong>E-mails de cadastro</strong>
        <span>{quota ? `${quota.available} de ${quota.limit} disponiveis nesta hora` : "Carregando limite..."}</span>
        {quota?.nextAvailableAt ? (
          <small>
            Proxima liberacao em {formatCountdown(remainingSeconds)} ({new Date(quota.nextAvailableAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })})
          </small>
        ) : (
          <small>Voce ja pode liberar uma pessoa para criar a conta.</small>
        )}
      </div>

      <div className="admin-form">
        <label className="field">
          <span>E-mail autorizado</span>
          <input
            inputMode="email"
            value={adminEmail}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="email@pessoa.com"
          />
        </label>

        <label className="field">
          <span>Permissao</span>
          <select
            value={adminRole}
            onChange={(event) => onRoleChange(event.target.value as "admin" | "user")}
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </label>

        <label className="field">
          <span>Status</span>
          <select
            value={adminStatus}
            onChange={(event) =>
              onStatusChange(event.target.value as "active" | "blocked")
            }
          >
            <option value="active">Ativo</option>
            <option value="blocked">Bloqueado</option>
          </select>
        </label>

        <button className="secondary-action full" type="button" onClick={onSave}>
          <Save size={17} aria-hidden="true" />
          Salvar acesso
        </button>
      </div>

      {adminMessage ? <p className="admin-message">{adminMessage}</p> : null}

      <div className="access-list">
        {users.map((accessUser) => (
          <div className="access-row" key={accessUser.email}>
            <div>
              <strong>{accessUser.email}</strong>
              <span>
                {accessUser.role === "admin" ? "Administrador" : "Usuario"} ·{" "}
                {accessUser.status === "active" ? "Ativo" : "Bloqueado"}
              </span>
            </div>
            <div className="access-actions">
              <button
                className={accessUser.status === "active" ? "danger-mini" : "success-mini"}
                type="button"
                onClick={() => onToggleUser(accessUser)}
              >
                {accessUser.status === "active" ? "Bloquear" : "Liberar"}
              </button>
              <button
                className="danger-mini"
                type="button"
                onClick={() => onDeleteUser(accessUser)}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function SummaryPanel({
  card,
  metrics,
  hasUserInput,
}: {
  card: FinanceCard;
  metrics: Metrics;
  hasUserInput: boolean;
}) {
  const tone = progressTone(metrics.committedPercent);

  return (
    <section className="summary-panel" aria-label="Resumo financeiro">
      <MetricTile
        icon={<Wallet size={19} aria-hidden="true" />}
        label="Recebimento"
        value={hasUserInput && card.amountCents ? formatCurrency(card.amountCents) : "Aguardando dados"}
      />
      <MetricTile
        icon={<CreditCard size={19} aria-hidden="true" />}
        label="Total comprometido"
        value={hasUserInput ? formatCurrency(metrics.totalPaidCents) : "Aguardando dados"}
      />
      <MetricTile
        icon={<BadgeDollarSign size={19} aria-hidden="true" />}
        label="Saldo"
        value={hasUserInput ? formatCurrency(metrics.balanceCents) : "Aguardando dados"}
        tone={metrics.balanceCents < 0 ? "danger" : "success"}
      />
      <MetricTile
        icon={<BarChart3 size={19} aria-hidden="true" />}
        label="Percentual utilizado"
        value={hasUserInput ? `${metrics.committedPercent}%` : "Aguardando dados"}
        tone={tone}
      />

      <div className="summary-progress">
        <span>Comprometimento</span>
        <div className="progress-track">
          <div
            className={`progress-fill ${tone}`}
            style={{ width: `${Math.min(metrics.committedPercent, 100)}%` }}
          />
        </div>
        <small>{metrics.paymentCount} pagamento(s)</small>
      </div>
    </section>
  );
}

function MetricTile({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  return (
    <div className={`metric-tile ${tone}`}>
      <span className="metric-icon">{icon}</span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HistoryPanel({
  groupedHistory,
  totalCards,
  filteredCount,
  onOpenCard,
}: {
  groupedHistory: Record<string, FinanceCard[]>;
  totalCards: number;
  filteredCount: number;
  onOpenCard: (card: FinanceCard) => void;
}) {
  const groups = Object.entries(groupedHistory);

  return (
    <section className="history-panel" aria-labelledby="history-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Histórico</span>
          <h2 id="history-title">Cards salvos</h2>
        </div>
        <span className="count-pill">{filteredCount}</span>
      </div>

      {groups.length ? (
        <div className="history-groups">
          {groups.map(([group, groupCards]) => (
            <div className="history-group" key={group}>
              <h3>{group}</h3>
              <div className="history-list">
                {groupCards.map((card) => {
                  const metrics = getMetrics(card);
                  return (
                    <button key={card.id} type="button" onClick={() => onOpenCard(card)}>
                      <span className="status-dot">
                        <CheckCircle2 size={16} aria-hidden="true" />
                      </span>
                      <span>
                        <strong>{getReceiptLabel(card)}</strong>
                        <small>
                          {formatDateBR(card.date)} · saldo {formatCurrency(metrics.balanceCents)}
                        </small>
                      </span>
                      <Pencil size={15} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<History size={26} aria-hidden="true" />}
          title={totalCards ? "Nenhum card encontrado" : "Histórico vazio"}
          text={
            totalCards
              ? "Ajuste os filtros para localizar outros cards."
              : "Crie um novo card para iniciar seu histórico financeiro."
          }
        />
      )}
    </section>
  );
}

function FiltersPanel({
  filters,
  onFilterChange,
}: {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}) {
  const patchFilters = (patch: Partial<FilterState>) =>
    onFilterChange({ ...filters, ...patch });

  return (
    <section className="filters-panel" aria-labelledby="filters-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Busca</span>
          <h2 id="filters-title">Filtros</h2>
        </div>
        <SlidersHorizontal size={18} aria-hidden="true" />
      </div>

      <div className="filters-grid">
        <label className="field">
          <span>Texto</span>
          <div className="input-with-icon">
            <Search size={16} aria-hidden="true" />
            <input
              value={filters.text}
              onChange={(event) => patchFilters({ text: event.target.value })}
              placeholder="Pesquisar"
            />
          </div>
        </label>

        <label className="field">
          <span>Mês</span>
          <select
            value={filters.month}
            onChange={(event) => patchFilters({ month: event.target.value })}
          >
            <option value="">Todos</option>
            {monthNames.map((month, index) => (
              <option key={month} value={String(index + 1).padStart(2, "0")}>
                {month}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Ano</span>
          <input
            inputMode="numeric"
            value={filters.year}
            onChange={(event) => patchFilters({ year: event.target.value.replace(/\D/g, "").slice(0, 4) })}
            placeholder="Todos"
          />
        </label>

        <label className="field">
          <span>Tipo</span>
          <select value={filters.type} onChange={(event) => patchFilters({ type: event.target.value })}>
            <option value="">Todos</option>
            {receiptTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Valor mínimo</span>
          <input
            inputMode="numeric"
            value={filters.minValue}
            onChange={(event) =>
              patchFilters({ minValue: formatCurrencyInput(parseCurrencyToCents(event.target.value)) })
            }
            placeholder="Sem mínimo"
          />
        </label>

        <label className="field">
          <span>Valor máximo</span>
          <input
            inputMode="numeric"
            value={filters.maxValue}
            onChange={(event) =>
              patchFilters({ maxValue: formatCurrencyInput(parseCurrencyToCents(event.target.value)) })
            }
            placeholder="Sem máximo"
          />
        </label>
      </div>

      <button className="ghost-action full" type="button" onClick={() => onFilterChange(emptyFilters)}>
        <X size={17} aria-hidden="true" />
        Limpar filtros
      </button>
    </section>
  );
}

function StatisticsPanel({
  statistics,
}: {
  statistics: ReturnType<typeof buildStatistics>;
}) {
  const maxMonthly = Math.max(
    1,
    ...statistics.monthlyEvolution.flatMap((item) => [item.received, item.paid]),
  );
  const maxCategory = Math.max(1, ...statistics.categoryTotals.map((item) => item.total));

  return (
    <section className="stats-panel" aria-labelledby="stats-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Estatísticas</span>
          <h2 id="stats-title">Resumo do mês</h2>
        </div>
        <PieChart size={18} aria-hidden="true" />
      </div>

      <div className="stats-grid">
        <StatItem label="Total recebido no mês" value={formatCompactCurrency(statistics.receivedCents)} />
        <StatItem label="Total pago" value={formatCompactCurrency(statistics.paidCents)} />
        <StatItem label="Saldo acumulado" value={formatCompactCurrency(statistics.balanceCents)} />
        <StatItem label="Quantidade de pagamentos" value={statistics.paymentCount ? String(statistics.paymentCount) : "Sem dados"} />
        <StatItem
          label="Maior pagamento"
          value={statistics.largestPayment ? formatCompactCurrency(statistics.largestPayment.amountCents) : "Sem dados"}
        />
        <StatItem
          label="Menor pagamento"
          value={statistics.smallestPayment ? formatCompactCurrency(statistics.smallestPayment.amountCents) : "Sem dados"}
        />
      </div>

      <div className="chart-block">
        <h3>
          <BarChart3 size={16} aria-hidden="true" />
          Evolução mensal
        </h3>
        {statistics.monthlyEvolution.length ? (
          <div className="monthly-chart">
            {statistics.monthlyEvolution.map((item) => (
              <div className="month-column" key={item.label}>
                <div className="bars">
                  <span
                    className="received"
                    style={{ height: `${Math.max(8, (item.received / maxMonthly) * 100)}%` }}
                    title={`Recebido ${formatCurrency(item.received)}`}
                  />
                  <span
                    className="paid"
                    style={{ height: `${Math.max(8, (item.paid / maxMonthly) * 100)}%` }}
                    title={`Pago ${formatCurrency(item.paid)}`}
                  />
                </div>
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-chart">Sem dados para gráfico.</p>
        )}
      </div>

      <div className="chart-block">
        <h3>
          <PieChart size={16} aria-hidden="true" />
          Por categoria
        </h3>
        {statistics.categoryTotals.length ? (
          <div className="category-chart">
            {statistics.categoryTotals.map((item) => (
              <div className="category-row" key={item.category}>
                <span>{item.category}</span>
                <div>
                  <i style={{ width: `${Math.max(8, (item.total / maxCategory) * 100)}%` }} />
                </div>
                <strong>{formatCompactCurrency(item.total)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-chart">Sem pagamentos categorizados.</p>
        )}
      </div>
    </section>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="empty-state">
      <span>{icon}</span>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
