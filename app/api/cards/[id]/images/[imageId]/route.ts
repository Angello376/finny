import { getUserCardImage, requireApiUser } from "../../../card-storage";

function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Erro inesperado.";

  return Response.json({ error: message }, { status: 500 });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; imageId: string }> },
) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  try {
    const { id, imageId } = await context.params;
    const object = await getUserCardImage(
      user,
      decodeURIComponent(id),
      decodeURIComponent(imageId),
    );

    if (!object) {
      return Response.json({ error: "Imagem não encontrada." }, { status: 404 });
    }

    return new Response(object.body, {
      headers: {
        "cache-control": "private, max-age=31536000, immutable",
        "content-type": object.httpMetadata?.contentType ?? "image/png",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
