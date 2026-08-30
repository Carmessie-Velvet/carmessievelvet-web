import type { Category, Product } from "@/types/product";
import { categories } from "@/mocks/categories";
import { products } from "@/mocks/products";
import { delay } from "@/lib/delay";

export interface ProductListOptions {
  categorySlug?: string;
}

/**
 * Contract for reading catalog data. `MockProductService` is the only
 * implementation today; a future `RestProductService` implementing the same
 * interface can replace it at the point where `productService` is exported
 * below, without any UI code changing.
 */
export interface ProductService {
  getAll(options?: ProductListOptions): Promise<Product[]>;
  getNewArrivals(limit?: number): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  getCategories(): Promise<Category[]>;
}

const NETWORK_DELAY_MS = 150;

export class MockProductService implements ProductService {
  async getAll(options: ProductListOptions = {}): Promise<Product[]> {
    await delay(NETWORK_DELAY_MS);
    if (!options.categorySlug) return [...products];
    return products.filter((p) => p.category.slug === options.categorySlug);
  }

  async getNewArrivals(limit = 4): Promise<Product[]> {
    await delay(NETWORK_DELAY_MS);
    return products.filter((p) => p.isNew).slice(0, limit);
  }

  async getBySlug(slug: string): Promise<Product | null> {
    await delay(NETWORK_DELAY_MS);
    return products.find((p) => p.slug === slug) ?? null;
  }

  async getCategories(): Promise<Category[]> {
    await delay(NETWORK_DELAY_MS);
    return [...categories];
  }
}

export const productService: ProductService = new MockProductService();
