import { apiFetch } from "@/lib/api-client";
import type { CreateOrderPayload, CreateOrderResult, Order } from "@/types/order";

interface ApiPaginated<T> {
  items: T[];
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
  getMyOrders(): Promise<Order[]>;
  getMyOrder(id: string): Promise<Order>;
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
    const page = await apiFetch<ApiPaginated<Order>>("/me/orders?limit=100", {
      auth: true,
    });
    return page.items;
  }

  async getMyOrder(id: string): Promise<Order> {
    return apiFetch<Order>(`/me/orders/${encodeURIComponent(id)}`, {
      auth: true,
    });
  }
}

export const orderService: OrderService = new RestOrderService();
