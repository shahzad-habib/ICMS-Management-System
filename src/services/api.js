// ─── API Service Layer Stub ───────────────────────────────────────────────────
// All API calls will be centralized here using fetch/axios.
// Implement in Phase 2.
let BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

if (BASE_URL.endsWith('.vercel.app') || BASE_URL.endsWith('.onrender.com')) {
  BASE_URL += '/api';
} else if (!BASE_URL.endsWith('/api') && !BASE_URL.endsWith('/api/')) {
  if (BASE_URL.match(/^https?:\/\/[^\/]+$/)) {
    BASE_URL += '/api';
  }
}

export const api = {
  baseURL: BASE_URL,
};
