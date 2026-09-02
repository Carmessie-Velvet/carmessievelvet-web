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
  couponCode?: string;
  savePaymentMethod?: boolean;
  notes?: string;
}
