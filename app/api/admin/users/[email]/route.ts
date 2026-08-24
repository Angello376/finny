import {
  deleteAccessUser,
  requireAdminUser,
  updateAccessUserStatus,
  type AccessStatus,
} from "../../../supabase-auth";

function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Erro inesperado.";

  return Response.json({ error: message }, { status: 500 });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ email: string }> },
) {
  const { user, response } = await requireAdminUser(request);
  if (!user) return response;

  try {
    const { email } = await context.params;
    const badRequest = await deleteAccessUser(
      decodeURIComponent(email),
      user.email,
    );
    if (badRequest) return badRequest;

    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ email: string }> },
) {
  const { user, response } = await requireAdminUser(request);
  if (!user) return response;

  try {
    const { email } = await context.params;
    const payload = (await request.json()) as { status?: AccessStatus };
    const status = payload.status === "blocked" ? "blocked" : "active";

    await updateAccessUserStatus(decodeURIComponent(email), status);

    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
