const STORAGE_KEY = 'mockbridge.auth.session';

export function loadStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        accessToken: null,
        refreshToken: null,
      };
    }

    const parsed = JSON.parse(raw);

    return {
      accessToken: parsed.accessToken || null,
      refreshToken: parsed.refreshToken || null,
    };
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
    };
  }
}

export function saveStoredSession(session) {
  const payload = JSON.stringify({
    accessToken: session?.accessToken || null,
    refreshToken: session?.refreshToken || null,
  });

  localStorage.setItem(STORAGE_KEY, payload);
}

export function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY);
}
