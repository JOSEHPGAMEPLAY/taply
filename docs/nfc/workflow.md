# Flujo de Etiquetas NFC — Taply

## Flujo completo

1. **Creación**: El usuario crea una etiqueta NFC asociada a su negocio → se genera un token único → la etiqueta queda en estado `INVENTORY`.

2. **Programación**: La etiqueta se programa físicamente con el URL de resolución (`https://taply.app/t/[token]`) → el estado cambia a `PROGRAMMED`.

3. **Asignación**: El usuario asigna la etiqueta a una página → se crea un `TagAssignment` con `startedAt` → la etiqueta queda en estado `ACTIVE`.

4. **Escaneo**: Un visitante escanea la etiqueta con su teléfono → el navegador accede a `GET /public/nfc/:token` → el backend resuelve el token, verifica la asignación activa, registra un evento `TAG_SCAN` y redirige a la página pública.

5. **Desasignación**: El usuario desasigna la etiqueta → se actualiza el `TagAssignment` con `endedAt` → se puede reasignar a otra página.

## Resolución pública

Cuando se escanea una etiqueta, el endpoint `GET /public/nfc/:token` ejecuta:

1. Buscar la etiqueta por token.
2. Verificar que la etiqueta esté en estado `ACTIVE`.
3. Buscar la asignación activa (sin `endedAt`).
4. Obtener la página y el negocio asociados.
5. Verificar que el negocio esté activo.
6. Verificar que la página tenga una versión publicada.
7. Registrar un evento `TAG_SCAN`.
8. Retornar la URL de redirección y la información de la página.

## Pantalla de etiqueta sin asignación

Si la etiqueta no tiene asignación activa, el endpoint retorna un error 404. El frontend muestra una pantalla informativa:

- "Esta etiqueta aún no está asignada a un negocio."
- Información de contacto de Taply.
- Opción de generar un código QR como alternativa temporal.

## Estados de la etiqueta

| Estado | Descripción |
|---|---|
| INVENTORY | Etiqueta creada, no programada |
| PENDING_PROGRAMMING | Pendiente de programación física |
| PROGRAMMED | Programada, no asignada |
| ACTIVE | Asignada y funcionando |
| INACTIVE | Desactivada temporalmente |
| LOST | Etiqueta perdida |
| DAMAGED | Etiqueta dañada |
