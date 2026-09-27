import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  initiatePayment(
    @Body('bookingId') bookingId: string,
    @Body('method') method?: string,
  ) {
    return this.paymentsService.initiatePayment(bookingId, method || 'TELEBIRR');
  }

  @Post('webhook')
  processWebhook(
    @Body() payload: any,
    @Headers('x-chapa-signature') chapaSig?: string,
    @Headers('x-telebirr-signature') telebirrSig?: string,
  ) {
    return this.paymentsService.processWebhook(payload, chapaSig || telebirrSig);
  }

  @Get(':id/verify')
  verifyPayment(@Param('id') paymentId: string) {
    return this.paymentsService.confirmPayment(paymentId);
  }
}
