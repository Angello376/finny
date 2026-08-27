import { apiErrorResponse } from "../../api-error";
import { createVisitorSupportThread } from "../support-storage";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };
    const result = await createVisitorSupportThread(payload);
    if (result.response) return result.response;

    return Response.json({ ok: true, threadId: result.thread?.id ?? null });
  } catch (error) {
    return apiErrorResponse(error, "Não foi possível enviar a mensagem agora.");
  }
}
