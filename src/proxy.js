import axios from 'axios';
import { config } from './config.js';
import { getAuthToken, invalidateToken } from './auth.js';

/**
 * Configuración de transformación de respuestas.
 * Define qué endpoints devuelven listas y cómo envolverlas.
 */
const RESPONSE_TRANSFORMATIONS = {
  '/visitas/getVisitas': {
    wrapKey: 'visitas',
    isList: true,
  },
  '/visitas/getTecnicos': {
    wrapKey: 'tecnicos',
    isList: true,
  },
};

/**
 * Transforma la respuesta según la configuración del endpoint.
 * - Si es una lista, la envuelve en un objeto con key específica y total.
 * - Si no, devuelve la respuesta tal cual (passthrough).
 */
function transformResponse(path, data) {
  const transformation = RESPONSE_TRANSFORMATIONS[path];
  
  if (transformation && transformation.isList && Array.isArray(data)) {
    return {
      [transformation.wrapKey]: data,
      total: data.length,
    };
  }
  
  return data;
}

/**
 * Realiza una petición proxy a la API de Tradivel.
 */
export async function proxyRequest(req, targetPath) {
  const token = await getAuthToken();
  
  try {
    const response = await axios({
      method: req.method,
      url: `${config.tradivelApiUrl}${targetPath}`,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      validateStatus: () => true, // No lanzar error por status codes
    });

    // Si el token expiró (401), invalidar y reintentar una vez
    if (response.status === 401) {
      console.log('⚠️ Token expirado, reautenticando...');
      invalidateToken();
      const newToken = await getAuthToken();
      
      const retryResponse = await axios({
        method: req.method,
        url: `${config.tradivelApiUrl}${targetPath}`,
        data: req.body,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newToken}`,
        },
        validateStatus: () => true,
      });
      
      return {
        status: retryResponse.status,
        data: transformResponse(targetPath, retryResponse.data),
      };
    }

    return {
      status: response.status,
      data: transformResponse(targetPath, response.data),
    };
  } catch (error) {
    console.error(`❌ Error en proxy ${targetPath}:`, error.message);
    throw error;
  }
}
