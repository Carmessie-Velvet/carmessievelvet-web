export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface ShippingAddress {
  fullName: string;
  /** Required by the API — needed to generate automated shipping guides. */
  phone: string;
  /** Street name only, no number (e.g. "Av. Reforma"). */
  street: string;
  extNumber: string;
  intNumber?: string;
  /** Colonia. */
  suburb: string;
  city: string;
  /**
   * Enviatodo's own state code (not SEPOMEX/CFDI — they differ in 7 states),
   * from `GET /store/mx-states`. This is what the client sends.
   */
  stateCode: string;
  /**
   * Full state name — response-only, always derived server-side from
   * `stateCode`. Sending it on a request 400s.
   */
  state?: string;
  postalCode: string;
  country?: string;
  /** Free-text landmark / entre calles. */
  reference?: string;
}

/** A purchased piece of a SET line — snapshot at purchase time, per component. */
export interface OrderItemSelection {
  id: string;
  componentName: string;
  position: number;
  size: string;
  color?: string;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  productSku: string;
  productImage: string;
  /** `null` for a SET line — see `selections` instead. */
  size: string | null;
  /** One entry per component, only for a SET line — empty for a SIMPLE line. */
  selections: OrderItemSelection[];
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  unitFinalPrice: number;
  lineTotal: number;
  /** Snapshot: whether the product was made-to-order at purchase time. */
  madeToOrder: boolean;
}

export type ReturnRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type RefundMode = "FULL" | "FULL_MINUS_SHIPPING" | "PARTIAL";

export interface ReturnRequest {
  id: string;
  status: ReturnRequestStatus;
  reason: string;
  createdAt: string;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
  refundMode?: RefundMode | null;
  refundedAmount?: number | null;
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
  /** Snapshot of the carrier name (e.g. "Estafeta") — may be absent on older orders. */
  carrier?: string;
  couponCode?: string;
  items: OrderItem[];
  notes?: string;
  trackingNumber?: string;
  /**
   * The most recent post-delivery return/refund request, if the buyer ever
   * submitted one — only present on single-order reads (`GET /orders/:id`,
   * `GET /me/orders/:id`, guest tracking), never on the paginated list.
   */
  returnRequest?: ReturnRequest | null;
  /**
   * Total refunded so far, in pesos — `0` until an admin refunds the order
   * (via `/cancel`, whether or not a return request was ever involved).
   * Can be less than `total` when `status` is `PARTIALLY_REFUNDED`.
   */
  refundedAmount: number;
  /** Why an admin cancelled/refunded this order — set together with the refund, not before. */
  cancellationReason?: string | null;
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

export interface OrderItemSelectionInput {
  componentId: string;
  size: string;
  color?: string;
}

export interface OrderItemInput {
  productId: string;
  /** SIMPLE product — mutually exclusive with `selections`. */
  size?: string;
  /** SET product — exactly one entry per component. */
  selections?: OrderItemSelectionInput[];
  quantity: number;
}

export interface CreateOrderPayload {
  guestEmail?: string;
  items: OrderItemInput[];
  /**
   * Send exactly one of `shippingAddress` / `shippingAddressId`, never both
   * or neither (the API 400s otherwise). Guests can only use the inline
   * form; a logged-in `USER` may instead reuse a saved address by id (see
   * `AddressService`) — a logged-in shopper sending an inline address gets
   * it auto-saved to their account server-side, no separate flag needed.
   */
  shippingAddress?: ShippingAddress;
  shippingAddressId?: string;
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
