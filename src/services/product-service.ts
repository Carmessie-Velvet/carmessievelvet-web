import type { Category, Product, ProductImage, Size } from "@/types/product";
import type { CouponPreview } from "@/types/coupon";
import { apiFetch, ApiError } from "@/lib/api-client";

export type ProductSortBy = "createdAt" | "name" | "price" | "discount";

export interface ProductListOptions {
  categorySlug?: string;
  search?: string;
  size?: Size;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: ProductSortBy;
  sortOrder?: "ASC" | "DESC";
}

/**
 * Contract for reading catalog data. `RestProductService` talks to the real
 * `carmessievelvet-api` storefront endpoints (`/store/*`, public, no auth).
 */
export interface CouponPreviewLine {
  productId: string;
  size: Size;
  quantity: number;
}

export interface ProductService {
  getAll(options?: ProductListOptions): Promise<Product[]>;
  getNewArrivals(limit?: number): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  getCategories(): Promise<Category[]>;
  validateCoupon(code: string, items?: CouponPreviewLine[]): Promise<CouponPreview>;
}

const ALL_SIZES: Size[] = ["XS", "S", "M", "L"];

// The API has no category slug — only `id` + `name`, and its seeded names
// are singular ("Corset"). Override display + slug for the two known
// categories so nav/URLs stay exactly what they were on mock data; any
// future category falls back to a plain lowercase-dashed slug.
const CATEGORY_OVERRIDES: Record<string, Category> = {
  corset: { slug: "corsets", name: "Corsets" },
  sets: { slug: "sets", name: "Sets" },
};

interface ApiCategory {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

interface ApiTag {
  id: string;
  name: string;
}

interface ApiAppliedDiscount {
  id: string;
  name?: string;
  percentage: number;
  endsAt?: string;
}

export interface ApiStoreProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  color?: string;
  finalPrice: number;
  appliedDiscount?: ApiAppliedDiscount;
  // Optional because it's genuinely missing on POST /me/wishlist's response
  // (unlike everywhere else this shape appears) — a real API inconsistency,
  // not a typing nicety. See mapCategory().
  category?: ApiCategory;
  tags: ApiTag[];
  images: string[];
  availableSizes: Size[];
  inStock: boolean;
}

interface ApiPaginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function mapCategory(api: ApiCategory | undefined): Category {
  if (!api) return { slug: "", name: "" };
  const key = api.name.trim().toLowerCase();
  return CATEGORY_OVERRIDES[key] ?? { slug: key.replace(/\s+/g, "-"), name: api.name };
}

function mapImages(urls: string[], productName: string): ProductImage[] {
  return urls.map((src) => ({ src, alt: productName }));
}

// The product's SKU (e.g. "SET-015") doubles as its URL slug — lowercased
// it's already a valid, human-readable, unique path segment, and the API
// looks products back up by SKU case-insensitively.
export function mapProduct(api: ApiStoreProduct, isNew = false): Product {
  return {
    id: api.id,
    slug: api.sku.toLowerCase(),
    name: api.name,
    description: api.description,
    price: api.finalPrice,
    compareAtPrice: api.appliedDiscount ? api.price : undefined,
    currency: "MXN",
    category: mapCategory(api.category),
    images: mapImages(api.images, api.name),
    variants: ALL_SIZES.map((size) => ({
      size,
      inStock: api.availableSizes.includes(size),
    })),
    isNew,
  };
}

export class RestProductService implements ProductService {
  async getAll(options: ProductListOptions = {}): Promise<Product[]> {
    let categoryId: string | undefined;
    if (options.categorySlug) {
      const rawCategories = await apiFetch<ApiCategory[]>("/store/categories");
      categoryId = rawCategories.find(
        (c) => mapCategory(c).slug === options.categorySlug
      )?.id;
      if (!categoryId) return [];
    }

    const params = new URLSearchParams({ limit: "100" });
    if (categoryId) params.set("categoryId", categoryId);
    if (options.search) params.set("search", options.search);
    if (options.size) params.set("size", options.size);
    if (options.minPrice !== undefined) params.set("minPrice", String(options.minPrice));
    if (options.maxPrice !== undefined) params.set("maxPrice", String(options.maxPrice));
    if (options.inStock !== undefined) params.set("inStock", String(options.inStock));
    if (options.sortBy) params.set("sortBy", options.sortBy);
    if (options.sortOrder) params.set("sortOrder", options.sortOrder);

    const page = await apiFetch<ApiPaginated<ApiStoreProduct>>(
      `/store/products?${params.toString()}`
    );
    return page.items.map((item) => mapProduct(item));
  }

  async getNewArrivals(limit = 4): Promise<Product[]> {
    const params = new URLSearchParams({
      limit: String(limit),
      sortBy: "createdAt",
      sortOrder: "DESC",
    });
    const page = await apiFetch<ApiPaginated<ApiStoreProduct>>(
      `/store/products?${params.toString()}`
    );
    return page.items.map((item) => mapProduct(item, true));
  }

  async getBySlug(slug: string): Promise<Product | null> {
    try {
      const item = await apiFetch<ApiStoreProduct>(
        `/store/products/${encodeURIComponent(slug.toUpperCase())}`
      );
      return mapProduct(item);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }

  async getCategories(): Promise<Category[]> {
    const rawCategories = await apiFetch<ApiCategory[]>("/store/categories");
    return rawCategories.map(mapCategory);
  }

  async validateCoupon(code: string, items?: CouponPreviewLine[]): Promise<CouponPreview> {
    return apiFetch<CouponPreview>("/store/coupons/validate", {
      method: "POST",
      body: JSON.stringify(items && items.length > 0 ? { code, items } : { code }),
    });
  }
}

export const productService: ProductService = new RestProductService();
