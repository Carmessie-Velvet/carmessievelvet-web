export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface ShippingAddress {
  fullName: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  productSku: string;
  productImage: string;
  size: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  unitFinalPrice: number;
  lineTotal: number;
  /** Snapshot: whether the product was made-to-order at purchase time. */
  madeToOrder: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  email: string;
  shippingAddress: ShippingAddress;
  currency: string;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  total: number;
  /** Code of the chosen shipping method (see `ShippingService`). */
  shippingMethod: string;
  /** Snapshot of the method's description at purchase time — may be absent. */
  shippingMethodDescription?: string;
  couponCode?: string;
  items: OrderItem[];
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderResult extends Order {
  clientSecret: string;
  publishableKey: string;
  /**
   * Where Stripe should send the shopper back after a redirect-based payment.
   * Comes from the backend's own env var, so it can legitimately arrive as
   * `""` when that isn't configured — callers must fall back rather than hand
   * Stripe an empty `return_url`.
   */
  returnUrl: string;
}

export interface OrderItemInput {
  productId: string;
  size: string;
  quantity: number;
}

export interface CreateOrderPayload {
  guestEmail?: string;
  items: OrderItemInput[];
  shippingAddress: ShippingAddress;
  /**
   * Required by `POST /orders` — a `code` from the live shipping-methods
   * catalog (never a hardcoded "STANDARD"/"EXPRESS"): the admin can add,
   * reprice or retire options at any time. Omitting it is a 400.
   */
  shippingMethod: string;
  couponCode?: string;
  savePaymentMethod?: boolean;
  notes?: string;
}
