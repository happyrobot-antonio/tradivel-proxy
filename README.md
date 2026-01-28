# Tradivel Proxy API

Proxy API para **Tradivel IA** - Sistema de asignación de visitas.

## 🚀 Características

- ✅ Passthrough de todos los endpoints de la API de Tradivel
- ✅ Transformación automática de respuestas de listas
- ✅ Gestión automática de tokens JWT (cache + refresh)
- ✅ Logging de requests

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

Crear archivo `.env`:

```env
TRADIVEL_API_URL=https://apipruebas.gestnet.es
TRADIVEL_USERNAME=gestnet
TRADIVEL_PASSWORD=TraAi@2026
PORT=3000
```

## 🏃 Ejecución

```bash
# Producción
npm start

# Desarrollo (con hot reload)
npm run dev
```

## 📡 Endpoints

| Endpoint | Método | Descripción | Transformación |
|----------|--------|-------------|----------------|
| `/login/token` | POST | Obtener token JWT | Passthrough |
| `/visitas/getVisitas` | POST | Obtener visitas por CP | `{ visitas: [...], total }` |
| `/visitas/getTecnicos` | POST | Obtener técnicos por CP | `{ tecnicos: [...], total }` |
| `/visitas/intentoContactoVisita` | POST | Registrar contacto | Passthrough |
| `/health` | GET | Health check | - |

## 🧪 Ejemplos

### Obtener visitas

```bash
curl -X POST http://localhost:3000/visitas/getVisitas \
  -H "Content-Type: application/json" \
  -d '{"cp": ["03184"]}'
```

**Respuesta:**
```json
{
  "visitas": [
    {
      "id_visita": 7050292,
      "cod_contrato": "1028912599",
      "tipo_visita": "Reducida",
      "cliente": { ... },
      "direccion": { ... }
    }
  ],
  "total": 1
}
```

### Obtener técnicos

```bash
curl -X POST http://localhost:3000/visitas/getTecnicos \
  -H "Content-Type: application/json" \
  -d '{"cp": "03184"}'
```

**Respuesta:**
```json
{
  "tecnicos": [
    {
      "id_tecnico": 72789,
      "nombre": "AARON DURAN LOAISA",
      "codigo": "TEC11146",
      "delegacion": "TRADIVEL LEVANTE"
    }
  ],
  "total": 1
}
```

### Registrar cita

```bash
curl -X POST http://localhost:3000/visitas/intentoContactoVisita \
  -H "Content-Type: application/json" \
  -d '{
    "id_visita": 7050299,
    "id_tecnico": 72786,
    "tipoContacto": "CITA_CONCERTADA",
    "fechaVisita": "2025-05-09",
    "HoraInicio": "17:15",
    "HoraFin": "17:30",
    "Observaciones": "Cita confirmada"
  }'
```

## 📋 Tipos de Contacto

| Valor | Descripción |
|-------|-------------|
| `NO_CONTESTA` | Cliente no responde |
| `NO_DESEA_VISITA` | Cliente rechaza la visita |
| `CONTACTO_APLAZADO` | Se aplaza para otra fecha |
| `CITA_CONCERTADA` | Cita confirmada |

## 📁 Estructura

```
├── package.json
├── .env
├── .gitignore
└── src/
    ├── index.js      # Servidor Express
    ├── config.js     # Configuración
    ├── auth.js       # Gestión de tokens JWT
    └── proxy.js      # Lógica de proxy + transformación
```

## 📄 Licencia

MIT
