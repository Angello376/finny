import { apiErrorResponse } from "../../../api-error";
import { requireAdminUser } from "../../../supabase-auth";
import {
  updateSupportThreadStatus,
  type SupportStatus,
} from "../../../support/support-storage";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ threadId: string }> },
) {
  const { user, response } = await requireAdminUser(request);
  if (!user) return response;

  try {
    const { threadId } = await context.params;
    const payload = (await request.json()) as { status?: SupportStatus };
    const status =
      payload.status === "resolved"
        ? "resolved"
        : payload.status === "in_progress"
          ? "in_progress"
          : "new";
    const result = await updateSupportThreadStatus(
      decodeURIComponent(threadId),
      status,
    );
    if (result.response) return result.response;

    return Response.json({ thread: result.thread });
  } catch (error) {
    return apiErrorResponse(error, "Não foi possível atualizar o atendimento agora.");
  }
}
