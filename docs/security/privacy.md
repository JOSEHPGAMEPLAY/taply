# Privacidad de Datos — Taply

## Marco legal

Taply se adhiere a la **Ley 1581 de 2012 de Colombia** (Protección de Datos Personales) y las mejores prácticas internacionales de privacidad.

## Minimización de datos

Taply recopila solo los datos estrictamente necesarios:

- **Usuario**: email, hash de contraseña, nombre. No se recopilan datos sensibles (dirección, teléfono, fecha de nacimiento).
- **Negocio**: nombre, slug, descripción. No se recopilan datos fiscales ni bancarios en esta fase.
- **Analíticas**: eventos anónimos (visitas, clics, escaneos). No se recopilan IPs, User-Agents ni datos de geolocalización.

## Retención de eventos

Los eventos de analíticas se retienen durante **12 meses**. Después de este período, se eliminan automáticamente mediante un proceso de limpieza programado.

## Privacidad en analíticas

- Los eventos de analíticas no contienen datos personales identificables.
- Los eventos se asocian a una página, no a un usuario específico.
- Los dueños del negocio pueden ver las estadísticas agregadas, pero no los datos individuales de los visitantes.

## Almacenamiento de contraseñas

- Las contraseñas se hashean con bcrypt antes de almacenarse.
- El hash nunca se retorna en las respuestas de la API.
- Si un usuario solicita eliminar su cuenta, todos sus datos se eliminan de forma irreversible.

## Transparencia

- Los usuarios pueden solicitar la eliminación de sus datos contactando al soporte.
- No se comparten datos con terceros sin consentimiento explícito.
- Los backups de base de datos se encriptan en reposo.
