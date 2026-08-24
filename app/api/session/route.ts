import { requireSupabaseUser } from "../supabase-auth";

export async function GET(request: Request) {
  const { user, response } = await requireSupabaseUser(request);
  if (!user) return response;

  return Response.json({ user });
}
