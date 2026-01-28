import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { proxyRequest } from './proxy.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// ENDPOINTS PROXY
// ============================================

/**
 * POST /login/token
 * Passthrough - Obtener token de autenticación
 */
app.post('/login/token', async (req, res) => {
  try {
    const result = await proxyRequest(req, '/login/token');
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ error: true, mensaje: error.message });
  }
});

/**
 * POST /visitas/getVisitas
 * Transformado - Devuelve { visitas: [...], total: N }
 */
app.post('/visitas/getVisitas', async (req, res) => {
  try {
    const result = await proxyRequest(req, '/visitas/getVisitas');
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ error: true, mensaje: error.message });
  }
});

/**
 * POST /visitas/getTecnicos
 * Transformado - Devuelve { tecnicos: [...], total: N }
 */
app.post('/visitas/getTecnicos', async (req, res) => {
  try {
    const result = await proxyRequest(req, '/visitas/getTecnicos');
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ error: true, mensaje: error.message });
  }
});

/**
 * POST /visitas/intentoContactoVisita
 * Passthrough - Registrar intento de contacto
 */
app.post('/visitas/intentoContactoVisita', async (req, res) => {
  try {
    const result = await proxyRequest(req, '/visitas/intentoContactoVisita');
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ error: true, mensaje: error.message });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: true, 
    mensaje: `Endpoint ${req.method} ${req.path} no encontrado` 
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║         🚀 TRADIVEL PROXY API v1.0.0                  ║
╠═══════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${config.port}              ║
║  Target API: ${config.tradivelApiUrl}       ║
╠═══════════════════════════════════════════════════════╣
║  ENDPOINTS:                                           ║
║  POST /login/token              → Passthrough         ║
║  POST /visitas/getVisitas       → { visitas, total }  ║
║  POST /visitas/getTecnicos      → { tecnicos, total } ║
║  POST /visitas/intentoContactoVisita → Passthrough    ║
║  GET  /health                   → Health check        ║
╚═══════════════════════════════════════════════════════╝
  `);
});
