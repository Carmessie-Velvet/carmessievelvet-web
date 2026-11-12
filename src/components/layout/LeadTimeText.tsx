import { formatLeadTime, getLeadTime } from "@/lib/lead-time";

// The current made-to-order lead time as inline text ("3 a 4 semanas", or the
// campaign's figure and why). A component — not a string computed where the
// copy is declared — so a module-level constant like the FAQ's `faqs` array
// still picks the figure up each time the page renders, instead of freezing
// whatever was true when the server started.
export function LeadTimeText() {
  return <>{formatLeadTime(getLeadTime())}</>;
}
