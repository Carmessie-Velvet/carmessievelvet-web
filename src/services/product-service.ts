import type { Category, CategoryType, Product, ProductComponent, ProductImage, Size } from "@/types/product";
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

export interface ProductPageOptions extends ProductListOptions {
  page?: number;
  limit?: number;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Contract for reading catalog data. `RestProductService` talks to the real
 * `carmessievelvet-api` storefront endpoints (`/store/*`, public, no auth).
 */
export interface CouponPreviewLine {
  productId: string;
  /** Omit for a `category.type: "SET"` line — size never enters this calc. */
  size?: Size;
  quantity: number;
}

export interface ProductService {
  getAll(options?: ProductListOptions): Promise<Product[]>;
  getPage(options?: ProductPageOptions): Promise<ProductPage>;
  getNewArrivals(limit?: number): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  getCategories(): Promise<Category[]>;
  validateCoupon(code: string, items?: CouponPreviewLine[]): Promise<CouponPreview>;
}

const ALL_SIZES: Size[] = ["XS", "S", "M", "L"];

// The API has no category slug — only `id` + `name`, and its seeded names
// are singular ("Corset"). Override display + slug for the two known
// categories so nav/URLs stay exactly what they were on mock data; any
// future category falls back to a plain lowercase-dashed slug. `type` is
// never part of this override — it always comes straight from the API (see
// mapCategory), since a category's shape is never something the frontend
// gets to decide.
const CATEGORY_OVERRIDES: Record<string, { slug: string; name: string }> = {
  corset: { slug: "corsets", name: "Corsets" },
  sets: { slug: "sets", name: "Sets" },
};

interface ApiCategory {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  type: CategoryType;
}

interface ApiProductComponentOption {
  size: Size;
  color?: string;
  available: boolean;
}

interface ApiProductComponent {
  id: string;
  name: string;
  position: number;
  colors: string[];
  options: ApiProductComponentOption[];
  inStock: boolean;
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
  /** No placeholder (unlike `images`) — `null` until an admin uploads one. */
  videoUrl: string | null;
  availableSizes: Size[];
  inStock: boolean;
  madeToOrder: boolean;
  /** Empty for `category.type: "SIMPLE"` — populated only for a "SET" product. */
  components: ApiProductComponent[];
}

interface ApiPaginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function mapCategory(api: ApiCategory | undefined): Category {
  // POST /me/wishlist's embedded product is missing `category` entirely (see
  // ApiStoreProduct.category above) — default to SIMPLE, since there's no
  // type to read and every product wishlisted through that gap predates SET.
  if (!api) return { slug: "", name: "", type: "SIMPLE" };
  const key = api.name.trim().toLowerCase();
  const override = CATEGORY_OVERRIDES[key];
  return {
    slug: override?.slug ?? key.replace(/\s+/g, "-"),
    name: override?.name ?? api.name,
    type: api.type,
  };
}

function mapImages(urls: string[], productName: string): ProductImage[] {
  return urls.map((src) => ({ src, alt: productName }));
}

function mapComponents(components: ApiProductComponent[] | undefined): ProductComponent[] {
  return (components ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    position: c.position,
    colors: c.colors,
    options: c.options,
    inStock: c.inStock,
  }));
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
    videoUrl: api.videoUrl ?? null,
    variants: ALL_SIZES.map((size) => ({
      size,
      inStock: api.availableSizes.includes(size),
    })),
    components: mapComponents(api.components),
    isNew,
    // Defensive `?? false` for the same reason `category` is optional above:
    // POST /me/wishlist's embedded product isn't a faithful StoreProductDto.
    madeToOrder: api.madeToOrder ?? false,
  };
}

export class RestProductService implements ProductService {
  // Shared by `getAll` (which just wants every match, in one big page) and
  // `getPage` (the real, user-facing pagination) — same filters, same
  // category-slug-to-id resolution, only the page/limit sent to the API
  // differs.
  private async fetchPage(options: ProductPageOptions): Promise<ProductPage> {
    const limit = options.limit ?? 20;
    let categoryId: string | undefined;
    if (options.categorySlug) {
      const rawCategories = await apiFetch<ApiCategory[]>("/store/categories");
      categoryId = rawCategories.find(
        (c) => mapCategory(c).slug === options.categorySlug
      )?.id;
      if (!categoryId) {
        return { items: [], total: 0, page: options.page ?? 1, limit, totalPages: 0 };
      }
    }

    const params = new URLSearchParams({ limit: String(limit) });
    if (options.page) params.set("page", String(options.page));
    if (categoryId) params.set("categoryId", categoryId);
    if (options.search) params.set("search", options.search);
    if (options.size) params.set("size", options.size);
    if (options.minPrice !== undefined) params.set("minPrice", String(options.minPrice));
    if (options.maxPrice !== undefined) params.set("maxPrice", String(options.maxPrice));
    if (options.inStock !== undefined) params.set("inStock", String(options.inStock));
    if (options.sortBy) params.set("sortBy", options.sortBy);
    if (options.sortOrder) params.set("sortOrder", options.sortOrder);

    const result = await apiFetch<ApiPaginated<ApiStoreProduct>>(
      `/store/products?${params.toString()}`
    );
    return {
      items: result.items.map((item) => mapProduct(item)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getAll(options: ProductListOptions = {}): Promise<Product[]> {
    const page = await this.fetchPage({ ...options, limit: 100 });
    return page.items;
  }

  async getPage(options: ProductPageOptions = {}): Promise<ProductPage> {
    return this.fetchPage(options);
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
