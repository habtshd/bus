import { Injectable } from '@nestjs/common';
import { FareRulesService } from './fare-rules.service';
import { DiscountService } from './discount.service';

export interface PricingResult {
  subtotal: number;
  discount: number;
  fees: number;
  total: number;
  seatPrices: Record<string, number>;
}

@Injectable()
export class PricingService {
  constructor(
    private readonly fareRulesService: FareRulesService,
    private readonly discountService: DiscountService,
  ) {}

  calculatePricing(params: {
    baseTripPrice: number;
    totalRouteSegments: number;
    traversedSegmentsCount: number;
    passengersCount: number;
    seatIds: string[];
    busType?: string;
    promoCode?: string;
  }): PricingResult {
    const singleSeatFare = this.fareRulesService.calculateSegmentFare(
      params.baseTripPrice,
      params.totalRouteSegments,
      params.traversedSegmentsCount,
      params.busType,
    );

    const subtotal = singleSeatFare * params.passengersCount;
    const discount = this.discountService.calculateDiscount(
      params.passengersCount,
      subtotal,
      params.promoCode,
    );
    const fees = 0; // Transparent zero hidden fees for Abyssinia Bus passengers
    const total = Math.max(0, subtotal - discount + fees);

    const seatPrices: Record<string, number> = {};
    for (const seatId of params.seatIds) {
      seatPrices[seatId] = singleSeatFare;
    }

    return {
      subtotal,
      discount,
      fees,
      total,
      seatPrices,
    };
  }
}
