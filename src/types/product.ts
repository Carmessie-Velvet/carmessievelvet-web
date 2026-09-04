export type Size = "XS" | "S" | "M" | "L";

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
  variants: ProductVariant[];
  isNew: boolean;
  /**
   * Made-to-order: the piece carries no inventory and stays buyable
   * indefinitely — a size only stops being sellable when the admin marks it
   * sold out. `variants[].inStock` already accounts for this, so this flag is
   * only for messaging (elaboration time), never for availability logic.
   */
  madeToOrder: boolean;
}
