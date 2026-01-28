import 'dotenv/config';

export const config = {
  // Tradivel API
  tradivelApiUrl: process.env.TRADIVEL_API_URL || 'https://apipruebas.gestnet.es',
  tradivelUsername: process.env.TRADIVEL_USERNAME || 'gestnet',
  tradivelPassword: process.env.TRADIVEL_PASSWORD || 'TraAi@2026',
  
  // Server
  port: process.env.PORT || 3000,
};
