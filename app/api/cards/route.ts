import {
  listUserCards,
  requireApiUser,
  saveUserCard,
  type FinanceCard,
} from "./card-storage";

function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Erro inesperado.";

  return Response.json({ error: message }, { status: 500 });
}

export async function GET(request: Request) {
  const { user, response } = await requireApiUser(request);
  if (!user) return response;

  try {
    const cards = await listUserCards(user);
    return Response.json({ cards });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request) {
  const { user, response } = await requireApiUser(request);
  if (!user) return response;

  try {
    const payload = (await request.json()) as { card?: FinanceCard };
    if (!payload.card) {
      return Response.json({ error: "Card inválido." }, { status: 400 });
    }

    const { card, response: saveResponse } = await saveUserCard(user, payload.card);
    if (!card) return saveResponse;

    return Response.json({ card });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  return PUT(request);
}
