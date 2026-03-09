function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return atob(padded);
}

export function parseJwt(token) {
  if (!token) return null;

  try {
    const [, payload] = token.split('.');
    return JSON.parse(base64UrlDecode(payload));
  } catch {
    return null;
  }
}

export function extractUserFromAccessToken(token) {
  const payload = parseJwt(token);
  if (!payload) return null;

  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
    issuer: payload.iss,
    expiresAt: payload.exp ? payload.exp * 1000 : null,
  };
}

export function isJwtExpired(token, skewMs = 30000) {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  return Date.now() + skewMs >= payload.exp * 1000;
}
