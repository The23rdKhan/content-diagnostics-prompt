export const PAYOUT_METHODS = [
  {
    value: 'PAYPAL',
    label: 'PayPal',
    description: 'Receive payments directly to your PayPal account'
  },
  {
    value: 'BANK_TRANSFER',
    label: 'Bank Transfer',
    description: 'Direct deposit to your bank account (ACH/Wire)'
  },
  {
    value: 'STRIPE_CONNECT',
    label: 'Stripe Connect',
    description: 'Fast payouts via Stripe with debit card option'
  },
] as const

export type PayoutMethodValue = typeof PAYOUT_METHODS[number]['value']
