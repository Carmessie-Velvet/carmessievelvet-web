import type { AuthSession } from "@/types/auth";

const STORAGE_KEY = "carmessie-velvet-auth";

type Listener = () => void;

function isValidSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<AuthSession>;
  return (
    typeof session.accessToken === "string" &&
    typeof session.refreshToken === "string" &&
    !!session.user &&
    typeof session.user.id === "string" &&
    typeof session.user.email === "string" &&
    Array.isArray(session.user.roles)
  );
}

function createAuthStore() {
  let session: AuthSession | null = null;
  let loadedFromStorage = false;
  const listeners = new Set<Listener>();

  function loadOnce() {
    if (loadedFromStorage || typeof window === "undefined") return;
    loadedFromStorage = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      session = isValidSession(parsed) ? parsed : null;
    } catch {
      session = null;
    }
  }

  function persist() {
    if (typeof window === "undefined") return;
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  function emit() {
    for (const listener of listeners) listener();
  }

  return {
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      loadOnce();
      return session;
    },
    getServerSnapshot() {
      return null;
    },
    getSession() {
      loadOnce();
      return session;
    },
    setSession(next: AuthSession | null) {
      loadedFromStorage = true;
      session = next;
      persist();
      emit();
    },
  };
}

export const authStore = createAuthStore();
