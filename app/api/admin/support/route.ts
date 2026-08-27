import { apiErrorResponse } from "../../api-error";
import { requireAdminUser } from "../../supabase-auth";
import { listAdminSupportThreads } from "../../support/support-storage";

export async function GET(request: Request) {
  const { user, response } = await requireAdminUser(request);
  if (!user) return response;

  try {
    return Response.json({ threads: await listAdminSupportThreads() });
  } catch (error) {
    return apiErrorResponse(error, "Não foi possível carregar os atendimentos agora.");
  }
}
