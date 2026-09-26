/** Booking enum */

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

/** Coupon enum */
export enum CouponType {
  FIXED = 'FIXED',
  PERCENT = 'PERCENT',
}

export enum CouponStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  DISABLED = 'DISABLED',
}

/** Payment enum */

export enum PaymentMethod {
  CARD = 'CARD',
  KAKAOPAY = 'KAKAOPAY',
  TOSSPAY = 'TOSSPAY',
  PAYPAL = 'PAYPAL',
  NAVERPAY = 'NAVERPAY',
  APPLEPAY = 'APPLEPAY',
  GOOGLEPAY = 'GOOGLEPAY',
  ALIPAY = 'ALIPAY',
  WECHATPAY = 'WECHATPAY',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}
/** Traveller enum */


export enum TravelerGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

