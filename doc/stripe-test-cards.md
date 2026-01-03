# Stripe Test Card Numbers

Use these card numbers in Stripe test mode for development and testing.

## Successful Payments

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Visa - Success |
| `5555 5555 5555 4444` | Mastercard - Success |
| `3782 822463 10005` | American Express - Success |

## Declined Payments

| Card Number | Description |
|-------------|-------------|
| `4000 0000 0000 0002` | Generic decline |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 9987` | Lost card |
| `4000 0000 0000 9979` | Stolen card |

## 3D Secure / Authentication

| Card Number | Description |
|-------------|-------------|
| `4000 0025 0000 3155` | Requires authentication |
| `4000 0000 0000 3220` | 3D Secure 2 required |

## Other Test Values

- **Expiry Date:** Any future date (e.g., `12/34`)
- **CVC:** Any 3 digits (e.g., `123`) or 4 digits for Amex
- **ZIP Code:** Any 5 digits (e.g., `12345`)

## Reference

Full list: https://docs.stripe.com/testing#cards
