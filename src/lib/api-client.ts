import { authStore } from "./auth-store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

// `UserController` is the one controller in the API with no `/v1` prefix
// (lives at `/api/user/...` instead of `/api/v1/user/...`) — pass
// `base: USER_API_BASE_URL` to `apiFetch` for those routes.
export const USER_API_BASE_URL = API_BASE_URL.replace(/\/v1\/?$/, "");

export class ApiError extends Error {
  status: number;
  /** Seconds to wait before retrying — only set on a 429 response. */
  retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

interface ApiSuccessEnvelope<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

interface ApiErrorEnvelope {
  success: false;
  message: string | string[];
  error: string;
  statusCode: number;
  path: string;
  timestamp: string;
  /** Only present on 429 responses (rate limiting on auth routes). */
  retryAfter?: number;
}

function extractMessage(message: string | string[]): string {
  return Array.isArray(message) ? message.join(" ") : message;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Silently exchanges the stored refresh token for a new pair and updates
 * the session in place. Talks to the API directly (not via `apiFetch`) to
 * avoid recursing back into the 401-retry logic below.
 */
async function tryRefresh(refreshToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    const body = (await response.json().catch(() => null)) as
      | ApiSuccessEnvelope<RefreshResponse>
      | ApiErrorEnvelope
      | null;

    if (!response.ok || !body || body.success === false) {
      authStore.setSession(null);
      return false;
    }

    const current = authStore.getSession();
    if (!current) return false;
    authStore.setSession({ ...current, ...body.data });
    return true;
  } catch {
    return false;
  }
}

interface ApiFetchOptions extends RequestInit {
  /** Attach the stored access token as `Authorization: Bearer <token>`. */
  auth?: boolean;
  /** Internal: set on the retry after a refresh, to avoid refresh loops. */
  skipRefresh?: boolean;
  /** Override the base URL — e.g. `USER_API_BASE_URL` for `/api/user/*`. */
  base?: string;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { auth = false, skipRefresh = false, base = API_BASE_URL, headers, ...rest } =
    options;
  const session = auth ? authStore.getSession() : null;

  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(session ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor.", 0);
  }

  const body = (await response.json().catch(() => null)) as
    | ApiSuccessEnvelope<T>
    | ApiErrorEnvelope
    | null;

  if (!response.ok) {
    const errorBody = body as ApiErrorEnvelope | null;

    if (response.status === 401 && auth && !skipRefresh && session) {
      const refreshed = await tryRefresh(session.refreshToken);
      if (refreshed) {
        return apiFetch<T>(path, { ...options, skipRefresh: true });
      }
    }

    throw new ApiError(
      errorBody ? extractMessage(errorBody.message) : "Ocurrió un error inesperado.",
      errorBody?.statusCode ?? response.status,
      errorBody?.retryAfter
    );
  }

  // A successful response with no body (e.g. 204 No Content — used by
  // DELETE /me/wishlist/:sku, unlike every other DELETE in this API) has
  // nothing to unwrap.
  if (!body) return undefined as T;

  if (body.success === false) {
    throw new ApiError(extractMessage(body.message), body.statusCode, body.retryAfter);
  }

  return (body as ApiSuccessEnvelope<T>).data;
}
