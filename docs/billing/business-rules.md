# Facturación — Reglas de Negocio

## Productos

Un producto de facturación puede ser:

- **Pago único (ONE_TIME)**: Se paga una vez, no tiene intervalo. Ejemplo: compra de etiquetas NFC.
- **Suscripción (SUBSCRIPTION)**: Se paga recurrentemente, tiene intervalo (month, year). Ejemplo: plan mensual de Taply.

## Órdenes

Una orden agrupa uno o más items de compra:

- Cada item referencia un producto, tiene cantidad y precio unitario.
- El total de la orden es la suma de los totales de los items.
- Una orden puede tener múltiples pagos (parciales o completos).

## Pagos

Un pago representa una transacción financiera:

- El `eventId` es único para evitar duplicados cuando el proveedor envía webhooks repetidos.
- El `provider` indica la pasarela de pago (Stripe, etc.).
- El `providerReference` almacena el ID de la transacción en el proveedor.

## Suscripciones

Una suscripción vincula un negocio a un producto recurrente:

- `startedAt`: fecha de inicio de la suscripción.
- `endsAt`: fecha de fin (null si está activa).
- `nextBillingAt`: fecha del próximo cobro automático.

## Derechos de uso (Entitlements)

Un derecho de uso otorga acceso a una funcionalidad:

- **Fuente ORDER**: El derecho proviene de una compra única. No expira a menos que se cancele.
- **Fuente SUBSCRIPTION**: El derecho expira cuando la suscripción expira.
- Si la suscripción entra en período de gracia (PAST_DUE), el derecho se suspende temporalmente.

## Reglas de gracia

- Si un pago falla, la suscripción entra en estado `PAST_DUE` durante 7 días.
- Durante el período de gracia, los derechos se suspenden pero no se revocan.
- Si el pago se completa dentro del período de gracia, la suscripción se reactiva.
- Si el pago no se completa, la suscripción expira y los derechos se revocan.
