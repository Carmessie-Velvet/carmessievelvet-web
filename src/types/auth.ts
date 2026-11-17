export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  /**
   * Whether the account's email has been verified. `false` right after signup:
   * the session works, but the API refuses to create an order (403
   * `EMAIL_NOT_VERIFIED`) until the link in the verification email is opened.
   * Optional because a session stored before the API sent it has no value —
   * `undefined` means "not known yet" (it gets filled from `GET /auth/me`), and
   * the UI only treats an explicit `false` as unverified.
   */
  emailVerified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession extends AuthTokens {
  user: AuthUser;
}

export interface SignupPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
