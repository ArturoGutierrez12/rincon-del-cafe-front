// src/config.js
// En desarrollo usa el proxy de Vite (/api); en producción, la API real
export const API = import.meta.env.DEV ? '/api' : 'https://api.rincondelcafe.tech/api'