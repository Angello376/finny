import { apiErrorResponse } from "../api-error";
import { requireSupabaseUser } from "../supabase-auth";
import {
  getUserSupportConversation,
  sendUserSupportMessage,
} from "./support-storage";

export async function GET(request: Request) {
  const { user, response } = await requireSupabaseUser(request);
  if (!user) return response;

  try {
    return Response.json({ thread: await getUserSupportConversation(user) });
  } catch (error) {
    return apiErrorResponse(error, "Não foi possível carregar o suporte agora.");
  }
}

export async function POST(request: Request) {
  const { user, response } = await requireSupabaseUser(request);
  if (!user) return response;

  try {
    const payload = (await request.json()) as {
      subject?: string;
      message?: string;
    };
    const result = await sendUserSupportMessage(user, payload);
    if (result.response) return result.response;

    return Response.json({ thread: result.thread });
  } catch (error) {
    return apiErrorResponse(error, "Não foi possível enviar a mensagem agora.");
  }
}
