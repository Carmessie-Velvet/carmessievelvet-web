export type Size = "XS" | "S" | "M" | "L";

/**
 * Decides the shape of every product in a category — never infer this from
 * `category.name`. `SIMPLE`: one product, its own size/color (`variants`).
 * `SET`: the product is 2+ pieces ("prendas", `components`), each with its
 * own size/color — `variants` is empty and meaningless for a set.
 */
export type CategoryType = "SIMPLE" | "SET";

export interface ProductVariant {
  size: Size;
  inStock: boolean;
}

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Category {
  slug: string;
  name: string;
  type: CategoryType;
}

export interface ProductComponentOption {
  size: Size;
  color?: string;
  available: boolean;
}

/** One piece ("prenda") of a `category.type: "SET"` product, e.g. "Top"/"Panty". */
export interface ProductComponent {
  id: string;
  name: string;
  position: number;
  colors: string[];
  options: ProductComponentOption[];
  inStock: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: "MXN";
  category: Category;
  images: ProductImage[];
  /** A product has at most one video — `null` if none has been uploaded (no placeholder). */
  videoUrl: string | null;
  variants: ProductVariant[];
  /** Only populated for `category.type === "SET"` — empty for a SIMPLE product. */
  components: ProductComponent[];
  isNew: boolean;
  /**
   * Made-to-order: the piece carries no inventory and stays buyable
   * indefinitely — a size only stops being sellable when the admin marks it
   * sold out. `variants[].inStock` already accounts for this, so this flag is
   * only for messaging (elaboration time), never for availability logic.
   */
  madeToOrder: boolean;
}
