"use client";

import {
  AlertTriangle,
  ArrowLeft,
  BadgeDollarSign,
  BarChart3,
  Boxes,
  CheckCircle2,
  Copy,
  CreditCard,
  FileText,
  History,
  Info,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogOut,
  MessageCircle,
  Moon,
  PackageMinus,
  PackagePlus,
  Pencil,
  Pin,
  PinOff,
  Plus,
  ReceiptText,
  RefreshCw,
  Save,
  Search,
  Send,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Store,
  Sun,
  Trash2,
  UserCircle,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  pinned: boolean;
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
};

type Metrics = {
  totalPaidCents: number;
  balanceCents: number;
  paymentCount: number;
  committedPercent: number;
};

type AnalysisTone = "success" | "warning" | "danger" | "info";

type FinnyAnalysisInsight = {
  title: string;
  text: string;
  tone: AnalysisTone;
};

type FinnyAnalysis = {
  periodLabel: string;
  receivedCents: number;
  paidCents: number;
  balanceCents: number;
  committedPercent: number;
  paymentCount: number;
  mainInsight: FinnyAnalysisInsight;
  insights: FinnyAnalysisInsight[];
  topCategory: { category: PaymentCategory; total: number } | null;
};

type HistoryMonthGroup = {
  key: string;
  label: string;
  cards: FinanceCard[];
  receivedCents: number;
  paidCents: number;
  balanceCents: number;
  paymentCount: number;
};

type AppRole = "admin" | "socio" | "user";

type ReleaseAnnouncement = {
  id: string;
  title: string;
  summary: string;
  highlights: string[];
  steps: string[];
  audienceRoles?: AppRole[];
};

type DraftBackupStatus = "idle" | "pending" | "saved" | "restored";

type BusyAction = "save" | "generate" | "export" | "copy" | "share" | null;

type EditorStepId = "receipt" | "payments" | "review";

type ReleaseGateStatus = "checking" | "required" | "cleared";

type AppUser = {
  id: string;
  displayName: string;
  email: string;
  requiresProfileName: boolean;
  role: AppRole;
  status: "active" | "blocked";
};

type AccessUser = {
  email: string;
  userId: string | null;
  role: AppRole;
  status: "active" | "blocked";
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

type StoreMovementType = "entry" | "sale" | "adjustment" | "initial";

type StoreProduct = {
  id: string;
  name: string;
  category: string;
  sku: string;
  costCents: number;
  priceCents: number;
  stockQuantity: number;
  minStockQuantity: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  updatedByUserId: string;
};

type StoreInventoryMovement = {
  id: string;
  productId: string;
  type: StoreMovementType;
  quantityDelta: number;
  quantityAfter: number;
  unitAmountCents: number;
  note: string;
  createdAt: string;
  createdByUserId: string;
  createdByName: string;
};

type StoreProductDraft = {
  id: string;
  name: string;
  category: string;
  sku: string;
  costCents: number;
  priceCents: number;
  stockQuantity: number;
  minStockQuantity: number;
};

type StoreMovementInput = {
  productId?: string;
  type?: "entry" | "sale";
  quantity?: number;
  note?: string;
};

type SupportStatus = "new" | "in_progress" | "resolved";

type SupportSource = "user" | "visitor";

type SupportSenderType = "user" | "visitor" | "admin";

type SupportMessage = {
  id: string;
  threadId: string;
  senderType: SupportSenderType;
  senderName: string;
  senderEmail: string;
  body: string;
  createdAt: string;
};

type SupportThread = {
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

const editorSteps: { id: EditorStepId; label: string }[] = [
  { id: "receipt", label: "Recebimento" },
  { id: "payments", label: "Pagamentos" },
  { id: "review", label: "Revisar" },
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

const THEME_KEY = "cards-financeiros:theme";
const IOS_INSTALL_HINT_KEY = "cards-financeiros:ios-install-hint-dismissed";
const DRAFTS_KEY_PREFIX = "cards-financeiros:drafts:";
const RELEASE_ACK_KEY_PREFIX = "finny:release-seen:";
const DRAFT_SAVE_DELAY_MS = 450;
const STORE_SYNC_INTERVAL_MS = 12000;

// Set to null when there is no active release note to show before entering the app.
const currentRelease: ReleaseAnnouncement | null = {
  id: "1.3",
  title: "Atualização 1.3",
  summary:
    "A Loja ficou mais rápida para cadastrar, vender e acompanhar o estoque.",
  audienceRoles: ["socio"],
  highlights: [
    "Venda com um clique pelo botão Vendi 1.",
    "Histórico da loja com cores mais fáceis de entender.",
    "Faturamento e lucro ficaram mais claros.",
  ],
  steps: [
    "Entre na aba Loja, se ela estiver liberada para seu usuário.",
    "Use Novo produto para cadastrar ou editar itens do estoque.",
    "Clique em Vendi 1 para registrar uma saída rápida.",
  ],
};

const emptyFilters: FilterState = {
  month: "",
  year: "",
};

const blankPayment = (): Payment => ({
  id: createId(),
  name: "",
  amountCents: 0,
  category: "",
  note: "",
  pinned: false,
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

const blankStoreProductDraft = (): StoreProductDraft => ({
  id: "",
  name: "",
  category: "",
  sku: "",
  costCents: 0,
  priceCents: 0,
  stockQuantity: 0,
  minStockQuantity: 0,
});

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

function formatProjectedProfitHint(cents: number) {
  const value = formatCurrency(Math.abs(cents));
  return cents >= 0
    ? `Se vender tudo: lucro ${value}`
    : `Se vender tudo: prejuízo ${value}`;
}

function getUserGreetingName(user: AppUser) {
  const displayName = user.displayName.trim();
  if (displayName && !displayName.includes("@")) return displayName.split(/\s+/)[0];
  return "usuário";
}

function formatHistorySummaryCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
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

function getCardDateParts(dateValue: string) {
  const value = dateValue.trim();
  const isoMatch = value.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/);
  if (isoMatch) {
    return {
      year: isoMatch[1],
      month: isoMatch[2].padStart(2, "0"),
      day: isoMatch[3]?.padStart(2, "0") ?? "",
    };
  }

  const brMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brMatch) {
    return {
      year: brMatch[3],
      month: brMatch[2].padStart(2, "0"),
      day: brMatch[1].padStart(2, "0"),
    };
  }

  return null;
}

function formatDateBR(dateValue: string) {
  if (!dateValue) return "";
  const parts = getCardDateParts(dateValue);
  if (!parts?.day) return dateValue;
  return `${parts.day}/${parts.month}/${parts.year}`;
}

function formatShortDate(dateValue: string) {
  if (!dateValue) return "";
  const parts = getCardDateParts(dateValue);
  return parts?.day ? `${parts.day}/${parts.month}` : formatDateBR(dateValue);
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
    payments: card.payments.map((payment) => ({ ...payment, pinned: Boolean(payment.pinned) })),
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

function releaseAckStorageKey(userId: string, releaseId: string) {
  return `${RELEASE_ACK_KEY_PREFIX}${userId}:${releaseId}`;
}

function getActiveReleaseForUser(user: AppUser) {
  if (!currentRelease) return null;
  if (!currentRelease.audienceRoles) return currentRelease;
  return currentRelease.audienceRoles.includes(user.role) ? currentRelease : null;
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

const storeRepository = {
  async list(accessToken: string) {
    const response = await fetch("/api/store", {
      headers: authHeaders(accessToken),
      cache: "no-store",
    });

    return readJsonResponse<{
      products: StoreProduct[];
      movements: StoreInventoryMovement[];
    }>(response);
  },
  async saveProduct(product: StoreProductDraft, accessToken: string) {
    const response = await fetch("/api/store/products", {
      method: "POST",
      headers: { ...authHeaders(accessToken), "content-type": "application/json" },
      body: JSON.stringify(product),
    });

    return readJsonResponse<{
      product: StoreProduct;
      products: StoreProduct[];
      movements: StoreInventoryMovement[];
    }>(response);
  },
  async moveStock(
    input: {
      productId: string;
      type: "entry" | "sale";
      quantity: number;
      note: string;
    },
    accessToken: string,
  ) {
    const response = await fetch("/api/store/movements", {
      method: "POST",
      headers: { ...authHeaders(accessToken), "content-type": "application/json" },
      body: JSON.stringify(input),
    });

    return readJsonResponse<{
      products: StoreProduct[];
      movements: StoreInventoryMovement[];
    }>(response);
  },
  async archiveProduct(productId: string, accessToken: string) {
    if (!productId) {
      throw new Error("Selecione um produto para arquivar.");
    }

    const response = await fetch(`/api/store/products/${encodeURIComponent(productId)}`, {
      method: "DELETE",
      headers: authHeaders(accessToken),
    });

    return readJsonResponse<{
      products: StoreProduct[];
      movements: StoreInventoryMovement[];
    }>(response);
  },
};

function authHeaders(accessToken: string) {
  return { authorization: `Bearer ${accessToken}` };
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Não foi possível concluir a ação agora.");
  }

  return data as T;
}

function sortCardsByUpdatedAt(a: FinanceCard, b: FinanceCard) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

function sortSupportThreadsByLastMessage(a: SupportThread, b: SupportThread) {
  return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
}

function upsertSupportThread(
  threads: SupportThread[],
  thread: SupportThread,
) {
  return [thread, ...threads.filter((current) => current.id !== thread.id)].sort(
    sortSupportThreadsByLastMessage,
  );
}

function validateReceiptStep(card: FinanceCard) {
  const errors: string[] = [];

  if (!card.type) errors.push("Selecione o tipo do recebimento.");
  if (card.type === "Personalizado" && !card.customType.trim()) {
    errors.push("Informe o nome do recebimento personalizado.");
  }
  if (!card.date) errors.push("Informe a data do recebimento.");
  if (card.amountCents <= 0) errors.push("Informe o valor recebido.");

  return errors;
}

function validatePaymentStep(card: FinanceCard) {
  const errors: string[] = [];

  card.payments.forEach((payment, index) => {
    if (!isMeaningfulPayment(payment)) return;

    const label = `Pagamento ${index + 1}`;
    if (!payment.name.trim()) errors.push(`${label}: informe o nome.`);
    if (payment.amountCents <= 0) errors.push(`${label}: informe o valor.`);
    if (!payment.category) errors.push(`${label}: selecione a categoria.`);
  });

  return errors;
}

function validateCard(card: FinanceCard) {
  return [...validateReceiptStep(card), ...validatePaymentStep(card)];
}

function getCardStatus(card: FinanceCard) {
  const metrics = getMetrics(card);

  if (metrics.balanceCents < 0) {
    return { label: "Saldo negativo", tone: "danger" };
  }

  if (card.images.length) {
    return { label: "Gerado", tone: "success" };
  }

  if (validateCard(card).length === 0) {
    return { label: "Pronto", tone: "neutral" };
  }

  return { label: "Rascunho", tone: "warning" };
}

function filterCards(cards: FinanceCard[], filters: FilterState) {
  return cards.filter((card) => {
    const parts = getCardDateParts(card.date);

    if (filters.month && parts?.month !== filters.month) return false;
    if (filters.year && parts?.year !== filters.year) return false;

    return true;
  });
}

function groupCardsByMonth(cards: FinanceCard[]) {
  const groups = new Map<string, HistoryMonthGroup>();

  cards.forEach((card) => {
    const parts = getCardDateParts(card.date);
    const date = parts ? new Date(Number(parts.year), Number(parts.month) - 1) : null;
    const key = parts ? `${parts.year}-${parts.month}` : "sem-data";
    const label = date
      ? `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      : "Sem data";
    const metrics = getMetrics(card);
    const current = groups.get(key) ?? {
      key,
      label,
      cards: [],
      receivedCents: 0,
      paidCents: 0,
      balanceCents: 0,
      paymentCount: 0,
    };

    current.cards.push(card);
    current.receivedCents += card.amountCents;
    current.paidCents += metrics.totalPaidCents;
    current.balanceCents += metrics.balanceCents;
    current.paymentCount += metrics.paymentCount;
    groups.set(key, current);
  });

  return [...groups.values()].sort((a, b) => {
    if (a.key === "sem-data") return 1;
    if (b.key === "sem-data") return -1;
    return b.key.localeCompare(a.key);
  });
}

function getPeriodCards(cards: FinanceCard[], filters: FilterState) {
  const today = new Date();
  const month = filters.month || String(today.getMonth() + 1).padStart(2, "0");
  const year = filters.year || String(today.getFullYear());

  return cards.filter((card) => {
    const parts = getCardDateParts(card.date);
    return parts?.year === year && parts.month === month;
  });
}

function buildFinnyAnalysis(cards: FinanceCard[], filters: FilterState): FinnyAnalysis {
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
  const categoryTotals = buildCategoryTotals(periodPayments);
  const pinnedPayments = periodPayments.filter((payment) => payment.pinned);
  const committedPercent =
    receivedCents > 0 ? Math.round((paidCents / receivedCents) * 100) : 0;
  const largestPayment = sortedPayments[0] ?? null;
  const topCategory = categoryTotals[0] ?? null;
  const mainInsight = getMainFinnyInsight({
    balanceCents,
    committedPercent,
    paidCents,
    receivedCents,
  });

  return {
    periodLabel: getAnalysisPeriodLabel(filters),
    receivedCents,
    paidCents,
    balanceCents,
    committedPercent,
    paymentCount: periodPayments.length,
    mainInsight,
    insights: buildFinnyInsights({
      committedPercent,
      largestPayment,
      paymentCount: periodPayments.length,
      pinnedCount: pinnedPayments.length,
      receivedCents,
      topCategory,
    }),
    topCategory,
  };
}

function getAnalysisPeriodLabel(filters: FilterState) {
  const today = new Date();
  const month = filters.month || String(today.getMonth() + 1).padStart(2, "0");
  const year = filters.year || String(today.getFullYear());
  const monthName = monthNames[Number(month) - 1] ?? "Periodo";

  return `${monthName} ${year}`;
}

function getMainFinnyInsight({
  balanceCents,
  committedPercent,
  paidCents,
  receivedCents,
}: {
  balanceCents: number;
  committedPercent: number;
  paidCents: number;
  receivedCents: number;
}): FinnyAnalysisInsight {
  if (receivedCents <= 0) {
    return {
      title: "Sem recebimento no período",
      text: "Crie um card com data e valor para o Finny analisar seus gastos.",
      tone: "info",
    };
  }

  if (balanceCents < 0) {
    return {
      title: "Atenção ao saldo negativo",
      text: `Os pagamentos passaram do recebimento em ${formatCurrency(Math.abs(balanceCents))}. Revise valores antes de fechar o card.`,
      tone: "danger",
    };
  }

  if (paidCents <= 0) {
    return {
      title: "Recebimento ainda livre",
      text: "Nenhum pagamento foi lançado nesse período. Adicione as contas conforme elas aparecerem.",
      tone: "success",
    };
  }

  if (committedPercent > 80) {
    return {
      title: "Recebimento muito comprometido",
      text: `Você já usou ${committedPercent}% do valor recebido. Priorize contas essenciais e evite novos compromissos.`,
      tone: "warning",
    };
  }

  if (committedPercent > 50) {
    return {
      title: "Uso sob controle, mas acompanhe",
      text: `Você usou ${committedPercent}% do recebimento e ainda tem ${formatCurrency(balanceCents)} livres.`,
      tone: "info",
    };
  }

  return {
    title: "Boa folga no período",
    text: `Você manteve ${formatCurrency(balanceCents)} disponíveis. Vale separar parte disso para reserva ou objetivo.`,
    tone: "success",
  };
}

function buildFinnyInsights({
  committedPercent,
  largestPayment,
  paymentCount,
  pinnedCount,
  receivedCents,
  topCategory,
}: {
  committedPercent: number;
  largestPayment: Payment | null;
  paymentCount: number;
  pinnedCount: number;
  receivedCents: number;
  topCategory: { category: PaymentCategory; total: number } | null;
}) {
  const insights: FinnyAnalysisInsight[] = [];

  if (largestPayment && receivedCents > 0) {
    const largestPercent = Math.round((largestPayment.amountCents / receivedCents) * 100);

    if (largestPercent >= 30) {
      insights.push({
        title: "Pagamento de maior impacto",
        text: `${largestPayment.name} representa ${largestPercent}% do recebimento. Vale acompanhar esse valor de perto.`,
        tone: "warning",
      });
    }
  }

  if (topCategory) {
    insights.push({
      title: "Categoria que mais puxou",
      text: `${topCategory.category} concentrou ${formatCurrency(topCategory.total)} dos pagamentos do período.`,
      tone: committedPercent > 80 ? "warning" : "info",
    });
  }

  if (pinnedCount > 0) {
    insights.push({
      title: "Recorrentes preparados",
      text: `${pinnedCount} pagamento${pinnedCount > 1 ? "s" : ""} fixado${pinnedCount > 1 ? "s" : ""} vai continuar ao duplicar um card.`,
      tone: "success",
    });
  } else if (paymentCount > 0) {
    insights.push({
      title: "Facilite o próximo mês",
      text: "Fixe contas recorrentes para elas irem junto quando você duplicar este card.",
      tone: "info",
    });
  }

  if (!insights.length) {
    insights.push({
      title: "Comece pelo básico",
      text: "Adicione recebimento, data e pagamentos para receber uma análise mais completa.",
      tone: "info",
    });
  }

  return insights.slice(0, 3);
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

function getReleaseGreeting(user: AppUser) {
  const displayName = user.displayName.trim();
  const email = user.email.trim().toLowerCase();
  const emailPrefix = email.split("@")[0] ?? "";
  const normalizedDisplayName = displayName.toLowerCase();
  const hasRealName =
    displayName.length > 0 &&
    !displayName.includes("@") &&
    normalizedDisplayName !== email &&
    normalizedDisplayName !== emailPrefix;

  return hasRealName
    ? `Olá, ${displayName}. Antes de abrir o app, veja rapidinho o que mudou nesta versão.`
    : "Olá! Antes de abrir o app, veja rapidinho o que mudou nesta versão.";
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
  const activeRelease = getActiveReleaseForUser(user);
  const [theme, setTheme] = useState<ThemeName>("dark");
  const [cards, setCards] = useState<FinanceCard[]>([]);
  const [draft, setDraft] = useState<FinanceCard | null>(null);
  const [screen, setScreen] = useState<"home" | "editor" | "store" | "support" | "admin">("home");
  const [editorStep, setEditorStep] = useState<EditorStepId>("receipt");
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [selectedFormat] = useState<CardFormatId>("square");
  const [messages, setMessages] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [isDraftDirty, setIsDraftDirty] = useState(false);
  const [draftBackupStatus, setDraftBackupStatus] =
    useState<DraftBackupStatus>("idle");
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);
  const [showIosInstallHint, setShowIosInstallHint] = useState(false);
  const [releaseGateStatus, setReleaseGateStatus] =
    useState<ReleaseGateStatus>(() => (activeRelease ? "checking" : "cleared"));
  const [accessUsers, setAccessUsers] = useState<AccessUser[]>([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminRole, setAdminRole] = useState<AppRole>("user");
  const [adminStatus, setAdminStatus] = useState<"active" | "blocked">("active");
  const [adminMessage, setAdminMessage] = useState("");
  const [authEmailQuota, setAuthEmailQuota] = useState<AuthEmailQuota | null>(null);
  const [supportThread, setSupportThread] = useState<SupportThread | null>(null);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportNotice, setSupportNotice] = useState("");
  const [isSupportLoading, setIsSupportLoading] = useState(false);
  const [adminSupportThreads, setAdminSupportThreads] = useState<SupportThread[]>([]);
  const [selectedSupportThreadId, setSelectedSupportThreadId] = useState<string | null>(null);
  const [adminSupportReply, setAdminSupportReply] = useState("");
  const [adminSupportMessage, setAdminSupportMessage] = useState("");
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [storeMovements, setStoreMovements] = useState<StoreInventoryMovement[]>([]);
  const [storeProductDraft, setStoreProductDraft] = useState<StoreProductDraft>(
    blankStoreProductDraft,
  );
  const [selectedStoreProductId, setSelectedStoreProductId] = useState<string>("");
  const [storeMovementType, setStoreMovementType] = useState<"entry" | "sale">("entry");
  const [storeMovementQuantity, setStoreMovementQuantity] = useState("");
  const [storeMovementNote, setStoreMovementNote] = useState("");
  const [storeMessage, setStoreMessage] = useState("");
  const [isStoreLoading, setIsStoreLoading] = useState(false);

  const loadAccessUsers = useCallback(async () => {
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
  }, [accessToken]);

  const loadSupportConversation = useCallback(async () => {
    setIsSupportLoading(true);
    setSupportNotice("");

    try {
      const response = await fetch("/api/support", {
        headers: authHeaders(accessToken),
        cache: "no-store",
      });
      const data = await readJsonResponse<{ thread: SupportThread | null }>(response);
      setSupportThread(data.thread);
    } catch (error) {
      setSupportNotice(
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar o suporte.",
      );
    } finally {
      setIsSupportLoading(false);
    }
  }, [accessToken]);

  const loadAdminSupport = useCallback(async () => {
    if (user.role !== "admin") return;
    setAdminSupportMessage("");

    try {
      const response = await fetch("/api/admin/support", {
        headers: authHeaders(accessToken),
        cache: "no-store",
      });
      const data = await readJsonResponse<{ threads: SupportThread[] }>(response);
      setAdminSupportThreads(data.threads);
      setSelectedSupportThreadId((current) =>
        current && data.threads.some((thread) => thread.id === current)
          ? current
          : data.threads[0]?.id ?? null,
      );
    } catch (error) {
      setAdminSupportMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar atendimentos.",
      );
    }
  }, [accessToken, user.role]);

  const loadStoreInventory = useCallback(async (options?: { silent?: boolean }) => {
    if (user.role !== "admin" && user.role !== "socio") return;
    if (!options?.silent) {
      setIsStoreLoading(true);
      setStoreMessage("");
    }

    try {
      const data = await storeRepository.list(accessToken);
      setStoreProducts(data.products);
      setStoreMovements(data.movements);
      setSelectedStoreProductId((current) =>
        current && data.products.some((product) => product.id === current)
          ? current
          : data.products[0]?.id ?? "",
      );
    } catch (error) {
      if (!options?.silent) {
        setStoreMessage(
          error instanceof Error ? error.message : "Nao foi possivel carregar a loja.",
        );
      }
    } finally {
      if (!options?.silent) setIsStoreLoading(false);
    }
  }, [accessToken, user.role]);

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
          setIsDraftDirty(true);
          setDraftBackupStatus("restored");
          setNotice("Rascunho recuperado neste aparelho.");
          setEditorStep("receipt");
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
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => registration.update())
        .catch(() => undefined);
    };

    if (document.readyState === "complete") {
      registerServiceWorker();
      return;
    }

    window.addEventListener("load", registerServiceWorker, { once: true });

    return () => window.removeEventListener("load", registerServiceWorker);
  }, []);

  useEffect(() => {
    if (!activeRelease) {
      setReleaseGateStatus("cleared");
      return;
    }

    setReleaseGateStatus(
      localStorage.getItem(releaseAckStorageKey(user.id, activeRelease.id)) === "true"
        ? "cleared"
        : "required",
    );
  }, [activeRelease, user.id]);

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
    loadAdminSupport();
  }, [loadAccessUsers, loadAdminSupport, user.role]);

  useEffect(() => {
    if (user.role !== "admin" && user.role !== "socio") return;
    loadStoreInventory();
  }, [loadStoreInventory, user.role]);

  useEffect(() => {
    if (screen !== "store" || (user.role !== "admin" && user.role !== "socio")) return;

    const refreshQuietly = () => {
      void loadStoreInventory({ silent: true });
    };
    const syncInterval = window.setInterval(refreshQuietly, STORE_SYNC_INTERVAL_MS);
    window.addEventListener("focus", refreshQuietly);

    return () => {
      window.clearInterval(syncInterval);
      window.removeEventListener("focus", refreshQuietly);
    };
  }, [loadStoreInventory, screen, user.role]);

  useEffect(() => {
    if (screen === "admin" && user.role !== "admin") {
      setScreen("home");
    }
    if (screen === "store" && user.role !== "admin" && user.role !== "socio") {
      setScreen("home");
    }
  }, [screen, user.role]);

  const filteredCards = useMemo(() => filterCards(cards, filters), [cards, filters]);
  const groupedHistory = useMemo(() => groupCardsByMonth(filteredCards), [filteredCards]);
  const finnyAnalysis = useMemo(
    () => buildFinnyAnalysis(cards, filters),
    [cards, filters],
  );
  const metrics = useMemo(() => (draft ? getMetrics(draft) : getMetrics(blankCard())), [draft]);
  const currentFormat = cardFormats.find((format) => format.id === selectedFormat) ?? cardFormats[0];
  const hasUserInput =
    Boolean(draft?.type || draft?.date || draft?.amountCents || draft?.description.trim()) ||
    Boolean(draft?.payments.some(isMeaningfulPayment));

  function openNewCard() {
    const nextDraft = blankCard();
    setDraft(nextDraft);
    setIsDraftDirty(false);
    setDraftBackupStatus("idle");
    setMessages([]);
    setNotice("");
    setEditorStep("receipt");
    setScreen("editor");
  }

  function openCardsHome() {
    setMessages([]);
    setNotice("");
    setScreen("home");
  }

  function openStoreArea() {
    if (user.role !== "admin" && user.role !== "socio") return;
    setMessages([]);
    setNotice("");
    setStoreMessage("");
    setScreen("store");
    void loadStoreInventory();
  }

  function openSupportArea() {
    setMessages([]);
    setNotice("");
    setSupportNotice("");
    setScreen("support");
    void loadSupportConversation();
  }

  function openAdminArea() {
    if (user.role !== "admin") return;
    setMessages([]);
    setNotice("");
    setScreen("admin");
    void loadAccessUsers();
    void loadAdminSupport();
  }

  function dismissIosInstallHint() {
    localStorage.setItem(IOS_INSTALL_HINT_KEY, "true");
    setShowIosInstallHint(false);
  }

  function dismissReleaseAnnouncement() {
    if (activeRelease) {
      localStorage.setItem(releaseAckStorageKey(user.id, activeRelease.id), "true");
    }
    setReleaseGateStatus("cleared");
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

  async function sendSupportMessage() {
    if (!supportMessage.trim()) {
      setSupportNotice("Escreva sua mensagem antes de enviar.");
      return;
    }

    setIsSupportLoading(true);
    setSupportNotice("");

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { ...authHeaders(accessToken), "content-type": "application/json" },
        body: JSON.stringify({
          subject: supportSubject,
          message: supportMessage,
        }),
      });
      const data = await readJsonResponse<{ thread: SupportThread | null }>(response);
      setSupportThread(data.thread);
      setSupportSubject("");
      setSupportMessage("");
      setSupportNotice("Mensagem enviada.");
    } catch (error) {
      setSupportNotice(
        error instanceof Error
          ? error.message
          : "Nao foi possivel enviar a mensagem.",
      );
    } finally {
      setIsSupportLoading(false);
    }
  }

  async function sendAdminSupportReply(threadId: string) {
    if (!adminSupportReply.trim()) {
      setAdminSupportMessage("Escreva a resposta antes de enviar.");
      return;
    }

    setAdminSupportMessage("");

    try {
      const response = await fetch(
        `/api/admin/support/${encodeURIComponent(threadId)}/messages`,
        {
          method: "POST",
          headers: { ...authHeaders(accessToken), "content-type": "application/json" },
          body: JSON.stringify({ message: adminSupportReply }),
        },
      );
      const data = await readJsonResponse<{ thread: SupportThread | null }>(response);
      if (data.thread) {
        setAdminSupportThreads((current) => upsertSupportThread(current, data.thread));
        setSelectedSupportThreadId(data.thread.id);
      }
      setAdminSupportReply("");
      setAdminSupportMessage("Resposta enviada.");
    } catch (error) {
      setAdminSupportMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel responder o atendimento.",
      );
    }
  }

  async function updateAdminSupportStatus(
    threadId: string,
    status: SupportStatus,
  ) {
    setAdminSupportMessage("");

    try {
      const response = await fetch(`/api/admin/support/${encodeURIComponent(threadId)}`, {
        method: "PATCH",
        headers: { ...authHeaders(accessToken), "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await readJsonResponse<{ thread: SupportThread | null }>(response);
      if (data.thread) {
        setAdminSupportThreads((current) => upsertSupportThread(current, data.thread));
        setSelectedSupportThreadId(data.thread.id);
      }
      setAdminSupportMessage("Status atualizado.");
    } catch (error) {
      setAdminSupportMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel alterar o status.",
      );
    }
  }

  async function saveStoreProduct() {
    setIsStoreLoading(true);
    setStoreMessage("");

    try {
      const data = await storeRepository.saveProduct(storeProductDraft, accessToken);
      setStoreProducts(data.products);
      setStoreMovements(data.movements);
      setSelectedStoreProductId(data.product.id);
      setStoreProductDraft(blankStoreProductDraft());
      setStoreMessage("Produto salvo.");
      return true;
    } catch (error) {
      setStoreMessage(
        error instanceof Error ? error.message : "Nao foi possivel salvar o produto.",
      );
      return false;
    } finally {
      setIsStoreLoading(false);
    }
  }

  function editStoreProduct(product: StoreProduct) {
    setStoreProductDraft({
      id: product.id,
      name: product.name,
      category: product.category,
      sku: product.sku,
      costCents: product.costCents,
      priceCents: product.priceCents,
      stockQuantity: product.stockQuantity,
      minStockQuantity: product.minStockQuantity,
    });
    setStoreMessage("Editando produto.");
  }

  async function archiveStoreProductFromApp(product: StoreProduct) {
    if (!product.id) {
      setStoreMessage("Atualizando o produto antes de arquivar. Tente novamente em instantes.");
      await loadStoreInventory();
      return;
    }

    const confirmed = window.confirm(`Arquivar ${product.name}?`);
    if (!confirmed) return;

    setIsStoreLoading(true);
    setStoreMessage("");

    try {
      const data = await storeRepository.archiveProduct(product.id, accessToken);
      setStoreProducts(data.products);
      setStoreMovements(data.movements);
      setSelectedStoreProductId((current) =>
        current === product.id ? data.products[0]?.id ?? "" : current,
      );
      setStoreMessage("Produto arquivado.");
    } catch (error) {
      setStoreMessage(
        error instanceof Error ? error.message : "Nao foi possivel arquivar o produto.",
      );
    } finally {
      setIsStoreLoading(false);
    }
  }

  async function saveStoreMovement(input?: StoreMovementInput) {
    const productId = input?.productId ?? selectedStoreProductId;
    const type = input?.type ?? storeMovementType;
    const quantity =
      input?.quantity ?? Number(storeMovementQuantity.replace(/\D/g, ""));
    const note = input?.note ?? storeMovementNote;

    setIsStoreLoading(true);
    setStoreMessage("");

    try {
      const data = await storeRepository.moveStock(
        {
          productId,
          type,
          quantity,
          note,
        },
        accessToken,
      );
      setStoreProducts(data.products);
      setStoreMovements(data.movements);
      setSelectedStoreProductId(productId);
      setStoreMovementQuantity("");
      setStoreMovementNote("");
      setStoreMessage(type === "sale" ? "Venda registrada." : "Entrada registrada.");
      return true;
    } catch (error) {
      setStoreMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel registrar a movimentacao.",
      );
      return false;
    } finally {
      setIsStoreLoading(false);
    }
  }

  function openExistingCard(card: FinanceCard) {
    const localDraft = resolveCardDraft(user.id, card);
    const nextDraft = cloneCard(localDraft?.card ?? card);
    setDraft(nextDraft);
    setIsDraftDirty(Boolean(localDraft));
    setDraftBackupStatus(localDraft ? "restored" : "idle");
    setMessages([]);
    setNotice(localDraft ? "Rascunho recuperado neste aparelho." : "");
    setEditorStep(nextDraft.images.length ? "review" : "receipt");
    setScreen("editor");
  }

  function duplicateCard(source: FinanceCard) {
    const now = new Date().toISOString();
    const pinnedPayments = source.payments.filter(
      (payment) => payment.pinned && isMeaningfulPayment(payment),
    );
    const nextDraft: FinanceCard = {
      ...cloneCard(source),
      id: createId(),
      createdAt: now,
      updatedAt: now,
      date: "",
      payments: pinnedPayments.map((payment) => ({ ...payment, id: createId(), pinned: true })),
      images: [],
    };

    setDraft(nextDraft);
    setIsDraftDirty(true);
    setDraftBackupStatus("pending");
    setMessages([]);
    setNotice(
      pinnedPayments.length
        ? "Cópia criada com os pagamentos fixados. Revise data e valor antes de salvar."
        : "Cópia criada sem pagamentos fixados. Revise data e valor antes de salvar.",
    );
    setEditorStep("receipt");
    setScreen("editor");
  }

  function goToPaymentsStep() {
    if (!draft) return;

    const validationErrors = validateReceiptStep(draft);
    if (validationErrors.length) {
      setMessages(validationErrors);
      return;
    }

    setMessages([]);
    setEditorStep("payments");
  }

  function goToReviewStep() {
    if (!draft) return;

    const validationErrors = validatePaymentStep(draft);
    if (validationErrors.length) {
      setMessages(validationErrors);
      return;
    }

    setMessages([]);
    setEditorStep("review");
  }

  function selectEditorStep(step: EditorStepId) {
    if (!draft || step === "receipt") {
      setMessages([]);
      setEditorStep(step);
      return;
    }

    const validationErrors =
      step === "payments"
        ? validateReceiptStep(draft)
        : validateCard(draft);

    if (validationErrors.length) {
      setMessages(validationErrors);
      return;
    }

    setMessages([]);
    setEditorStep(step);
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
    setBusyAction("save");
    setNotice("");
    try {
      const saved = await persistDraft();
      if (saved) setNotice("Card salvo no histórico.");
    } finally {
      setIsBusy(false);
      setBusyAction(null);
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
    setBusyAction("generate");
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
      if (saved) setNotice("Card gerado e histórico atualizado.");
      return image;
    } finally {
      setIsBusy(false);
      setBusyAction(null);
    }
  }

  async function renderExportImage(
    mimeType: "image/png" | "image/jpeg",
    action: Exclude<BusyAction, "save" | "generate" | null> = "export",
  ) {
    if (!draft) return null;

    const validationErrors = validateCard(draft);
    if (validationErrors.length) {
      setMessages(validationErrors);
      return null;
    }

    setIsBusy(true);
    setBusyAction(action);
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
      setBusyAction(null);
    }
  }

  async function exportPdf() {
    const image = await renderExportImage("image/jpeg", "export");
    if (!image) return;
    downloadBlob(createPdfBlob(image.dataUrl, image.width, image.height), buildFileName("pdf"));
  }

  async function shareImage() {
    const image = await renderExportImage("image/png", "share");
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
    setNotice("Compartilhamento direto indisponível. Baixei o card para você.");
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
  const canAccessStore = user.role === "admin" || user.role === "socio";
  const isStoreArea = screen === "store" && canAccessStore;
  const isSupportArea = screen === "support";
  const isCardsArea = screen === "home" || screen === "editor";
  const workspaceTitle = isAdminArea
    ? "Controle de acesso"
    : isStoreArea
      ? "Loja"
      : isSupportArea
        ? "Suporte"
        : "Cards Financeiros";
  const workspaceEyebrow = isAdminArea
    ? "Admin"
    : isStoreArea
      ? "Estoque"
      : isSupportArea
        ? "Ajuda"
        : "Módulo";
  const isGeneratingCard = busyAction === "generate";

  if (activeRelease && releaseGateStatus !== "cleared") {
    return (
      <main
        className={`release-gate${isStandaloneApp ? " is-standalone" : ""}`}
        data-theme={theme}
      >
        {releaseGateStatus === "checking" ? (
          <ReleaseGateLoading />
        ) : (
          <ReleaseAnnouncementGate
            release={activeRelease}
            user={user}
            onContinue={dismissReleaseAnnouncement}
            onSignOut={onSignOut}
          />
        )}
      </main>
    );
  }

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
            <Image
              alt=""
              draggable={false}
              height={192}
              src="/assets/brand/finny-logo.png"
              unoptimized
              width={192}
            />
          </span>
          <div>
            <strong>Finny</strong>
            <span>Olá, {getUserGreetingName(user)}</span>
          </div>
        </div>

        <nav aria-label="Menu principal">
          <button
            className={`menu-item${isCardsArea ? " is-active" : ""}`}
            type="button"
            onClick={openCardsHome}
          >
            <LayoutDashboard size={18} aria-hidden="true" />
            Cards Financeiros
          </button>
          {canAccessStore ? (
            <button
              className={`menu-item${isStoreArea ? " is-active" : ""}`}
              type="button"
              onClick={openStoreArea}
            >
              <Store size={18} aria-hidden="true" />
              Loja
            </button>
          ) : null}
          <button
            className={`menu-item${isSupportArea ? " is-active" : ""}`}
            type="button"
            onClick={openSupportArea}
          >
            <LifeBuoy size={18} aria-hidden="true" />
            Suporte
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

      <nav className="mobile-bottom-nav" aria-label="Menu principal mobile">
        <button
          className={`mobile-nav-item${isCardsArea ? " is-active" : ""}`}
          type="button"
          onClick={openCardsHome}
          aria-current={isCardsArea ? "page" : undefined}
        >
          <LayoutDashboard size={18} aria-hidden="true" />
          <span>Cards</span>
        </button>
        {canAccessStore ? (
          <button
            className={`mobile-nav-item${isStoreArea ? " is-active" : ""}`}
            type="button"
            onClick={openStoreArea}
            aria-current={isStoreArea ? "page" : undefined}
          >
            <Store size={18} aria-hidden="true" />
            <span>Loja</span>
          </button>
        ) : null}
        <button
          className={`mobile-nav-item${isSupportArea ? " is-active" : ""}`}
          type="button"
          onClick={openSupportArea}
          aria-current={isSupportArea ? "page" : undefined}
        >
          <LifeBuoy size={18} aria-hidden="true" />
          <span>Suporte</span>
        </button>
        {user.role === "admin" ? (
          <button
            className={`mobile-nav-item${isAdminArea ? " is-active" : ""}`}
            type="button"
            onClick={openAdminArea}
            aria-current={isAdminArea ? "page" : undefined}
          >
            <ShieldCheck size={18} aria-hidden="true" />
            <span>Admin</span>
          </button>
        ) : null}
      </nav>

      <section className="workspace">
        <header className="workspace-header">
          <div>
            <span className="eyebrow">{workspaceEyebrow}</span>
            <h1>{workspaceTitle}</h1>
          </div>
          {screen === "editor" ? (
            <button className="primary-action" type="button" onClick={openNewCard}>
              <Plus size={20} aria-hidden="true" />
              Novo Card
            </button>
          ) : null}
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
            finnyAnalysis={finnyAnalysis}
            onFilterChange={setFilters}
            onDuplicateCard={duplicateCard}
            onNewCard={openNewCard}
            onOpenCard={openExistingCard}
          />
        ) : isStoreArea ? (
          <StorePanel
            isLoading={isStoreLoading}
            message={storeMessage}
            movementNote={storeMovementNote}
            movementQuantity={storeMovementQuantity}
            movementType={storeMovementType}
            productDraft={storeProductDraft}
            products={storeProducts}
            selectedProductId={selectedStoreProductId}
            movements={storeMovements}
            onArchiveProduct={archiveStoreProductFromApp}
            onCancelProductEdit={() => {
              setStoreProductDraft(blankStoreProductDraft());
              setStoreMessage("");
            }}
            onEditProduct={editStoreProduct}
            onMovementNoteChange={setStoreMovementNote}
            onMovementQuantityChange={setStoreMovementQuantity}
            onMovementTypeChange={setStoreMovementType}
            onProductDraftChange={setStoreProductDraft}
            onRefresh={loadStoreInventory}
            onSaveMovement={saveStoreMovement}
            onSaveProduct={saveStoreProduct}
            onSelectProduct={setSelectedStoreProductId}
          />
        ) : isSupportArea ? (
          <SupportPanel
            isLoading={isSupportLoading}
            message={supportMessage}
            notice={supportNotice}
            subject={supportSubject}
            thread={supportThread}
            onMessageChange={setSupportMessage}
            onRefresh={loadSupportConversation}
            onSend={sendSupportMessage}
            onSubjectChange={setSupportSubject}
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
            <AdminSupportPanel
              message={adminSupportMessage}
              reply={adminSupportReply}
              selectedThreadId={selectedSupportThreadId}
              threads={adminSupportThreads}
              onRefresh={loadAdminSupport}
              onReplyChange={setAdminSupportReply}
              onSelectThread={setSelectedSupportThreadId}
              onSendReply={sendAdminSupportReply}
              onStatusChange={updateAdminSupportStatus}
            />
          </section>
        ) : draft ? (
          <section className={`editor-shell is-step-${editorStep}`}>
            <div className="editor-main">
              <button className="ghost-action back-action" type="button" onClick={() => setScreen("home")}>
                <ArrowLeft size={18} aria-hidden="true" />
                Histórico
              </button>

              <EditorStepper currentStep={editorStep} onStepChange={selectEditorStep} />

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

              {editorStep === "receipt" ? (
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

                <div className="step-footer">
                  <button className="primary-action" type="button" onClick={goToPaymentsStep}>
                    Continuar
                  </button>
                </div>
              </section>
              ) : null}

              {editorStep === "payments" ? (
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
                      <div
                        className={`payment-item ${payment.pinned ? "is-pinned" : ""}`}
                        key={payment.id}
                      >
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
                        <div className="payment-actions">
                          <button
                            className={`icon-button pin-toggle ${payment.pinned ? "is-pinned" : ""}`}
                            type="button"
                            onClick={() => updatePayment(payment.id, { pinned: !payment.pinned })}
                            aria-label={
                              payment.pinned
                                ? "Desfixar pagamento recorrente"
                                : "Fixar pagamento recorrente"
                            }
                            aria-pressed={payment.pinned}
                            title={
                              payment.pinned
                                ? "Desfixar pagamento recorrente"
                                : "Fixar para duplicar junto"
                            }
                          >
                            {payment.pinned ? (
                              <Pin size={18} aria-hidden="true" />
                            ) : (
                              <PinOff size={18} aria-hidden="true" />
                            )}
                          </button>
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

                <div className="step-footer">
                  <button className="ghost-action" type="button" onClick={() => setEditorStep("receipt")}>
                    Voltar
                  </button>
                  <button className="primary-action" type="button" onClick={goToReviewStep}>
                    Revisar card
                  </button>
                </div>
              </section>
              ) : null}

              {editorStep === "review" ? (
                <ReviewStep
                  card={draft}
                  metrics={metrics}
                  onEditPayments={() => setEditorStep("payments")}
                  onEditReceipt={() => setEditorStep("receipt")}
                  onSave={saveChanges}
                  isBusy={isBusy}
                />
              ) : null}
            </div>

            {editorStep === "review" ? (
            <aside className="preview-rail">
              <section className="preview-panel" aria-labelledby="preview-title">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Ações</span>
                    <h2 id="preview-title">Finalizar card</h2>
                  </div>
                </div>

                <div className="preview-actions">
                  <button
                    className={`primary-action full generate-card-action${
                      isGeneratingCard ? " is-generating" : ""
                    }`}
                    type="button"
                    onClick={() => generateCard()}
                    disabled={isBusy}
                    aria-busy={isGeneratingCard}
                  >
                    <span className="generate-card-liquid" aria-hidden="true" />
                    <span className="generate-card-content">
                      <RefreshCw size={18} aria-hidden="true" />
                      {isGeneratingCard ? "Gerando Card" : "Gerar Card"}
                    </span>
                  </button>

                  <button type="button" className="tool-action" onClick={exportPdf} disabled={isBusy}>
                    <FileText size={17} aria-hidden="true" />
                    Exportar PDF
                  </button>
                  <button type="button" className="tool-action" onClick={shareImage} disabled={isBusy}>
                    <Share2 size={17} aria-hidden="true" />
                    Compartilhar
                  </button>

                  {cards.some((card) => card.id === draft.id) ? (
                    <>
                    <button className="tool-action" type="button" onClick={() => duplicateCard(draft)}>
                      <Copy size={17} aria-hidden="true" />
                      Duplicar card
                    </button>
                    <button className="delete-card" type="button" onClick={deleteCurrentCard}>
                      <Trash2 size={17} aria-hidden="true" />
                      Excluir card
                    </button>
                    </>
                  ) : null}
                </div>
              </section>
            </aside>
            ) : null}
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

function EditorStepper({
  currentStep,
  onStepChange,
}: {
  currentStep: EditorStepId;
  onStepChange: (step: EditorStepId) => void;
}) {
  const currentIndex = editorSteps.findIndex((step) => step.id === currentStep);

  return (
    <nav className="editor-stepper" aria-label="Etapas do card">
      {editorSteps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isDone = index < currentIndex;

        return (
          <button
            className={`stepper-item${isActive ? " is-active" : ""}${
              isDone ? " is-done" : ""
            }`}
            key={step.id}
            type="button"
            onClick={() => onStepChange(step.id)}
            aria-current={isActive ? "step" : undefined}
          >
            <span>{isDone ? <CheckCircle2 size={15} aria-hidden="true" /> : index + 1}</span>
            {step.label}
          </button>
        );
      })}
    </nav>
  );
}

function ReviewStep({
  card,
  metrics,
  isBusy,
  onEditPayments,
  onEditReceipt,
  onSave,
}: {
  card: FinanceCard;
  metrics: Metrics;
  isBusy: boolean;
  onEditPayments: () => void;
  onEditReceipt: () => void;
  onSave: () => void;
}) {
  const status = getCardStatus(card);

  return (
    <section className="form-section review-step" aria-labelledby="review-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Revisão</span>
          <h2 id="review-title">Tudo pronto?</h2>
        </div>
        <span className={`status-pill ${status.tone}`}>{status.label}</span>
      </div>

      <div className="review-grid">
        <article>
          <span>Recebimento</span>
          <strong>{getReceiptLabel(card)}</strong>
          <small>
            {formatDateBR(card.date) || "Sem data"} · {formatCurrency(card.amountCents)}
          </small>
          <button className="ghost-action" type="button" onClick={onEditReceipt}>
            Editar recebimento
          </button>
        </article>

        <article>
          <span>Pagamentos</span>
          <strong>{metrics.paymentCount} pagamento(s)</strong>
          <small>
            {formatCurrency(metrics.totalPaidCents)} comprometidos · saldo{" "}
            {formatCurrency(metrics.balanceCents)}
          </small>
          <button className="ghost-action" type="button" onClick={onEditPayments}>
            Editar pagamentos
          </button>
        </article>
      </div>

      <div className="step-footer">
        <button className="ghost-action" type="button" onClick={onEditPayments}>
          Voltar
        </button>
        <button className="secondary-action" type="button" onClick={onSave} disabled={isBusy}>
          <Save size={17} aria-hidden="true" />
          Salvar
        </button>
      </div>
    </section>
  );
}

function ReleaseGateLoading() {
  return (
    <section className="release-gate-panel release-gate-loading" aria-live="polite">
      <span className="release-gate-logo">
        <Image
          alt=""
          draggable={false}
          height={192}
          src="/assets/brand/finny-logo.png"
          unoptimized
          width={192}
        />
      </span>
      <div>
        <span className="eyebrow">Finny</span>
        <h1>Preparando novidades...</h1>
        <p>Estamos conferindo se existe alguma atualização para você ver.</p>
      </div>
    </section>
  );
}

function ReleaseAnnouncementGate({
  release,
  user,
  onContinue,
  onSignOut,
}: {
  release: ReleaseAnnouncement;
  user: AppUser;
  onContinue: () => void;
  onSignOut: () => void;
}) {
  const [showSteps, setShowSteps] = useState(false);

  return (
    <section className="release-gate-panel" aria-labelledby="release-title" aria-live="polite">
      <div className="release-gate-hero">
        <header className="release-gate-header">
          <div>
            <span className="eyebrow">Novidades</span>
            <h1 id="release-title">{release.title}</h1>
            <p>{getReleaseGreeting(user)}</p>
          </div>
        </header>

        <div className="release-gate-art" aria-hidden="true">
          <Image
            alt=""
            draggable={false}
            height={1024}
            priority
            src="/assets/brand/finny-release-updates.png"
            unoptimized
            width={1536}
          />
        </div>
      </div>

      <div className="release-gate-summary">
        <span>
          <Info size={18} aria-hidden="true" />
        </span>
        <p>{release.summary}</p>
      </div>

      <ul className="release-highlights" aria-label="Resumo do que mudou">
        {release.highlights.map((highlight) => (
          <li key={highlight}>
            <CheckCircle2 size={15} aria-hidden="true" />
            {highlight}
          </li>
        ))}
      </ul>

      {showSteps ? (
        <div className="release-steps">
          <h2>
            <ListChecks size={16} aria-hidden="true" />
            Passo a passo
          </h2>
          <ol>
            {release.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="release-gate-actions">
        <button
          className="ghost-action"
          type="button"
          onClick={() => setShowSteps((current) => !current)}
        >
          <ListChecks size={16} aria-hidden="true" />
          {showSteps ? "Ocultar passo a passo" : "Ver passo a passo"}
        </button>
        <button className="secondary-action" type="button" onClick={onContinue}>
          Entendi, abrir o app
        </button>
      </div>

      <button className="release-gate-signout" type="button" onClick={onSignOut}>
        Trocar conta
        <LogOut size={15} aria-hidden="true" />
      </button>
    </section>
  );
}

function HomeScreen({
  cards,
  finnyAnalysis,
  filteredCards,
  filters,
  groupedHistory,
  onFilterChange,
  onDuplicateCard,
  onNewCard,
  onOpenCard,
}: {
  cards: FinanceCard[];
  finnyAnalysis: FinnyAnalysis;
  filteredCards: FinanceCard[];
  filters: FilterState;
  groupedHistory: HistoryMonthGroup[];
  onFilterChange: (filters: FilterState) => void;
  onDuplicateCard: (card: FinanceCard) => void;
  onNewCard: () => void;
  onOpenCard: (card: FinanceCard) => void;
}) {
  const hasActiveFilters = Object.values(filters).some(Boolean);

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
          onDuplicateCard={onDuplicateCard}
          onOpenCard={onOpenCard}
        />
      </div>

      <aside className="home-side">
        <details className="home-disclosure" open={hasActiveFilters || undefined}>
          <summary>
            <span>
              <SlidersHorizontal size={17} aria-hidden="true" />
              Filtros
            </span>
            {hasActiveFilters ? <i>ativos</i> : null}
          </summary>
          <FiltersPanel filters={filters} onFilterChange={onFilterChange} />
        </details>

        <details className="home-disclosure">
          <summary>
            <span>
              <Info size={17} aria-hidden="true" />
              Análise Finny
            </span>
          </summary>
          <FinnyAnalysisPanel analysis={finnyAnalysis} />
        </details>
      </aside>
    </section>
  );
}

function StorePanel({
  isLoading,
  message,
  movementNote,
  movementQuantity,
  movementType,
  productDraft,
  products,
  selectedProductId,
  movements,
  onArchiveProduct,
  onCancelProductEdit,
  onEditProduct,
  onMovementNoteChange,
  onMovementQuantityChange,
  onMovementTypeChange,
  onProductDraftChange,
  onRefresh,
  onSaveMovement,
  onSaveProduct,
  onSelectProduct,
}: {
  isLoading: boolean;
  message: string;
  movementNote: string;
  movementQuantity: string;
  movementType: "entry" | "sale";
  productDraft: StoreProductDraft;
  products: StoreProduct[];
  selectedProductId: string;
  movements: StoreInventoryMovement[];
  onArchiveProduct: (product: StoreProduct) => void;
  onCancelProductEdit: () => void;
  onEditProduct: (product: StoreProduct) => void;
  onMovementNoteChange: (value: string) => void;
  onMovementQuantityChange: (value: string) => void;
  onMovementTypeChange: (value: "entry" | "sale") => void;
  onProductDraftChange: (draft: StoreProductDraft) => void;
  onRefresh: () => void;
  onSaveMovement: (input?: StoreMovementInput) => Promise<boolean>;
  onSaveProduct: () => Promise<boolean>;
  onSelectProduct: (productId: string) => void;
}) {
  const metrics = getStoreMetrics(products);
  const [activePanel, setActivePanel] = useState<"product" | "movement" | null>(null);
  const [searchText, setSearchText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? null;
  const normalizedSearch = searchText.trim().toLocaleLowerCase("pt-BR");
  const visibleProducts = normalizedSearch
    ? products.filter((product) =>
        `${product.name} ${product.category}`
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch),
      )
    : products;
  const saleMovements = movements.filter((movement) => movement.quantityDelta < 0);
  const soldUnits = saleMovements.reduce(
    (total, movement) => total + Math.abs(movement.quantityDelta),
    0,
  );
  const marginPercent =
    metrics.stockRevenueCents > 0
      ? Math.round((metrics.projectedProfitCents / metrics.stockRevenueCents) * 100)
      : null;
  const lastSale = saleMovements[0] ?? null;

  function patchProductDraft(patch: Partial<StoreProductDraft>) {
    onProductDraftChange({ ...productDraft, ...patch });
  }

  function openProductPanel(product?: StoreProduct) {
    if (product) {
      onEditProduct(product);
    } else {
      onCancelProductEdit();
    }
    setActivePanel("product");
  }

  function openMovementPanel(product: StoreProduct, type: "entry" | "sale") {
    onSelectProduct(product.id);
    onMovementTypeChange(type);
    onMovementQuantityChange("1");
    onMovementNoteChange("");
    setActivePanel("movement");
  }

  async function handleSaveProduct() {
    const saved = await onSaveProduct();
    if (saved) setActivePanel(null);
  }

  async function handleSaveMovement() {
    const saved = await onSaveMovement();
    if (saved) setActivePanel(null);
  }

  async function handleQuickSale(product: StoreProduct) {
    const saved = await onSaveMovement({
      productId: product.id,
      type: "sale",
      quantity: 1,
      note: "",
    });
    if (saved) setActivePanel(null);
  }

  function closeActionPanel() {
    onCancelProductEdit();
    onMovementQuantityChange("");
    onMovementNoteChange("");
    setActivePanel(null);
  }

  return (
    <section className="store-page">
      <section className="store-summary" aria-label="Resumo da loja">
        <MetricTile
          icon={<Boxes size={19} aria-hidden="true" />}
          label="Produtos"
          value={String(metrics.productCount)}
        />
        <MetricTile
          icon={<PackagePlus size={19} aria-hidden="true" />}
          label="Em estoque"
          value={`${metrics.stockQuantity} un.`}
          tone={metrics.stockQuantity > 0 ? "success" : "neutral"}
        />
        <MetricTile
          icon={<Wallet size={19} aria-hidden="true" />}
          label="Investido"
          value={formatCurrency(metrics.stockCostCents)}
        />
        <MetricTile
          icon={<BarChart3 size={19} aria-hidden="true" />}
          label="Faturamento"
          value={formatCurrency(metrics.stockRevenueCents)}
          hint={formatProjectedProfitHint(metrics.projectedProfitCents)}
          tone={metrics.projectedProfitCents < 0 ? "danger" : "success"}
        />
      </section>

      {message ? (
        <div className="notice store-notice" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          {message}
        </div>
      ) : null}

      <div className="store-quick-layout">
        <section
          className="store-inventory-panel store-products-panel"
          aria-labelledby="store-products-title"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">Estoque</span>
              <h2 id="store-products-title">Produtos</h2>
            </div>
            <div className="store-heading-actions">
              <button className="ghost-action" type="button" onClick={onRefresh} disabled={isLoading}>
                <RefreshCw size={16} aria-hidden="true" />
                Atualizar
              </button>
              <button
                className="secondary-action"
                type="button"
                onClick={() => openProductPanel()}
              >
                <Plus size={17} aria-hidden="true" />
                Novo produto
              </button>
            </div>
          </div>

          <label className="store-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Buscar produto</span>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Buscar produto..."
            />
            {searchText ? (
              <button type="button" onClick={() => setSearchText("")} aria-label="Limpar busca">
                <X size={16} aria-hidden="true" />
              </button>
            ) : null}
          </label>

          {visibleProducts.length ? (
            <div className="store-product-list store-product-list-quick">
              {visibleProducts.map((product) => (
                <article className="store-product-row store-product-card" key={product.id}>
                  <button
                    className="store-product-open"
                    type="button"
                    onClick={() => openMovementPanel(product, "sale")}
                  >
                    <span className="store-product-icon">
                      <Boxes size={18} aria-hidden="true" />
                    </span>
                    <span className="store-product-main">
                      <strong>{product.name}</strong>
                      <small>{product.category || "Sem categoria"}</small>
                    </span>
                    <span className="store-product-numbers">
                      <strong>{product.stockQuantity} un.</strong>
                      <small>
                        Custo {formatCurrency(product.costCents)} · Venda{" "}
                        {formatCurrency(product.priceCents)}
                      </small>
                    </span>
                    <span className={`status-pill ${storeProductStatusTone(product)}`}>
                      {storeProductStatusLabel(product)}
                    </span>
                  </button>

                  <div className="store-product-quick-actions">
                    <button
                      className="primary-action compact"
                      type="button"
                      onClick={() => handleQuickSale(product)}
                      disabled={isLoading || product.stockQuantity <= 0 || !product.id}
                    >
                      <PackageMinus size={16} aria-hidden="true" />
                      Vendi 1
                    </button>
                    <button
                      className="ghost-action compact"
                      type="button"
                      onClick={() => openMovementPanel(product, "entry")}
                    >
                      <PackagePlus size={16} aria-hidden="true" />
                      Entrada
                    </button>
                    <button
                      className="ghost-action compact"
                      type="button"
                      onClick={() => openProductPanel(product)}
                    >
                      <Pencil size={16} aria-hidden="true" />
                      Editar
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => onArchiveProduct(product)}
                      aria-label={`Arquivar ${product.name}`}
                      title="Arquivar produto"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : products.length ? (
            <EmptyState
              icon={<Search size={26} aria-hidden="true" />}
              title="Nenhum produto encontrado"
              text="Limpe a busca ou procure por outro nome."
            />
          ) : (
            <EmptyState
              icon={<Boxes size={26} aria-hidden="true" />}
              title="Estoque vazio"
              text="Cadastre o primeiro produto para começar o controle da loja."
            />
          )}
        </section>

        <aside className="store-side-panel" aria-label="Ações rápidas da loja">
          {activePanel === "product" ? (
            <form
              className="store-action-panel store-product-form"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSaveProduct();
              }}
            >
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Produto</span>
                  <h2>{productDraft.id ? "Editar produto" : "Novo produto"}</h2>
                </div>
                <button
                  className="icon-button"
                  type="button"
                  onClick={closeActionPanel}
                  aria-label="Fechar cadastro"
                  title="Fechar"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              <div className="form-grid store-compact-form">
                <label className="field field-wide">
                  <span>Nome do produto</span>
                  <input
                    value={productDraft.name}
                    onChange={(event) => patchProductDraft({ name: event.target.value })}
                    placeholder="Nome do produto"
                  />
                </label>

                <label className="field">
                  <span>Categoria</span>
                  <input
                    value={productDraft.category}
                    onChange={(event) => patchProductDraft({ category: event.target.value })}
                    placeholder="Categoria"
                  />
                </label>

                <label className="field">
                  <span>Quantidade inicial</span>
                  <input
                    inputMode="numeric"
                    value={productDraft.stockQuantity ? String(productDraft.stockQuantity) : ""}
                    onChange={(event) =>
                      patchProductDraft({
                        stockQuantity: parseQuantityInput(event.target.value),
                      })
                    }
                    placeholder="Quantidade"
                  />
                </label>

                <label className="field">
                  <span>Custo</span>
                  <input
                    inputMode="numeric"
                    value={formatCurrencyInput(productDraft.costCents)}
                    onChange={(event) =>
                      patchProductDraft({
                        costCents: parseCurrencyToCents(event.target.value),
                      })
                    }
                    placeholder="Digite o custo"
                  />
                </label>

                <label className="field">
                  <span>Venda</span>
                  <input
                    inputMode="numeric"
                    value={formatCurrencyInput(productDraft.priceCents)}
                    onChange={(event) =>
                      patchProductDraft({
                        priceCents: parseCurrencyToCents(event.target.value),
                      })
                    }
                    placeholder="Digite o valor"
                  />
                </label>

                <label className="field field-wide">
                  <span>Estoque mínimo</span>
                  <input
                    inputMode="numeric"
                    value={
                      productDraft.minStockQuantity
                        ? String(productDraft.minStockQuantity)
                        : ""
                    }
                    onChange={(event) =>
                      patchProductDraft({
                        minStockQuantity: parseQuantityInput(event.target.value),
                      })
                    }
                    placeholder="Quantidade"
                  />
                </label>
              </div>

              <div className="store-panel-footer">
                <button className="ghost-action" type="button" onClick={closeActionPanel}>
                  Cancelar
                </button>
                <button className="secondary-action" type="submit" disabled={isLoading}>
                  <Save size={17} aria-hidden="true" />
                  Salvar produto
                </button>
              </div>
            </form>
          ) : null}

          {activePanel === "movement" ? (
            <form
              className="store-action-panel store-movement-form"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSaveMovement();
              }}
            >
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Movimentação</span>
                  <h2>{movementType === "entry" ? "Entrada" : "Saída"}</h2>
                </div>
                <button
                  className="icon-button"
                  type="button"
                  onClick={closeActionPanel}
                  aria-label="Fechar movimentação"
                  title="Fechar"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              <div className="store-selected-product">
                {selectedProduct ? (
                  <>
                    <strong>{selectedProduct.name}</strong>
                    <span>{selectedProduct.stockQuantity} unidade(s) disponíveis</span>
                  </>
                ) : (
                  <>
                    <strong>Nenhum produto selecionado</strong>
                    <span>Selecione um produto para movimentar.</span>
                  </>
                )}
              </div>

              <div className="store-mode-toggle" role="group" aria-label="Tipo de movimentação">
                <button
                  className={movementType === "sale" ? "is-active" : ""}
                  type="button"
                  onClick={() => onMovementTypeChange("sale")}
                >
                  <PackageMinus size={16} aria-hidden="true" />
                  Saída
                </button>
                <button
                  className={movementType === "entry" ? "is-active" : ""}
                  type="button"
                  onClick={() => onMovementTypeChange("entry")}
                >
                  <PackagePlus size={16} aria-hidden="true" />
                  Entrada
                </button>
              </div>

              <div className="form-grid store-compact-form">
                <label className="field">
                  <span>Quantidade</span>
                  <input
                    inputMode="numeric"
                    value={movementQuantity}
                    onChange={(event) =>
                      onMovementQuantityChange(event.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Quantidade"
                  />
                </label>

                <label className="field field-wide">
                  <span>Observação</span>
                  <input
                    value={movementNote}
                    onChange={(event) => onMovementNoteChange(event.target.value)}
                    placeholder="Observação opcional"
                  />
                </label>
              </div>

              <button
                className="primary-action full"
                type="submit"
                disabled={isLoading || !selectedProduct}
              >
                {movementType === "entry" ? (
                  <PackagePlus size={18} aria-hidden="true" />
                ) : (
                  <PackageMinus size={18} aria-hidden="true" />
                )}
                Registrar {movementType === "entry" ? "entrada" : "saída"}
              </button>
            </form>
          ) : null}

          {!activePanel ? (
            <div className="store-action-panel store-insight-panel">
              <div>
                <span className="eyebrow">Resumo</span>
                <h2>Leitura rápida</h2>
              </div>
              <div className="store-mini-metrics">
                <span>
                  <small>Vendidas</small>
                  <strong>{soldUnits} un.</strong>
                </span>
                <span>
                  <small>Margem</small>
                  <strong>{marginPercent === null ? "Sem dados" : `${marginPercent}%`}</strong>
                </span>
              </div>
              <p>
                {lastSale
                  ? `Última saída: ${movementProductName(lastSale, products)}`
                  : "Nenhuma saída registrada ainda."}
              </p>
            </div>
          ) : null}

          <details
            className="store-history-disclosure"
            open={showHistory || undefined}
            onToggle={(event) => setShowHistory(event.currentTarget.open)}
          >
            <summary>
              <span>
                <History size={17} aria-hidden="true" />
                Histórico
              </span>
              <i>{movements.length}</i>
            </summary>

            {movements.length ? (
              <div className="store-movement-list compact-history">
                {movements.slice(0, 8).map((movement) => (
                  <article
                    className={`store-movement-row ${
                      movement.quantityDelta < 0 ? "is-sale" : "is-entry"
                    }`}
                    key={movement.id}
                  >
                    <span
                      className={`store-movement-icon ${
                        movement.quantityDelta >= 0 ? "success" : "danger"
                      }`}
                    >
                      {movement.quantityDelta >= 0 ? (
                        <PackagePlus size={16} aria-hidden="true" />
                      ) : (
                        <PackageMinus size={16} aria-hidden="true" />
                      )}
                    </span>
                    <div>
                      <strong>
                        {movementProductName(movement, products)} ·{" "}
                        {movementTypeLabel(movement.type)}
                      </strong>
                      <small>
                        <span
                          className={`movement-quantity ${
                            movement.quantityDelta < 0 ? "danger" : "success"
                          }`}
                        >
                          {formatSignedQuantity(movement.quantityDelta)} un.
                        </span>
                        <span>Estoque {movement.quantityAfter}</span>
                        <span>{movement.createdByName || "Finny"}</span>
                      </small>
                      {movement.note ? <p>{movement.note}</p> : null}
                    </div>
                    <time>{formatDateTimeBR(movement.createdAt)}</time>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<History size={26} aria-hidden="true" />}
                title="Sem movimentações"
                text="Entradas e saídas aparecem aqui depois do primeiro registro."
              />
            )}
          </details>
        </aside>
      </div>
    </section>
  );
}

function SupportPanel({
  isLoading,
  message,
  notice,
  subject,
  thread,
  onMessageChange,
  onRefresh,
  onSend,
  onSubjectChange,
}: {
  isLoading: boolean;
  message: string;
  notice: string;
  subject: string;
  thread: SupportThread | null;
  onMessageChange: (value: string) => void;
  onRefresh: () => void;
  onSend: () => void;
  onSubjectChange: (value: string) => void;
}) {
  return (
    <section className="support-page">
      <section className="support-panel" aria-labelledby="support-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Suporte</span>
            <h2 id="support-title">Fale com o suporte</h2>
          </div>
          <button className="ghost-action" type="button" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw size={16} aria-hidden="true" />
            Atualizar
          </button>
        </div>

        <div className="support-intro">
          <span>
            <LifeBuoy size={18} aria-hidden="true" />
          </span>
          <p>Envie sua dúvida ou problema por aqui. O retorno aparece nesta conversa.</p>
        </div>

        {notice ? (
          <p className="support-notice" role="status">
            {notice}
          </p>
        ) : null}

        {thread ? (
          <div className="support-thread-summary">
            <strong>{thread.subject}</strong>
            <span className={`status-pill ${supportStatusTone(thread.status)}`}>
              {supportStatusLabel(thread.status)}
            </span>
          </div>
        ) : null}

        <div className="support-chat" aria-live="polite">
          {isLoading ? (
            <p className="support-loading">Carregando suporte...</p>
          ) : thread?.messages.length ? (
            thread.messages.map((supportMessage) => (
              <article
                className={`support-message is-${supportMessage.senderType}`}
                key={supportMessage.id}
              >
                <div>
                  <strong>{supportSenderLabel(supportMessage)}</strong>
                  <time>{formatDateTimeBR(supportMessage.createdAt)}</time>
                </div>
                <p>{supportMessage.body}</p>
              </article>
            ))
          ) : (
            <EmptyState
              icon={<MessageCircle size={26} aria-hidden="true" />}
              title="Nenhuma conversa ainda"
              text="Envie a primeira mensagem quando precisar de ajuda."
            />
          )}
        </div>

        <form
          className="support-compose"
          onSubmit={(event) => {
            event.preventDefault();
            onSend();
          }}
        >
          {!thread ? (
            <label className="field">
              <span>Assunto</span>
              <input
                maxLength={120}
                onChange={(event) => onSubjectChange(event.target.value)}
                placeholder="Ex: dúvida sobre acesso"
                value={subject}
              />
            </label>
          ) : null}

          <label className="field">
            <span>Mensagem</span>
            <textarea
              maxLength={1800}
              onChange={(event) => onMessageChange(event.target.value)}
              placeholder="Escreva sua mensagem"
              rows={4}
              value={message}
            />
          </label>

          <button className="secondary-action full" type="submit" disabled={isLoading}>
            <Send size={17} aria-hidden="true" />
            Enviar mensagem
          </button>
        </form>
      </section>
    </section>
  );
}

function AdminSupportPanel({
  message,
  reply,
  selectedThreadId,
  threads,
  onRefresh,
  onReplyChange,
  onSelectThread,
  onSendReply,
  onStatusChange,
}: {
  message: string;
  reply: string;
  selectedThreadId: string | null;
  threads: SupportThread[];
  onRefresh: () => void;
  onReplyChange: (value: string) => void;
  onSelectThread: (threadId: string) => void;
  onSendReply: (threadId: string) => void;
  onStatusChange: (threadId: string, status: SupportStatus) => void;
}) {
  const selectedThread =
    threads.find((thread) => thread.id === selectedThreadId) ?? threads[0] ?? null;

  return (
    <section className="admin-panel support-admin-panel" aria-labelledby="admin-support-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Suporte</span>
          <h2 id="admin-support-title">Atendimentos</h2>
        </div>
        <button className="ghost-action" type="button" onClick={onRefresh}>
          <RefreshCw size={16} aria-hidden="true" />
          Atualizar
        </button>
      </div>

      {message ? (
        <p className="admin-message" role="status">
          {message}
        </p>
      ) : null}

      {threads.length ? (
        <div className="support-admin-layout">
          <div className="support-thread-list" aria-label="Lista de atendimentos">
            {threads.map((thread) => (
              <button
                className={`support-thread-button${
                  selectedThread?.id === thread.id ? " is-active" : ""
                }`}
                key={thread.id}
                type="button"
                onClick={() => onSelectThread(thread.id)}
              >
                <span>
                  <strong>{thread.subject}</strong>
                  <small>{thread.name || thread.email}</small>
                </span>
                <i className={`status-pill ${supportStatusTone(thread.status)}`}>
                  {supportStatusLabel(thread.status)}
                </i>
              </button>
            ))}
          </div>

          {selectedThread ? (
            <article className="support-detail">
              <header className="support-detail-header">
                <div>
                  <strong>{selectedThread.subject}</strong>
                  <span>
                    {supportSourceLabel(selectedThread.source)} · {selectedThread.name} ·{" "}
                    {selectedThread.email}
                  </span>
                </div>
                <label className="field support-status-field">
                  <span>Status</span>
                  <select
                    value={selectedThread.status}
                    onChange={(event) =>
                      onStatusChange(
                        selectedThread.id,
                        event.target.value as SupportStatus,
                      )
                    }
                  >
                    <option value="new">Novo</option>
                    <option value="in_progress">Em andamento</option>
                    <option value="resolved">Resolvido</option>
                  </select>
                </label>
              </header>

              <div className="support-chat is-admin-view">
                {selectedThread.messages.map((supportMessage) => (
                  <article
                    className={`support-message is-${supportMessage.senderType}`}
                    key={supportMessage.id}
                  >
                    <div>
                      <strong>{supportSenderLabel(supportMessage)}</strong>
                      <time>{formatDateTimeBR(supportMessage.createdAt)}</time>
                    </div>
                    <p>{supportMessage.body}</p>
                  </article>
                ))}
              </div>

              <form
                className="support-compose"
                onSubmit={(event) => {
                  event.preventDefault();
                  onSendReply(selectedThread.id);
                }}
              >
                <label className="field">
                  <span>Resposta</span>
                  <textarea
                    maxLength={1800}
                    onChange={(event) => onReplyChange(event.target.value)}
                    placeholder="Responder atendimento"
                    rows={4}
                    value={reply}
                  />
                </label>
                <button className="secondary-action full" type="submit">
                  <Send size={17} aria-hidden="true" />
                  Enviar resposta
                </button>
              </form>
            </article>
          ) : null}
        </div>
      ) : (
        <EmptyState
          icon={<LifeBuoy size={26} aria-hidden="true" />}
          title="Nenhum atendimento"
          text="Quando alguém pedir ajuda, a conversa aparece aqui."
        />
      )}
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
  adminRole: AppRole;
  adminStatus: "active" | "blocked";
  quota: AuthEmailQuota | null;
  users: AccessUser[];
  onEmailChange: (value: string) => void;
  onDeleteUser: (user: AccessUser) => void;
  onRefresh: () => void;
  onRoleChange: (value: AppRole) => void;
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
            onChange={(event) =>
              onRoleChange(event.target.value as AppRole)
            }
          >
            <option value="user">Usuario</option>
            <option value="socio">Sócio</option>
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
                {accessRoleLabel(accessUser.role)} ·{" "}
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
  hint,
  icon,
  label,
  value,
  tone = "neutral",
}: {
  hint?: string;
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  return (
    <div className={`metric-tile ${tone}`}>
      <span className="metric-icon">{icon}</span>
      <span>{label}</span>
      <strong key={value}>{value}</strong>
      {hint ? <small className="metric-hint">{hint}</small> : null}
    </div>
  );
}

function HistoryPanel({
  groupedHistory,
  totalCards,
  filteredCount,
  onDuplicateCard,
  onOpenCard,
}: {
  groupedHistory: HistoryMonthGroup[];
  totalCards: number;
  filteredCount: number;
  onDuplicateCard: (card: FinanceCard) => void;
  onOpenCard: (card: FinanceCard) => void;
}) {
  const groups = groupedHistory;

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
          {groups.map((group) => (
            <div className="history-group" key={group.key}>
              <div className="history-month-header">
                <div className="history-month-title">
                  <h3>{group.label}</h3>
                  <p>
                    {group.cards.length} {group.cards.length === 1 ? "card" : "cards"} ·{" "}
                    {group.paymentCount}{" "}
                    {group.paymentCount === 1 ? "pagamento" : "pagamentos"}
                  </p>
                </div>
                <div className="history-month-summary" aria-label={`Resumo de ${group.label}`}>
                  <span
                    className={`history-month-pill ${
                      group.balanceCents < 0 ? "danger" : "success"
                    }`}
                  >
                    <small>{group.balanceCents < 0 ? "Faltou" : "Sobrou"}</small>
                    <strong>{formatHistorySummaryCurrency(group.balanceCents)}</strong>
                  </span>
                  <span className="history-month-pill">
                    <small>Recebido</small>
                    <strong>{formatHistorySummaryCurrency(group.receivedCents)}</strong>
                  </span>
                  <span className="history-month-pill">
                    <small>Pago</small>
                    <strong>{formatHistorySummaryCurrency(group.paidCents)}</strong>
                  </span>
                </div>
              </div>
              <div className="history-list">
                {group.cards.map((card) => {
                  const status = getCardStatus(card);
                  return (
                    <div className="history-card-row" key={card.id}>
                      <button
                        className="history-card-open"
                        type="button"
                        onClick={() => onOpenCard(card)}
                      >
                        <span className="status-dot">
                          <CheckCircle2 size={16} aria-hidden="true" />
                        </span>
                        <span>
                          <strong>{getReceiptLabel(card)}</strong>
                          <small className="history-card-date">{formatDateBR(card.date)}</small>
                        </span>
                        <span className={`status-pill ${status.tone}`}>{status.label}</span>
                      </button>
                      <button
                        className="icon-button history-duplicate"
                        type="button"
                        onClick={() => onDuplicateCard(card)}
                        aria-label={`Duplicar ${getReceiptLabel(card)}`}
                        title="Duplicar card"
                      >
                        <Copy size={15} aria-hidden="true" />
                      </button>
                    </div>
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
          <span className="eyebrow">Período</span>
          <h2 id="filters-title">Mês e ano</h2>
        </div>
        <SlidersHorizontal size={18} aria-hidden="true" />
      </div>

      <div className="filter-toolbar">
        <div className="filters-grid">
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
        </div>

        <button className="ghost-action filter-clear" type="button" onClick={() => onFilterChange(emptyFilters)}>
          <X size={17} aria-hidden="true" />
          Limpar
        </button>
      </div>
    </section>
  );
}

function FinnyAnalysisPanel({ analysis }: { analysis: FinnyAnalysis }) {
  return (
    <section className="analysis-panel" aria-labelledby="analysis-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Análise</span>
          <h2 id="analysis-title">Análise Finny</h2>
        </div>
        <Info size={18} aria-hidden="true" />
      </div>

      <div className={`analysis-hero ${analysis.mainInsight.tone}`}>
        <span className="analysis-icon">
          {analysisIcon(analysis.mainInsight.tone)}
        </span>
        <div>
          <small>{analysis.periodLabel}</small>
          <h3>{analysis.mainInsight.title}</h3>
          <p>{analysis.mainInsight.text}</p>
        </div>
      </div>

      <div className="analysis-metrics">
        <AnalysisMetric label="Recebido" value={formatCurrency(analysis.receivedCents)} />
        <AnalysisMetric label="Pago" value={formatCurrency(analysis.paidCents)} />
        <AnalysisMetric label="Sobra" value={formatCurrency(analysis.balanceCents)} />
        <AnalysisMetric
          label="Uso"
          value={
            analysis.receivedCents > 0
              ? `${analysis.committedPercent}%`
              : "Sem dados"
          }
        />
      </div>

      <ul className="analysis-list" aria-label="Sugestões do Finny">
        {analysis.insights.map((insight) => (
          <li className={insight.tone} key={insight.title}>
            <span>{analysisIcon(insight.tone)}</span>
            <div>
              <strong>{insight.title}</strong>
              <p>{insight.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AnalysisMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="analysis-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function analysisIcon(tone: AnalysisTone) {
  if (tone === "success") return <CheckCircle2 size={16} aria-hidden="true" />;
  if (tone === "warning") return <AlertTriangle size={16} aria-hidden="true" />;
  if (tone === "danger") return <AlertTriangle size={16} aria-hidden="true" />;
  return <Info size={16} aria-hidden="true" />;
}

function getStoreMetrics(products: StoreProduct[]) {
  return products.reduce(
    (metrics, product) => ({
      productCount: metrics.productCount + 1,
      stockQuantity: metrics.stockQuantity + product.stockQuantity,
      stockCostCents:
        metrics.stockCostCents + product.stockQuantity * product.costCents,
      stockRevenueCents:
        metrics.stockRevenueCents + product.stockQuantity * product.priceCents,
      projectedProfitCents:
        metrics.projectedProfitCents +
        product.stockQuantity * (product.priceCents - product.costCents),
      lowStockCount:
        metrics.lowStockCount +
        (product.minStockQuantity > 0 &&
        product.stockQuantity <= product.minStockQuantity
          ? 1
          : 0),
    }),
    {
      productCount: 0,
      stockQuantity: 0,
      stockCostCents: 0,
      stockRevenueCents: 0,
      projectedProfitCents: 0,
      lowStockCount: 0,
    },
  );
}

function parseQuantityInput(value: string) {
  const numberValue = Number.parseInt(value.replace(/\D/g, ""), 10);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function storeProductStatusLabel(product: StoreProduct) {
  if (product.stockQuantity <= 0) return "Sem estoque";
  if (
    product.minStockQuantity > 0 &&
    product.stockQuantity <= product.minStockQuantity
  ) {
    return "Estoque baixo";
  }

  return "Disponível";
}

function storeProductStatusTone(product: StoreProduct) {
  if (product.stockQuantity <= 0) return "danger";
  if (
    product.minStockQuantity > 0 &&
    product.stockQuantity <= product.minStockQuantity
  ) {
    return "warning";
  }

  return "success";
}

function movementProductName(
  movement: StoreInventoryMovement,
  products: StoreProduct[],
) {
  return (
    products.find((product) => product.id === movement.productId)?.name ??
    "Produto arquivado"
  );
}

function movementTypeLabel(type: StoreMovementType) {
  if (type === "sale") return "Saída";
  if (type === "adjustment") return "Ajuste";
  if (type === "initial") return "Estoque inicial";
  return "Entrada";
}

function formatSignedQuantity(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

function accessRoleLabel(role: AccessUser["role"]) {
  if (role === "admin") return "Administrador";
  if (role === "socio") return "Sócio";
  return "Usuario";
}

function supportStatusLabel(status: SupportStatus) {
  if (status === "resolved") return "Resolvido";
  if (status === "in_progress") return "Em andamento";
  return "Novo";
}

function supportStatusTone(status: SupportStatus) {
  if (status === "resolved") return "success";
  if (status === "in_progress") return "warning";
  return "neutral";
}

function supportSourceLabel(source: SupportSource) {
  return source === "visitor" ? "Visitante" : "Usuario logado";
}

function supportSenderLabel(message: SupportMessage) {
  if (message.senderType === "admin") return "Suporte";
  return message.senderName || message.senderEmail || "Usuario";
}

function formatDateTimeBR(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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
