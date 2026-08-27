import { apiErrorResponse } from "../../../api-error";
import {
  archiveStoreProduct,
  listStoreInventory,
  requireApiStoreUser,
} from "../../store-storage";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireApiStoreUser(request);
  if (!user) return response;

  try {
    const { id } = await context.params;
    const badRequest = await archiveStoreProduct(decodeURIComponent(id));
    if (badRequest) return badRequest;

    return Response.json(await listStoreInventory());
  } catch (error) {
    return apiErrorResponse(error, "Não foi possível arquivar o produto agora.");
  }
}
