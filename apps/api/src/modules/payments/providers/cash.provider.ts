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
export class CashProvider implements PaymentProvider {
  readonly providerName = 'CASH';

  async initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
    const paymentRef = `CSH-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    return {
      paymentId: `pay_${Date.now()}`,
      paymentReference: paymentRef,
      status: 'SUCCESS', // Cash at counter terminal is immediately collected
      providerTxId: `COUNTER-${paymentRef}`,
      message: 'Cash received at branch ticket office counter',
    };
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    return {
      valid: true,
      status: 'SUCCESS',
      transactionId: `CASH-RECEIPT-${reference}`,
      amount: 850.0,
      currency: 'ETB',
    };
  }

  async refundPayment(request: RefundRequest): Promise<RefundResult> {
    return {
      success: true,
      refundReference: `RF-CSH-${Date.now()}`,
      amount: request.amount,
      status: 'REFUNDED',
    };
  }
}
