import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TelebirrProvider } from './providers/telebirr.provider';
import { ChapaProvider } from './providers/chapa.provider';
import { CashProvider } from './providers/cash.provider';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, TelebirrProvider, ChapaProvider, CashProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
