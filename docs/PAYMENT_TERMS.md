# Per-product payment terms

Every Store Studio product has a seller-selected payment policy:

| Policy | When the customer pays | Stored value |
| --- | --- | --- |
| Cash on delivery | All charges on delivery | `COD` |
| Deposit + COD | Seller chooses a 1–99% product deposit; remainder on delivery | `DEPOSIT` + `depositPercent` |
| Full prepayment | Full order cost before dispatch | `PREPAID` |

Existing products remain `COD`. Update these options in **Dashboard → Products → Edit → Customer payment terms**.

## Calculation and shipping

The backend calculates each product line's required advance (`price × quantity × deposit rate`, rounded to cents). For a mixed cart:

- Prepaid products: full line amount before dispatch.
- Deposit products: configured deposit before dispatch, remaining line amount on delivery.
- COD products: full line amount on delivery.
- Shipping: before dispatch *only if every product is prepaid*; otherwise on delivery.

The order stores a snapshot of each line's payment terms and advance amount to preserve the original agreement if the product's policy changes later. The order's `upfrontAmount + deliveryAmount` equals its final `totalPrice` including shipping.

## Important: No online payment gateway

**This feature records payment obligations; it does not process, transfer, or verify actual money.** Checkout creates an order request and shows the amounts. Customers are told to wait for the seller's payment instructions. Never enter card numbers or banking credentials into Store Studio.

The seller must verify the advance has actually arrived *outside this app*, then use **Orders → Mark upfront payment received**. This requires seller/owner/admin authentication and does not charge customers. Confirming or dispatching an order that requires an advance is blocked until verification. COD orders need no advance confirmation.

Use an appropriate payment provider and a server-verified payment callback for automated collection in the future. Do not set `upfrontPaymentConfirmed` from an untrusted customer request.

## Database migration

`V10__payment_terms.sql` is automatically applied by Flyway at startup. It adds the product payment policy, immutable order-item snapshots, order advance and delivery balances, and manual payment confirmation metadata. Existing orders are migrated as COD, with their historical total due on delivery. No existing rows are deleted.

## API fields

- Product create/update/read: `paymentMode` = `COD`/`DEPOSIT`/`PREPAID`, `depositPercent` for `DEPOSIT`.
- Cart item: exposes terms for client preview.
- Checkout order response: `upfrontAmount`, `deliveryAmount`, `upfrontPaymentConfirmed`.
- Seller order response: also exposes the order-wide payment summary.
- `PATCH /api/v1/seller/seller-orders/{sellerOrderId}/confirm-upfront` (authenticated): manually verifies advance receipt after independent confirmation. The action is idempotent.

For historical records, switching a product from one payment mode to another does **not** change prior orders.
