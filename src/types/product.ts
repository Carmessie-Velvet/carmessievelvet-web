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
}
