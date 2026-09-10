// Shipping method codes come from an admin-editable catalog, so there's no
// fixed set to map to hand-written labels — just make whatever code exists
// readable ("STANDARD" → "Standard", "PICKUP_CDMX" → "Pickup cdmx"). The
// human-readable detail lives in the method's own `description`.
export function formatShippingMethodCode(code: string): string {
  const words = code.replace(/[_-]+/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
