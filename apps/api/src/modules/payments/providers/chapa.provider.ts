import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentVerification,
  RefundRequest,
  RefundResult,
} from '../payment-provider.interface';

@Injectable()
export class ChapaProvider implements PaymentProvider {
  readonly providerName = 'CHAPA';

  async initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
    const paymentRef = `CHP-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const checkoutUrl = `https://checkout.chapa.co/checkout/web/payment/${paymentRef}`;

    return {
      paymentId: `pay_${Date.now()}`,
      paymentReference: paymentRef,
      status: 'PENDING',
      checkoutUrl,
      providerTxId: `CHAPA-TX-${Date.now()}`,
      message: 'Chapa checkout hosted page ready',
    };
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    return {
      valid: true,
      status: 'SUCCESS',
      transactionId: `CHAPA-VERIFIED-${reference}`,
      amount: 850.0,
      currency: 'ETB',
    };
  }

  async refundPayment(request: RefundRequest): Promise<RefundResult> {
    return {
      success: true,
      refundReference: `RF-CHP-${Date.now()}`,
      amount: request.amount,
      status: 'REFUNDED',
    };
  }
}
