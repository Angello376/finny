const technicalErrorPattern =
  /Failed query|SQLITE_|D1_|no such table|no such column|syntax error/i;

export function apiErrorResponse(
  error: unknown,
  fallbackMessage = "Não foi possível concluir a ação agora.",
) {
  const message = error instanceof Error ? error.message : "";
  const safeMessage =
    message && !technicalErrorPattern.test(message) ? message : fallbackMessage;

  return Response.json({ error: safeMessage }, { status: 500 });
}
