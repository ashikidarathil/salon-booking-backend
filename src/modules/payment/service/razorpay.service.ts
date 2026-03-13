import Razorpay from 'razorpay';
import { IRazorpayService, RazorpayOrder } from './IRazorpayService';
import { env } from '../../../config/env';
import { injectable } from 'tsyringe';
import crypto from 'crypto';

@injectable()
export class RazorpayService implements IRazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(amount: number, currency: string, receipt: string): Promise<RazorpayOrder> {
    const options = {
      amount: amount * 100, // amount in paisa
      currency: currency,
      receipt: receipt,
    };

    return this.razorpay.orders.create(options);
  }

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const generated_signature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    return generated_signature === signature;
  }
}
