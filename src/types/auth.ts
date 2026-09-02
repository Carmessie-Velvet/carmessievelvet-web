export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
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
