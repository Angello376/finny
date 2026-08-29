import { apiErrorResponse } from "../../api-error";
import {
  listStoreInventory,
  requireApiStoreUser,
  upsertStoreProduct,
} from "../store-storage";

export async function POST(request: Request) {
  const { user, response } = await requireApiStoreUser(request);
  if (!user) return response;

  try {
    const payload = (await request.json()) as {
      id?: string;
      name?: string;
      category?: string;
      sku?: string;
      costCents?: number;
      priceCents?: number;
      stockQuantity?: number;
      minStockQuantity?: number;
      flavors?: Array<{ id?: string; name?: string; stockQuantity?: number }>;
    };
    const result = await upsertStoreProduct(user, payload);
    if (result.response) return result.response;

    return Response.json({ ...(await listStoreInventory()), product: result.product });
  } catch (error) {
    return apiErrorResponse(error, "Não foi possível salvar o produto agora.");
  }
}
