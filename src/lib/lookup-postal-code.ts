export interface PostalCodeLookupResult {
  city: string;
  state: string;
}

interface ZippopotamPlace {
  "place name": string;
  state: string;
}

interface ZippopotamResponse {
  places?: ZippopotamPlace[];
}

/**
 * Best-effort city/state lookup for a Mexican postal code, via Zippopotam.us
 * (free, no API key). Coverage/precision is coarser than a real SEPOMEX
 * dataset (one place per CP, not every colonia) — good enough to autofill
 * city/state and catch typos, not a source of truth to validate against.
 * Returns null on any failure (offline, unknown CP, bad response) so the
 * caller can just fall back to manual entry.
 */
export async function lookupPostalCode(
  postalCode: string
): Promise<PostalCodeLookupResult | null> {
  try {
    const response = await fetch(`https://api.zippopotam.us/mx/${postalCode}`);
    if (!response.ok) return null;
    const data = (await response.json()) as ZippopotamResponse;
    const place = data.places?.[0];
    if (!place) return null;
    return { city: place["place name"], state: place.state };
  } catch {
    return null;
  }
}
