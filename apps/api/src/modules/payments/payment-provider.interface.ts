export interface PaymentRequest {
  bookingId: string;
  bookingReference: string;
  amount: number;
  currency: string;
  customerPhone: string;
  customerName: string;
  customerEmail?: string;
  returnUrl?: string;
}

export interface PaymentResult {
  paymentId: string;
  paymentReference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  checkoutUrl?: string;
  providerTxId?: string;
  message?: string;
}

export interface PaymentVerification {
  valid: boolean;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  transactionId: string;
  amount: number;
  currency: string;
}

export interface RefundRequest {
  paymentReference: string;
  amount: number;
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundReference: string;
  amount: number;
  status: 'REFUNDED' | 'FAILED';
}

export interface PaymentProvider {
  readonly providerName: string;
  initiatePayment(request: PaymentRequest): Promise<PaymentResult>;
  verifyPayment(reference: string): Promise<PaymentVerification>;
  refundPayment(request: RefundRequest): Promise<RefundResult>;
}
