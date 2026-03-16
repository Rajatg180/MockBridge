const ACTIVE_SESSION_KEY = 'mockbridge.active.session';

export function loadActiveSessionRoom() {
  try {
    const raw = window.sessionStorage.getItem(ACTIVE_SESSION_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveActiveSessionRoom(sessionContext) {
  try {
    window.sessionStorage.setItem(
      ACTIVE_SESSION_KEY,
      JSON.stringify(sessionContext || null),
    );
  } catch {
    // Ignore storage errors.
  }
}

export function clearActiveSessionRoom() {
  try {
    window.sessionStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {
    // Ignore storage errors.
  }
}

export function buildSessionRoomPath(roomId) {
  return `/session/${encodeURIComponent(roomId || '')}`;
}
