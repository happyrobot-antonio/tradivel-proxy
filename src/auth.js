import axios from 'axios';
import { config } from './config.js';

let cachedToken = null;
let tokenExpiresAt = null;

/**
 * Obtiene un token de autenticación de la API de Tradivel.
 * Cachea el token para reutilizarlo hasta que expire.
 */
export async function getAuthToken() {
  // Si tenemos un token válido cacheado, lo devolvemos
  if (cachedToken && tokenExpiresAt && new Date() < tokenExpiresAt) {
    return cachedToken;
  }

  try {
    const response = await axios.post(
      `${config.tradivelApiUrl}/login/token`,
      {
        username: config.tradivelUsername,
        clave: config.tradivelPassword,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.result && response.data.access_token) {
      cachedToken = response.data.access_token;
      
      // Parsear fecha de expiración (con margen de 1 hora)
      if (response.data.token_spires_at) {
        tokenExpiresAt = new Date(response.data.token_spires_at);
        tokenExpiresAt.setHours(tokenExpiresAt.getHours() - 1);
      } else {
        // Si no hay fecha, expirar en 23 horas
        tokenExpiresAt = new Date();
        tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 23);
      }

      console.log(`✅ Token obtenido. Válido hasta: ${tokenExpiresAt.toISOString()}`);
      return cachedToken;
    }

    throw new Error('No se pudo obtener el token de autenticación');
  } catch (error) {
    console.error('❌ Error obteniendo token:', error.message);
    throw error;
  }
}

/**
 * Invalida el token cacheado (para forzar reautenticación)
 */
export function invalidateToken() {
  cachedToken = null;
  tokenExpiresAt = null;
}
