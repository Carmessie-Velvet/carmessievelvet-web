import { apiFetch } from "@/lib/api-client";
import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  SignupPayload,
} from "@/types/auth";

/**
 * Contract for account authentication. `RestAuthService` talks to the real
 * `carmessievelvet-api` backend directly — unlike the catalog services,
 * there's no mock here: auth only makes sense against a real user database.
 */
export interface AuthService {
  signup(payload: SignupPayload): Promise<AuthSession>;
  login(payload: LoginPayload): Promise<AuthSession>;
  me(): Promise<AuthUser>;
  logout(): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  resendVerification(email: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<AuthSession>;
}

export class RestAuthService implements AuthService {
  async signup(payload: SignupPayload): Promise<AuthSession> {
    return apiFetch<AuthSession>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async login(payload: LoginPayload): Promise<AuthSession> {
    return apiFetch<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async me(): Promise<AuthUser> {
    return apiFetch<AuthUser>("/auth/me", { auth: true });
  }

  async logout(): Promise<void> {
    await apiFetch<boolean>("/auth/logout", { method: "POST", auth: true });
  }

  async verifyEmail(token: string): Promise<void> {
    await apiFetch<boolean>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async resendVerification(email: string): Promise<void> {
    await apiFetch<boolean>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async forgotPassword(email: string): Promise<void> {
    await apiFetch<boolean>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<AuthSession> {
    return apiFetch<AuthSession>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  }
}

export const authService: AuthService = new RestAuthService();
