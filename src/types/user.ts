export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}
