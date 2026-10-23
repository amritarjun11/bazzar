/**
 * BazaarReels Map Configuration
 *
 * Current Provider: Leaflet + OpenStreetMap (no API key required, 100% free and open-source).
 * Final Build Ready: Built-in slot and configuration for Google Maps API Key when deploying to production.
 */

export interface MapConfig {
  // Active map provider: 'leaflet' (OpenStreetMap) or 'google'
  provider: 'leaflet' | 'google';

  // Google Maps API Key slot
  // You can set this in your .env file as VITE_GOOGLE_MAPS_API_KEY
  // or provide it here directly before the final production build.
  googleMapsApiKey: string;

  // Default coordinate center (Rewa, Madhya Pradesh)
  defaultCenter: {
    lat: number;
    lng: number;
  };

  // Default initial zoom level
  defaultZoom: number;

  // OpenStreetMap Tile Layer settings
  osm: {
    // Standard OpenStreetMap tiles
    standardUrl: string;
    // Dark mode tiles (CartoDB Dark Matter) for sleek dark UI integration
    darkModeUrl: string;
    // Voyager / Light tiles
    voyagerUrl: string;
    attribution: string;
  };
}

export const MAP_CONFIG: MapConfig = {
  // Active map provider: 'google' enabled by default with demo key, or 'leaflet' as zero-cost fallback
  provider: (import.meta.env.VITE_MAP_PROVIDER as 'leaflet' | 'google') || 'google',

  // Google Maps API key: uses provisioned demo key by default, easily replaceable with paid production key later
  googleMapsApiKey:
    (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
    'AIzaSyCpmNMs3vV8biT1W7NBePLByaDC3AmoLiA',

  defaultCenter: {
    lat: 24.5362,
    lng: 81.3037, // Rewa, MP coordinates
  },

  defaultZoom: 13,

  osm: {
    standardUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    darkModeUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    voyagerUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  },
};

/**
 * Helper to check if Google Maps key is configured and ready for final build
 */
export function hasGoogleMapsKey(): boolean {
  return Boolean(MAP_CONFIG.googleMapsApiKey && MAP_CONFIG.googleMapsApiKey.trim().length > 10);
}
