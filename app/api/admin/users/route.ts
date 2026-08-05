import {
  listAccessUsers,
  requireAdminUser,
  upsertAccessUser,
} from "../../supabase-auth";

function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Erro inesperado.";

  return Response.json({ error: message }, { status: 500 });
}

export async function GET(request: Request) {
  const { user, response } = await requireAdminUser(request);
  if (!user) return response;

  try {
    const users = await listAccessUsers();
    return Response.json({ users });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  const { user, response } = await requireAdminUser(request);
  if (!user) return response;

  try {
    const payload = (await request.json()) as {
      email?: string;
      role?: "admin" | "user";
      status?: "active" | "blocked";
    };

    const badRequest = await upsertAccessUser({
      email: payload.email ?? "",
      role: payload.role === "admin" ? "admin" : "user",
      status: payload.status === "blocked" ? "blocked" : "active",
    });
    if (badRequest) return badRequest;

    const users = await listAccessUsers();
    return Response.json({ users });
  } catch (error) {
    return apiError(error);
  }
}
