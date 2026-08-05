import {
  getCardImageByToken,
  getUserCardImage,
  requireApiUser,
} from "../../../card-storage";

function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Erro inesperado.";

  return Response.json({ error: message }, { status: 500 });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; imageId: string }> },
) {
  try {
    const { id, imageId } = await context.params;
    const cardId = decodeURIComponent(id);
    const decodedImageId = decodeURIComponent(imageId);
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const object = token
      ? await getCardImageByToken(cardId, decodedImageId, token)
      : await getOwnerImage(request, cardId, decodedImageId);

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

async function getOwnerImage(request: Request, cardId: string, imageId: string) {
  const { user, response } = await requireApiUser(request);
  if (!user) {
    await response?.arrayBuffer().catch(() => undefined);
    return null;
  }

  return getUserCardImage(user, cardId, imageId);
}
