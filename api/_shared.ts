const PRODUCTION_ORIGIN = 'https://scalliom.vercel.app';

const trustedOrigins = new Set([
  PRODUCTION_ORIGIN,
  'https://saad-workspace.github.io',
  'http://localhost:3000',
]);

export function getTrustedOrigin(request: Request) {
  const requestedOrigin = request.headers.get('origin');
  if (requestedOrigin && (
    trustedOrigins.has(requestedOrigin) ||
    /^https:\/\/scalliom-[a-z0-9-]+-pr0ject-2026\.vercel\.app$/.test(requestedOrigin)
  )) {
    return requestedOrigin;
  }

  return PRODUCTION_ORIGIN;
}

export function getReturnBase(origin: string) {
  return origin === 'https://saad-workspace.github.io'
    ? `${origin}/SCALLIOM/`
    : `${origin}/`;
}

export function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Origin': origin,
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  };
}

export function jsonResponse(payload: unknown, status: number, origin: string) {
  return Response.json(payload, {
    status,
    headers: corsHeaders(origin),
  });
}
