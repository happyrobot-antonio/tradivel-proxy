export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Tradivel Proxy API',
    version: '1.0.0',
    description: `
## 🚀 Proxy API para Tradivel IA

API proxy para el sistema de asignación de visitas de Tradivel.

### Características:
- ✅ Passthrough de endpoints originales
- ✅ Transformación automática de listas (envueltas en keys específicas)
- ✅ Gestión automática de tokens JWT
- ✅ Cache de autenticación

### Transformaciones:
| Endpoint | Respuesta Original | Respuesta Proxy |
|----------|-------------------|-----------------|
| \`/visitas/getVisitas\` | \`[{...}]\` | \`{"visitas": [...], "total": N}\` |
| \`/visitas/getTecnicos\` | \`[{...}]\` | \`{"tecnicos": [...], "total": N}\` |
    `,
    contact: {
      name: 'HappyRobot',
      url: 'https://happyrobot.ai',
    },
  },
  servers: [
    {
      url: 'https://tradivel-proxy-production.up.railway.app',
      description: 'Producción (Railway)',
    },
    {
      url: 'http://localhost:3000',
      description: 'Desarrollo local',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Autenticación' },
    { name: 'Visitas', description: 'Gestión de visitas' },
    { name: 'Técnicos', description: 'Gestión de técnicos' },
    { name: 'Health', description: 'Estado del servicio' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Verifica que el servicio está funcionando correctamente.',
        responses: {
          200: {
            description: 'Servicio funcionando',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time', example: '2026-01-28T20:42:14.004Z' },
                    version: { type: 'string', example: '1.0.0' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/login/token': {
      post: {
        tags: ['Auth'],
        summary: 'Obtener token de autenticación',
        description: 'Obtiene un token JWT para autenticarse con la API. **Nota:** El proxy gestiona automáticamente la autenticación, este endpoint es solo para referencia.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'clave'],
                properties: {
                  username: { type: 'string', example: 'gestnet' },
                  clave: { type: 'string', example: '********' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Token obtenido correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    result: { type: 'boolean', example: true },
                    user: { type: 'string', example: 'gestnet' },
                    access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                    token_type: { type: 'string', example: 'bearer' },
                    token_spires_at: { type: 'string', format: 'date-time', example: '2027-01-16T11:15:32.181579' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/visitas/getVisitas': {
      post: {
        tags: ['Visitas'],
        summary: 'Obtener visitas por códigos postales',
        description: `
Obtiene las visitas pendientes filtradas por uno o varios códigos postales.

**⚡ Transformación aplicada:**
- Respuesta original: \`[{visita1}, {visita2}...]\`
- Respuesta proxy: \`{"visitas": [...], "total": N}\`
        `,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['cp'],
                properties: {
                  cp: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['03184', '47006'],
                    description: 'Array de códigos postales',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Lista de visitas',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/VisitasResponse',
                },
              },
            },
          },
        },
      },
    },
    '/visitas/getTecnicos': {
      post: {
        tags: ['Técnicos'],
        summary: 'Obtener técnicos por código postal',
        description: `
Obtiene los técnicos disponibles para un código postal específico.

**⚡ Transformación aplicada:**
- Respuesta original: \`[{tecnico1}, {tecnico2}...]\`
- Respuesta proxy: \`{"tecnicos": [...], "total": N}\`
        `,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['cp'],
                properties: {
                  cp: {
                    type: 'string',
                    example: '03184',
                    description: 'Código postal (string único)',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Lista de técnicos',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TecnicosResponse',
                },
              },
            },
          },
        },
      },
    },
    '/visitas/intentoContactoVisita': {
      post: {
        tags: ['Visitas'],
        summary: 'Registrar intento de contacto',
        description: `
Registra un intento de contacto con el cliente para una visita.

**Tipos de contacto válidos:**
| Valor | Descripción |
|-------|-------------|
| \`NO_CONTESTA\` | Cliente no responde |
| \`NO_DESEA_VISITA\` | Cliente rechaza la visita |
| \`CONTACTO_APLAZADO\` | Se aplaza para otra fecha |
| \`CITA_CONCERTADA\` | Cita confirmada ✅ |
        `,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/IntentoContactoRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Contacto registrado correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'boolean', example: false },
                    id_visita: { type: 'integer', example: 7050299 },
                    mensaje: { type: 'string', example: 'Visita Asignada id-tecnico:72786 Fecha visita:2025-05-09 Correctamente' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Cliente: {
        type: 'object',
        properties: {
          id_cliente: { type: 'integer', example: 3901806 },
          cod_contrato: { type: 'string', example: '1028912599' },
          nombre_cliente: { type: 'string', example: 'DEREK OLIVE' },
          telefono1: { type: 'string', example: '686650453' },
          telefono2: { type: 'string', example: '686650453' },
          telefono3: { type: 'string', example: '' },
          telefono4: { type: 'string', example: '686650453' },
          otros_telefonos: { type: 'string', example: '' },
          email: { type: 'string', format: 'email', example: 'cliente@example.com' },
          bConsentimientoIberdrola: { type: 'string', enum: ['Si', 'No'], example: 'No' },
          dni: { type: 'string', example: 'X3202471C' },
          observaciones: { type: 'string', example: '' },
          cod_clienteIB: { type: 'string', example: '13423216' },
          contratoIB: { type: 'string', example: '1028912599' },
        },
      },
      Direccion: {
        type: 'object',
        properties: {
          id_direccion: { type: 'integer', example: 6414263 },
          direccion: { type: 'string', example: 'CALLE EJEMPLO' },
          numero: { type: 'string', example: '464' },
          portal: { type: 'string', example: '' },
          escalera: { type: 'string', example: '' },
          piso: { type: 'string', example: 'BA' },
          puerta: { type: 'string', example: '' },
          cp: { type: 'string', example: '03184' },
          poblacion: { type: 'string', example: 'TORREVIEJA' },
          provincia: { type: 'string', example: 'Alicante' },
          lat: { type: 'string', example: '0E-7' },
          lng: { type: 'string', example: '0E-7' },
          cod_receptor: { type: 'string', example: '033450404' },
        },
      },
      Visita: {
        type: 'object',
        properties: {
          id_visita: { type: 'integer', example: 7050292 },
          cod_contrato: { type: 'string', example: '1028912599' },
          cod_visita: { type: 'integer', example: 8 },
          estadoIb: { type: 'string', example: 'En Ejecución' },
          fecha_maxima_realizacion: { type: 'string', format: 'date', example: '2026-01-28' },
          tipo_visita: { type: 'string', enum: ['Reducida', 'Rite'], example: 'Reducida' },
          cliente: { $ref: '#/components/schemas/Cliente' },
          direccion: { $ref: '#/components/schemas/Direccion' },
        },
      },
      Tecnico: {
        type: 'object',
        properties: {
          id_tecnico: { type: 'integer', example: 72789 },
          nombre: { type: 'string', example: 'AARON DURAN LOAISA' },
          codigo: { type: 'string', example: 'TEC11146' },
          delegacion: { type: 'string', example: 'TRADIVEL LEVANTE' },
        },
      },
      VisitasResponse: {
        type: 'object',
        properties: {
          visitas: {
            type: 'array',
            items: { $ref: '#/components/schemas/Visita' },
          },
          total: { type: 'integer', example: 3 },
        },
      },
      TecnicosResponse: {
        type: 'object',
        properties: {
          tecnicos: {
            type: 'array',
            items: { $ref: '#/components/schemas/Tecnico' },
          },
          total: { type: 'integer', example: 5 },
        },
      },
      IntentoContactoRequest: {
        type: 'object',
        required: ['id_visita', 'id_tecnico', 'tipoContacto'],
        properties: {
          id_visita: { type: 'integer', example: 7050299, description: 'ID de la visita' },
          id_tecnico: { type: 'integer', example: 72786, description: 'ID del técnico asignado' },
          tipoContacto: {
            type: 'string',
            enum: ['NO_CONTESTA', 'NO_DESEA_VISITA', 'CONTACTO_APLAZADO', 'CITA_CONCERTADA'],
            example: 'CITA_CONCERTADA',
            description: 'Tipo de resultado del contacto',
          },
          fechaVisita: { type: 'string', format: 'date', example: '2025-05-09', description: 'Fecha de la visita (requerido si CITA_CONCERTADA)' },
          HoraInicio: { type: 'string', example: '17:15', description: 'Hora de inicio (requerido si CITA_CONCERTADA)' },
          HoraFin: { type: 'string', example: '17:30', description: 'Hora de fin (requerido si CITA_CONCERTADA)' },
          Observaciones: { type: 'string', example: 'Cliente confirma disponibilidad', description: 'Observaciones adicionales' },
        },
      },
    },
  },
};
