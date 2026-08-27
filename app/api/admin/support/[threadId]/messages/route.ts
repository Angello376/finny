import { apiErrorResponse } from "../../../../api-error";
import { requireAdminUser } from "../../../../supabase-auth";
import { sendAdminSupportMessage } from "../../../../support/support-storage";

export async function POST(
  request: Request,
  context: { params: Promise<{ threadId: string }> },
) {
  const { user, response } = await requireAdminUser(request);
  if (!user) return response;

  try {
    const { threadId } = await context.params;
    const payload = (await request.json()) as { message?: string };
    const result = await sendAdminSupportMessage(
      user,
      decodeURIComponent(threadId),
      payload.message,
    );
    if (result.response) return result.response;

    return Response.json({ thread: result.thread });
  } catch (error) {
    return apiErrorResponse(error, "Não foi possível responder o atendimento agora.");
  }
}
