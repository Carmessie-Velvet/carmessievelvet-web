import { apiFetch } from "@/lib/api-client";
import type { CreateOrderPayload, CreateOrderResult, Order } from "@/types/order";

export interface OrderListPage {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Contract for checkout + a logged-in user's own order history. `createOrder`
 * is reachable by guests and logged-in users alike (`@OptionalAuth()` on the
 * API) — passing `auth: true` to `apiFetch` naturally does the right thing
 * either way: it attaches the token when a session exists, and sends no
 * `Authorization` header at all otherwise.
 */
export interface OrderService {
  createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult>;
  /**
   * A handful of the shopper's most recent orders in one shot (up to 100) —
   * for the couple of spots (checkout's address prefill, the "pedidos
   * recientes" widget on `/cuenta`) that just need "some recent orders",
   * not real pagination. `getMyOrdersPage` is the paginated counterpart for
   * an actual order-history list.
   */
  getMyOrders(): Promise<Order[]>;
  getMyOrdersPage(page: number, limit: number): Promise<OrderListPage>;
  getMyOrder(id: string): Promise<Order>;
  /**
   * Guest order lookup by order number + email — the pair a guest actually
   * has, since order numbers alone are sequential/guessable (CM-001000,
   * CM-001001, ...). Backend route not shipped yet (see the API's list of
   * checkout gaps) — this is wired up ready for whenever it lands.
   */
  trackGuestOrder(orderNumber: string, email: string): Promise<Order>;
}

export class RestOrderService implements OrderService {
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
    return apiFetch<CreateOrderResult>("/orders", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    });
  }

  async getMyOrders(): Promise<Order[]> {
    const page = await apiFetch<OrderListPage>("/me/orders?limit=100", {
      auth: true,
    });
    return page.items;
  }

  async getMyOrdersPage(page: number, limit: number): Promise<OrderListPage> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return apiFetch<OrderListPage>(`/me/orders?${params.toString()}`, {
      auth: true,
    });
  }

  async getMyOrder(id: string): Promise<Order> {
    return apiFetch<Order>(`/me/orders/${encodeURIComponent(id)}`, {
      auth: true,
    });
  }

  async trackGuestOrder(orderNumber: string, email: string): Promise<Order> {
    const params = new URLSearchParams({ orderNumber, email });
    return apiFetch<Order>(`/store/orders/track?${params.toString()}`);
  }
}

export const orderService: OrderService = new RestOrderService();
