import type { Product, ProductVariant, Size } from "@/types/product";
import { categories } from "./categories";

const ALL_SIZES: Size[] = ["XS", "S", "M", "L"];

function variants(outOfStock: Size[] = []): ProductVariant[] {
  return ALL_SIZES.map((size) => ({
    size,
    inStock: !outOfStock.includes(size),
  }));
}

function images(file: string, alt: string) {
  return [{ src: `/products/${file}.jpeg`, alt }];
}

const category = (slug: string) => categories.find((c) => c.slug === slug)!;

export const products: Product[] = [
  {
    id: "p1",
    slug: "corset-aurora-champagne",
    name: "Corset Aurora Champagne",
    description:
      "Corset satinado en tono champagne con copas estructuradas y ribete de encaje negro. Cierre trasero, varillas removibles.",
    price: 890,
    currency: "MXN",
    category: category("corsets"),
    images: images("corset-champagne-lace", "Corset Aurora Champagne"),
    variants: variants(["XS"]),
    isNew: true,
  },
  {
    id: "p2",
    slug: "corset-bruma-floral",
    name: "Corset Bruma Floral",
    description:
      "Corset en satín taupe con tirantes finos rematados en flores de tela. Silueta entallada con costuras a la vista.",
    price: 950,
    currency: "MXN",
    category: category("corsets"),
    images: images("corset-taupe-floral", "Corset Bruma Floral"),
    variants: variants(),
    isNew: false,
  },
  {
    id: "p3",
    slug: "corset-ambar-satinado",
    name: "Corset Ámbar Satinado",
    description:
      "Corset satinado color ámbar con copas de encaje negro y tirantes finos ajustables. Acabado brillante, forro completo.",
    price: 890,
    currency: "MXN",
    category: category("corsets"),
    images: images("corset-gold", "Corset Ámbar Satinado"),
    variants: variants(["L"]),
    isNew: true,
  },
  {
    id: "p4",
    slug: "corset-vino-trenzado",
    name: "Corset Vino Trenzado",
    description:
      "Corset en vino profundo con tirantes trenzados anudados. Copas estructuradas y espalda con cierre invisible.",
    price: 850,
    currency: "MXN",
    category: category("corsets"),
    images: images("corset-vino-twist", "Corset Vino Trenzado"),
    variants: variants(),
    isNew: false,
  },
  {
    id: "p5",
    slug: "corset-vino-escote-cuadrado",
    name: "Corset Vino Escote Cuadrado",
    description:
      "Corset satinado con escote cuadrado y costuras radiales al frente. Tacto sedoso, silueta que marca la cintura.",
    price: 820,
    compareAtPrice: 990,
    currency: "MXN",
    category: category("corsets"),
    images: images("corset-vino-satin", "Corset Vino Escote Cuadrado"),
    variants: variants(["XS", "L"]),
    isNew: false,
  },
  {
    id: "p6",
    slug: "corset-alado-brocado",
    name: "Corset Alado Brocado",
    description:
      "Corset strapless en brocado con estampado de aves doradas sobre fondo oscuro. Pieza statement, varillas internas.",
    price: 990,
    currency: "MXN",
    category: category("corsets"),
    images: images("corset-brocade", "Corset Alado Brocado"),
    variants: variants(),
    isNew: true,
  },
  {
    id: "p7",
    slug: "corset-bruma-tul",
    name: "Corset Bruma Tul",
    description:
      "Corset taupe con moños de tul negro en los tirantes. Contraste suave entre el satín y la transparencia del tul.",
    price: 940,
    currency: "MXN",
    category: category("corsets"),
    images: images("corset-taupe-tulle", "Corset Bruma Tul"),
    variants: variants(),
    isNew: false,
  },
  {
    id: "p8",
    slug: "corset-jardin-amarillo",
    name: "Corset Jardín Amarillo",
    description:
      "Corset en satín amarillo con estampado floral y tirantes finos. Copas moldeadas, cierre lateral.",
    price: 870,
    currency: "MXN",
    category: category("corsets"),
    images: images("corset-yellow-floral", "Corset Jardín Amarillo"),
    variants: variants(["XS"]),
    isNew: false,
  },
  {
    id: "p9",
    slug: "corset-vino-manga-corta",
    name: "Corset Vino Manga Corta",
    description:
      "Corset vino con manga corta y abertura triangular en el escote. Costuras estructuradas, tacto satinado.",
    price: 910,
    currency: "MXN",
    category: category("corsets"),
    images: images("corset-vino-cutout", "Corset Vino Manga Corta"),
    variants: variants(),
    isNew: false,
  },
  {
    id: "p10",
    slug: "corset-cacao-cruzado",
    name: "Corset Cacao Cruzado",
    description:
      "Corset halter en tono cacao con espalda descubierta y silueta envolvente. Minimalista, versátil de día o de noche.",
    price: 830,
    currency: "MXN",
    category: category("corsets"),
    images: images("corset-chocolate", "Corset Cacao Cruzado"),
    variants: variants(["L"]),
    isNew: false,
  },
  {
    id: "p11",
    slug: "corset-blanco-lazo",
    name: "Corset Blanco Lazo Azul",
    description:
      "Corset en estampado floral sobre blanco con lazo azul al frente y ribete de encaje. Romántico, forro interior suave.",
    price: 880,
    currency: "MXN",
    category: category("corsets"),
    images: images("corset-white-floral", "Corset Blanco Lazo Azul"),
    variants: variants(),
    isNew: true,
  },
  {
    id: "p12",
    slug: "set-principe-de-gales",
    name: "Set Príncipe de Gales",
    description:
      "Set de dos piezas: corset con tirantes anudados y pantalón ancho, ambos en estampado príncipe de Gales. Se usan juntos o por separado.",
    price: 1690,
    currency: "MXN",
    category: category("sets"),
    images: images("set-houndstooth", "Set Príncipe de Gales"),
    variants: variants(["XS"]),
    isNew: true,
  },
  {
    id: "p13",
    slug: "set-piel-nocturna",
    name: "Set Piel Nocturna",
    description:
      "Set en terciopelo negro con ribetes de pelo sintético: corset entallado con mangas largas y mini falda a juego.",
    price: 1790,
    currency: "MXN",
    category: category("sets"),
    images: images("set-black-fur", "Set Piel Nocturna"),
    variants: variants(),
    isNew: true,
  },
  {
    id: "p14",
    slug: "set-girasol",
    name: "Set Girasol",
    description:
      "Set en satín amarillo: corset estructurado y falda con volante escalonado. Silueta favorecedora, ideal para eventos.",
    price: 1590,
    currency: "MXN",
    category: category("sets"),
    images: images("set-yellow-skirt", "Set Girasol"),
    variants: variants(["L"]),
    isNew: false,
  },
  {
    id: "p15",
    slug: "set-medianoche-azul",
    name: "Set Medianoche Azul",
    description:
      "Set en azul marino: corset con tirantes anudados y pantalón de pierna ancha con lazo en la cintura.",
    price: 1690,
    currency: "MXN",
    category: category("sets"),
    images: images("set-navy-pants", "Set Medianoche Azul"),
    variants: variants(),
    isNew: false,
  },
  {
    id: "p16",
    slug: "set-salvia",
    name: "Set Salvia",
    description:
      "Set en verde salvia: corset strapless y pantalón plisado de pierna ancha. Combinación elegante y fresca.",
    price: 1650,
    currency: "MXN",
    category: category("sets"),
    images: images("set-sage-pants", "Set Salvia"),
    variants: variants(["XS", "L"]),
    isNew: false,
  },
];
