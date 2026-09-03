const BRAND_LABELS: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
};

export function cardBrandLabel(brand: string): string {
  return BRAND_LABELS[brand] ?? brand;
}
