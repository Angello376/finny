import { deleteUserCard, requireApiUser } from "../card-storage";

function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Erro inesperado.";

  return Response.json({ error: message }, { status: 500 });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  try {
    const { id } = await context.params;
    await deleteUserCard(user, decodeURIComponent(id));

    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
