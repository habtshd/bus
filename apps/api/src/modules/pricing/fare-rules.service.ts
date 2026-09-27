import { Injectable } from '@nestjs/common';

@Injectable()
export class FareRulesService {
  /**
   * Calculates base segment fare based on route distance, bus luxury tier, and stop hop count.
   */
  calculateSegmentFare(
    baseTripPrice: number,
    totalRouteSegments: number,
    traversedSegmentsCount: number,
    busType: string = 'LUXURY_2X2',
  ): number {
    if (traversedSegmentsCount >= totalRouteSegments) {
      // Full route trip
      return baseTripPrice;
    }

    // Intermediate segment fare proportional to segment count with minor short-hop adjustment
    const ratio = traversedSegmentsCount / Math.max(1, totalRouteSegments);
    const rawFare = baseTripPrice * ratio;

    // Luxury bus tier multiplier (e.g. VIP seating)
    const multiplier = busType === 'VIP_1X2' ? 1.25 : 1.0;

    // Round to nearest 10 ETB
    return Math.round((rawFare * multiplier) / 10) * 10;
  }
}
