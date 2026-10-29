import type { MembershipPlanOffer } from '@/features/membership/services/membership.service'

/**
 * Payment boundary for the membership checkout.
 *
 * The live Razorpay flow needs two server endpoints because the Key Secret
 * must never reach the browser:
 *
 *   POST /create-membership-order.php
 *     body: { MatriID, planid }
 *     returns: { order_id, amount, currency, key_id }
 *     The server reads the plan price from the database — never trust a
 *     client-supplied amount.
 *
 *   POST /verify-membership-payment.php
 *     body: { MatriID, planid, razorpay_order_id, razorpay_payment_id,
 *             razorpay_signature }
 *     returns: { status: 'success' }
 *     The server recomputes the HMAC SHA256 signature with the Key Secret
 *     before activating the plan.
 *
 * Until those endpoints and keys exist, this service simulates the round trip
 * so the checkout UI can be reviewed. It never moves money and must only be
 * used while `env.paymentDemo` is on.
 */
export interface MembershipOrder {
  id: string
  /** Amount in paise, as Razorpay expects. */
  amount: number
  currency: 'INR'
}

export interface MembershipPaymentResult {
  status: 'success'
  paymentId: string
  orderId: string
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function demoId(prefix: string): string {
  return `${prefix}_demo_${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

export const demoMembershipPaymentService = {
  async createOrder(plan: MembershipPlanOffer): Promise<MembershipOrder> {
    await delay(700)
    return { id: demoId('order'), amount: plan.amount * 100, currency: 'INR' }
  },

  async completePayment(order: MembershipOrder): Promise<MembershipPaymentResult> {
    await delay(1200)
    return { status: 'success', paymentId: demoId('pay'), orderId: order.id }
  },
}
