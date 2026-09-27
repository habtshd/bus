import { Injectable } from '@nestjs/common';

@Injectable()
export class DiscountService {
  /**
   * Calculates applicable promotions or volume discounts (e.g. 3+ passengers or return journey promo)
   */
  calculateDiscount(passengerCount: number, subtotal: number, promoCode?: string): number {
    let discount = 0;

    // Promo code validation (e.g. "ABYSSINIA2026" gives 50 ETB off)
    if (promoCode && promoCode.toUpperCase().trim() === 'ABYSSINIA2026') {
      discount += 50.0;
    }

    // Family / Group booking discount (5% off for 4+ passengers)
    if (passengerCount >= 4) {
      discount += subtotal * 0.05;
    }

    return Math.min(discount, subtotal * 0.5); // Cap discount at 50%
  }
}
