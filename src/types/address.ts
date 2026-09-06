export interface UserAddress {
  id: string;
  fullName: string;
  /** Nullable in the database for pre-existing rows; always sent on create. */
  phone?: string;
  street: string;
  extNumber: string;
  intNumber?: string;
  suburb: string;
  city: string;
  /** Full state name, derived server-side from `stateCode`. */
  state: string;
  stateCode: string;
  postalCode: string;
  country?: string;
  reference?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface AddressInput {
  fullName: string;
  phone: string;
  street: string;
  extNumber: string;
  intNumber?: string;
  suburb: string;
  city: string;
  stateCode: string;
  postalCode: string;
  country?: string;
  reference?: string;
}
