import { apiErrorResponse } from "../../api-error";
import {
  createStoreMovement,
  listStoreInventory,
  requireApiStoreUser,
  type StoreMovementType,
} from "../store-storage";

export async function POST(request: Request) {
  const { user, response } = await requireApiStoreUser(request);
  if (!user) return response;

  try {
    const payload = (await request.json()) as {
      productId?: string;
      type?: StoreMovementType;
      quantity?: number;
      unitAmountCents?: number;
      flavorId?: string;
      note?: string;
    };
    const result = await createStoreMovement(user, payload);
    if (result.response) return result.response;

    return Response.json(await listStoreInventory());
  } catch (error) {
    return apiErrorResponse(error, "Não foi possível registrar a movimentação agora.");
  }
}
