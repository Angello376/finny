import {
  getAuthEmailQuota,
  markAuthEmailRateLimited,
  releaseAuthEmail,
  reserveAuthEmail,
} from "../auth-email-quota";

export async function GET() {
  return Response.json({ quota: await getAuthEmailQuota() });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as { email?: string };
  const email = payload.email?.trim().toLowerCase() ?? "";
  if (!email || !email.includes("@")) {
    return Response.json({ error: "Informe um e-mail valido." }, { status: 400 });
  }

  const reservationId = await reserveAuthEmail(email);
  if (!reservationId) {
    const quota = await getAuthEmailQuota();
    const status = quota.available === 0 ? 429 : 403;
    const error = status === 429
      ? "O limite de e-mails ainda nao foi liberado."
      : "Este e-mail precisa ser liberado pelo administrador antes do cadastro.";
    return Response.json({ error, quota }, { status });
  }

  return Response.json({ reservationId, quota: await getAuthEmailQuota() });
}

export async function PATCH(request: Request) {
  const payload = (await request.json()) as {
    reservationId?: string;
    outcome?: "failed" | "rate_limited";
  };
  if (!payload.reservationId) {
    return Response.json({ error: "Reserva invalida." }, { status: 400 });
  }

  if (payload.outcome === "rate_limited") {
    await markAuthEmailRateLimited(payload.reservationId);
  } else {
    await releaseAuthEmail(payload.reservationId);
  }
  return Response.json({ quota: await getAuthEmailQuota() });
}
