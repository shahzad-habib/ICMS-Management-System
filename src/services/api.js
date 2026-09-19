// ─── API Service Layer Stub ───────────────────────────────────────────────────
// All API calls will be centralized here using fetch/axios.
// Implement in Phase 2.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  baseURL: BASE_URL,
};
