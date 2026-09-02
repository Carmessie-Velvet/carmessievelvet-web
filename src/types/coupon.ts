export type CouponInvalidReason =
  | "NOT_FOUND"
  | "DISABLED"
  | "NOT_STARTED"
  | "EXPIRED"
  | "USAGE_LIMIT_REACHED"
  | "BELOW_MINIMUM_AMOUNT";

export interface CouponPreviewValid {
  valid: true;
  message: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  currency?: string;
  subtotal?: number;
  discountAmount?: number;
  total?: number;
}

export interface CouponPreviewInvalid {
  valid: false;
  reason: CouponInvalidReason;
  message: string;
  code: string;
}

export type CouponPreview = CouponPreviewValid | CouponPreviewInvalid;
