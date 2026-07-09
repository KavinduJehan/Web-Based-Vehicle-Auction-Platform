const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

function getApiOrigin() {
  if (typeof API_BASE_URL !== 'string') return '';
  if (!API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
    return '';
  }

  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return '';
  }
}

export function toMediaUrl(input) {
  if (!input || typeof input !== 'string') return input;

  if (
    input.startsWith('http://') ||
    input.startsWith('https://') ||
    input.startsWith('data:') ||
    input.startsWith('blob:')
  ) {
    return input;
  }

  if (!input.startsWith('/')) return input;

  const origin = getApiOrigin();
  if (!origin) {
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.hostname}:3000${input}`;
    }
    return input;
  }
  return `${origin}${input}`;
}
