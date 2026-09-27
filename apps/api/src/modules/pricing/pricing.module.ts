import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { FareRulesService } from './fare-rules.service';
import { DiscountService } from './discount.service';

@Module({
  providers: [PricingService, FareRulesService, DiscountService],
  exports: [PricingService, FareRulesService, DiscountService],
})
export class PricingModule {}
