import { STORAGE_KEYS } from './config';

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function getPersistedState() {
  if (typeof window === 'undefined') {
    return { auth: null, workspace: null };
  }

  return safeParse(window.localStorage.getItem(STORAGE_KEYS.root), {
    auth: null,
    workspace: null,
  });
}

export function persistSelectedState(partialState) {
  if (typeof window === 'undefined') return;

  const previous = getPersistedState();
  const nextState = {
    ...previous,
    ...partialState,
  };

  window.localStorage.setItem(STORAGE_KEYS.root, JSON.stringify(nextState));
}

export function clearPersistedState() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEYS.root);
}
