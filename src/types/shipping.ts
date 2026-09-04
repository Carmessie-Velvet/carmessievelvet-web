export interface ShippingMethod {
  id: string;
  /** The value `POST /orders` expects in its `shippingMethod` field. */
  code: string;
  /** Decimal MXN (the API sends cents; the service converts). */
  price: number;
  description?: string;
}
