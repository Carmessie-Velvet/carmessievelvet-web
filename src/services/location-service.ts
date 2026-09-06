import { apiFetch } from "@/lib/api-client";
import type { MxState } from "@/types/mx-state";

export interface PostalCodeLookupResult {
  city: string;
  stateCode: string;
  /** Full state name — display-only, `stateCode` is what's actually sent. */
  state: string;
  /** Distinct colonias for this postal code — may be more than one. */
  suburbs: string[];
}

interface ApiPostalCodeItem {
  suburb_name?: string;
  municipality?: string;
  city?: string;
  state?: string;
  state_code?: string;
}

/**
 * The API passes this endpoint's response through untouched from Enviatodo
 * (docs/API-FRONTEND.md sección 6) — so after `apiFetch` unwraps this app's
 * own `{success, message, data}` envelope, what's left is Enviatodo's *own*
 * envelope (`{success, message, data: {items}, error, code}`), not `items`
 * directly. One extra `.data` to unwrap versus every other endpoint.
 */
interface ApiPostalCodeResponse {
  data?: {
    items?: ApiPostalCodeItem[];
  };
}

/**
 * Location catalogs backing every address form (checkout + saved addresses).
 * `getMxStates()` is the state-code catalog `stateCode` must come from —
 * Enviatodo's own codes, not SEPOMEX/CFDI (they differ in 7 states), so it
 * can never be hardcoded on the frontend. `lookupPostalCode()` proxies
 * Enviatodo's postal-code autocomplete (best-effort, provider shape isn't a
 * stable contract) to prefill colonia/municipio/estado while a shopper types.
 */
export interface LocationService {
  getMxStates(): Promise<MxState[]>;
  lookupPostalCode(postalCode: string): Promise<PostalCodeLookupResult | null>;
}

export class RestLocationService implements LocationService {
  async getMxStates(): Promise<MxState[]> {
    // Public, no auth — same `/store/*` surface as the catalog.
    return apiFetch<MxState[]>("/store/mx-states");
  }

  async lookupPostalCode(postalCode: string): Promise<PostalCodeLookupResult | null> {
    try {
      const response = await apiFetch<ApiPostalCodeResponse>(
        `/store/postal-codes/${encodeURIComponent(postalCode)}`
      );
      const items = response.data?.items ?? [];
      const first = items[0];
      if (!first?.state_code) return null;
      const suburbs = Array.from(
        new Set(
          items
            .map((item) => item.suburb_name)
            .filter((suburb): suburb is string => !!suburb)
        )
      );
      return {
        city: first.municipality ?? first.city ?? "",
        stateCode: first.state_code,
        state: first.state ?? "",
        suburbs,
      };
    } catch {
      return null;
    }
  }
}

export const locationService: LocationService = new RestLocationService();
