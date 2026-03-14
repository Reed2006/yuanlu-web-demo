import type { MapClientConfig } from './types';

export function getMapStyle(config?: MapClientConfig | null) {
  return config?.style_url || 'mapbox://styles/mapbox/streets-v12';
}

export function getMapToken(config?: MapClientConfig | null) {
  return config?.public_token || '';
}

export function hasMapToken(config?: MapClientConfig | null) {
  return Boolean(getMapToken(config));
}
