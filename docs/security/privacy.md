# Privacidad de Datos — Taply

## Marco legal

Taply se adhiere a la **Ley 1581 de 2012 de Colombia** (Protección de Datos Personales), el **Decreto 1377 de 2010** (reglamento de la Ley 1581) y las mejores prácticas internacionales de privacidad (GDPR como referencia).

### Principios aplicados

1. **Licitud y lealtad**: Los datos se recopilan de manera transparente y con consentimiento informado.
2. **Consentimiento**: El usuario acepta los términos al registrarse, autorizando el tratamiento de sus datos.
3. **Comunicación**: Se informa al titular sobre la finalidad del tratamiento de sus datos.
4. **Acceso y circulación restringida**: Solo el titular y el responsable tienen acceso a los datos personales.
5. **Seguridad**: Se implementan medidas técnicas y organizativas para proteger los datos.
6. **Veracidad**: Los datos son exactos, completos y actualizados.
7. **Finalidad**: Los datos se usan solo para los fines declarados.
8. **Compatibilidad**: El tratamiento es compatible con las finalidades declaradas.
9. **Responsabilidad**: Taply es responsable del tratamiento de los datos que recopila.
10. **Libre ejercicio de derechos**: Los titulares pueden ejercer sus derechos ARCO en cualquier momento.

## Derechos ARCO

Los usuarios tienen derecho a:

| Derecho | Descripción | Cómo ejercerlo |
|---|---|---|
| **Acceso** | Conocer qué datos personales se tienen sobre ellos | Solicitar por email a soporte@taply.co |
| **Rectificación** | Corregir datos inexactos o desactualizados | Editar perfil o contactar soporte |
| **Cancelación** | Eliminar definitivamente sus datos personales | Solicitar eliminación de cuenta |
| **Oposición** | Negarse al tratamiento de sus datos para fines específicos | Contactar soporte@taply.co |

### Plazo de respuesta

Taply responde las solicitudes ARCO dentro de los **15 días hábiles** siguientes a la recepción, conforme al artículo 15 de la Ley 1581 de 2012.

## Minimización de datos

Taply recopila solo los datos estrictamente necesarios:

### Datos personales

| Campo | Modelo | Finalidad | Retención |
|---|---|---|---|
| Email | `User.email` | Identificación y autenticación | Hasta cancelación de cuenta |
| Nombre | `User.name` | Personalización del perfil | Hasta cancelación de cuenta |
| Contraseña (hash) | `User.passwordHash` | Autenticación segura | Hasta cancelación de cuenta |

### Datos de negocio

| Campo | Modelo | Finalidad | Retención |
|---|---|---|---|
| Nombre | `Business.name` | Identificación del negocio | Hasta eliminación del negocio |
| Slug | `Business.slug` | URL única del negocio | Hasta eliminación del negocio |
| Descripción | `Business.description` | Contenido público | Hasta eliminación del negocio |

### Datos de analíticas

| Campo | Modelo | Finalidad | Retención |
|---|---|---|---|
| Tipo de evento | `AnalyticsEvent.type` | Métricas de uso | **12 meses** |
| ID de página | `AnalyticsEvent.pageId` | Asociar evento a página | **12 meses** |
| Botón clickeado | `AnalyticsEvent.buttonKey` | Métricas de botones | **12 meses** |
| Metadatos | `AnalyticsEvent.metadata` | Contexto del evento | **12 meses** |

**No se recopilan**: IPs, User-Agents, datos de geolocalización, cookies de rastreo ni datos sensibles.

## Política de retención

| Tipo de dato | Retención | Criterio de eliminación |
|---|---|---|
| Datos personales del usuario | Indefinida | Cancelación de cuenta o solicitud ARCO |
| Datos del negocio | Indefinida | Eliminación del negocio por el owner |
| Eventos de analíticas | **12 meses** | Eliminación automática vía `DELETE /analytics/events/prune` |
| Sesiones de autenticación | 7 días | Expiración automática del token |
| Logs de auditoría | 12 meses | Eliminación manual o automática |
| Backups de base de datos | 30 días | Rotación automática |

### Retención de eventos de analíticas

Los eventos de analíticas se eliminan automáticamente después de **12 meses** mediante el endpoint:

```
DELETE /api/v1/analytics/events/prune?months=12
```

Este endpoint se puede ejecutar manualmente o programar como tarea periódica.

## Privacidad en analíticas

- Los eventos de analíticas **no contienen datos personales identificables**.
- Los eventos se asocian a una página, no a un usuario específico.
- Los dueños del negocio pueden ver las **estadísticas agregadas**, pero no los datos individuales de los visitantes.
- No se implementan cookies de rastreo ni fingerprinting del navegador.

## Medidas de seguridad

### Almacenamiento de contraseñas

- Las contraseñas se hashean con **bcrypt** (cost factor 10) antes de almacenarse.
- El hash nunca se retorna en las respuestas de la API.
- Las contraseñas nunca se almacenan en texto plano ni se transmiten sin cifrar.

### Autenticación

- Tokens JWT con expiración de **15 minutos** para acceso.
- Tokens de refresco con expiración de **7 días**.
- Los secretos JWT se almacenan en variables de entorno, no en código.

### Comunicaciones

- Todas las comunicaciones entre frontend y backend usan **HTTPS** en producción.
- Los tokens JWT se transmiten en el header `Authorization`, no en cookies.
- CORS está configurado para permitir solo los orígenes autorizados.

### Base de datos

- PostgreSQL no se expone al host en producción.
- Las credenciales de base de datos se almacenan en variables de entorno.
- Los backups se almacenan en directorios con permisos restringidos.

### Aislamiento de datos

- Cada negocio está aislado por `businessId`.
- Los usuarios solo acceden a los datos de sus propios negocios.
- La verificación de ownership se realiza en cada operación.

## Transparencia

- Los usuarios pueden solicitar la eliminación de sus datos contactando a **soporte@taply.co**.
- No se comparten datos con terceros sin consentimiento explícito.
- Los backups de base de datos se almacenan de forma segura.
- Este documento se actualiza cuando cambian las prácticas de privacidad.

## Contacto del responsable

Para ejercer derechos ARCO o consultar sobre privacidad:

- **Email**: soporte@taply.co
- **Responsable**: Taply S.A.S.
- **DPO**: (por definir)

## Versiones de este documento

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-11-16 | Documento inicial con Ley 1581, ARCO, retención y medidas de seguridad |
