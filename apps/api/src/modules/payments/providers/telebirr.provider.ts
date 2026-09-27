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
export class TelebirrProvider implements PaymentProvider {
  readonly providerName = 'TELEBIRR';

  async initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
    const paymentRef = `TB-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const checkoutUrl = `https://app.telebirr.et/pay?ref=${paymentRef}&amount=${request.amount}`;

    return {
      paymentId: `pay_${Date.now()}`,
      paymentReference: paymentRef,
      status: 'PENDING',
      checkoutUrl,
      providerTxId: `ET-TB-${Date.now()}`,
      message: 'Telebirr USSD push / App payment initiated',
    };
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    return {
      valid: true,
      status: 'SUCCESS',
      transactionId: `TB-VERIFIED-${reference}`,
      amount: 850.0,
      currency: 'ETB',
    };
  }

  async refundPayment(request: RefundRequest): Promise<RefundResult> {
    return {
      success: true,
      refundReference: `RF-TB-${Date.now()}`,
      amount: request.amount,
      status: 'REFUNDED',
    };
  }
}
