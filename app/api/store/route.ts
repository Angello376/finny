import { apiErrorResponse } from "../api-error";
import { listStoreInventory, requireApiStoreUser } from "./store-storage";

export async function GET(request: Request) {
  const { user, response } = await requireApiStoreUser(request);
  if (!user) return response;

  try {
    return Response.json(await listStoreInventory());
  } catch (error) {
    return apiErrorResponse(error, "Não foi possível carregar a loja agora.");
  }
}
