import { NavPoint, GeographicRoute } from '../types';

/**
 * Geographic city pool with real lat/lng coordinates
 * These are real-world cities visible on the map
 */
export const GEOGRAPHIC_CITIES: Omit<NavPoint, 'id'>[] = [
  // Europe
  { name: 'London', lat: 51.5074, lng: -0.1278, airspace: 'Western Europe Sector' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, airspace: 'Western Europe Sector' },
  { name: 'Berlin', lat: 52.5200, lng: 13.4050, airspace: 'Central Europe Sector' },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173, airspace: 'Eastern Europe Sector' },
  { name: 'Rome', lat: 41.9028, lng: 12.4964, airspace: 'Southern Europe Sector' },
  
  // Middle East
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, airspace: 'Middle East Sector' },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357, airspace: 'Middle East Sector' },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784, airspace: 'Eastern Europe Sector' },
  
  // Asia
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, airspace: 'Asia-Pacific Sector' },
  { name: 'Shanghai', lat: 31.2304, lng: 121.4737, airspace: 'Asia-Pacific Sector' },
  { name: 'New Delhi', lat: 28.6139, lng: 77.2090, airspace: 'South Asia Sector' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, airspace: 'Southeast Asia Sector' },
  { name: 'Seoul', lat: 37.5665, lng: 126.9780, airspace: 'Asia-Pacific Sector' },
  { name: 'Bangkok', lat: 13.7563, lng: 100.5018, airspace: 'Southeast Asia Sector' },
  
  // North America
  { name: 'New York', lat: 40.7128, lng: -74.0060, airspace: 'North Atlantic Sector' },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, airspace: 'Pacific Sector' },
  { name: 'Toronto', lat: 43.6532, lng: -79.3832, airspace: 'North America Sector' },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332, airspace: 'Central America Sector' },
  
  // South America
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, airspace: 'South America Sector' },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, airspace: 'South America Sector' },
  
  // Africa
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241, airspace: 'Africa Sector' },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792, airspace: 'Africa Sector' },
  
  // Oceania
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, airspace: 'Oceania Sector' },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456, airspace: 'Southeast Asia Sector' },
];

/**
 * Calculate Haversine distance between two geographic points (in kilometers)
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate distance between two NavPoints using Haversine formula
 */
export function calculateGeographicDistance(point1: NavPoint, point2: NavPoint): number {
  return haversineDistance(point1.lat, point1.lng, point2.lat, point2.lng);
}

/**
 * Generate a dynamic random route from the city pool
 * Selects 6-10 cities and orders them logically (west to east or similar progression)
 */
export function generateGeographicRoute(): GeographicRoute {
  // Select random number of cities (6-10)
  const numPoints = Math.floor(Math.random() * 5) + 6;
  
  // Shuffle and select cities
  const shuffled = [...GEOGRAPHIC_CITIES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, numPoints);

  // Sort selected cities by longitude (west to east) for logical progression
  const sorted = selected.sort((a, b) => {
    // Handle longitude wrap-around (e.g., -180 to 180)
    const lngA = a.lng < 0 ? a.lng + 360 : a.lng;
    const lngB = b.lng < 0 ? b.lng + 360 : b.lng;
    return lngA - lngB;
  });

  // Create route points with IDs
  const routePoints: NavPoint[] = sorted.map((city, index) => ({
    ...city,
    id: `nav-${index + 1}-${Date.now()}`,
  }));

  return {
    id: `geo-route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    points: routePoints,
  };
}

/**
 * Linear interpolation between two geographic points
 * Handles longitude wrap-around when crossing the International Date Line (180°/-180°)
 * @param start Starting point
 * @param end Ending point
 * @param t Progress (0-1)
 * @returns Interpolated lat/lng
 */
export function interpolateGeographicPoint(
  start: NavPoint,
  end: NavPoint,
  t: number
): { lat: number; lng: number } {
  // Latitude interpolation is straightforward
  const lat = start.lat + (end.lat - start.lat) * t;

  // Longitude interpolation - handle wrap-around across date line
  let deltaLng = end.lng - start.lng;
  
  // If the absolute difference is > 180°, we need to go the "long way around"
  // This happens when crossing the International Date Line
  if (Math.abs(deltaLng) > 180) {
    // Adjust deltaLng to take the shorter path around the world
    // If deltaLng is positive and > 180, subtract 360 to go west
    // If deltaLng is negative and < -180, add 360 to go east
    if (deltaLng > 0) {
      deltaLng -= 360;
    } else {
      deltaLng += 360;
    }
  }

  // Interpolate longitude
  let lng = start.lng + deltaLng * t;

  // Normalize longitude to [-180, 180] range
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;

  return { lat, lng };
}

/**
 * Calculate heading (bearing) from point A to point B in degrees
 * 0 = North, 90 = East, 180 = South, 270 = West
 */
export function calculateGeographicHeading(start: NavPoint, end: NavPoint): number {
  const lat1 = (start.lat * Math.PI) / 180;
  const lat2 = (end.lat * Math.PI) / 180;
  
  // Handle longitude wrap-around for heading calculation
  let deltaLng = end.lng - start.lng;
  if (Math.abs(deltaLng) > 180) {
    // Take the shorter path around the world
    if (deltaLng > 0) {
      deltaLng -= 360;
    } else {
      deltaLng += 360;
    }
  }
  
  const deltaLngRad = (deltaLng * Math.PI) / 180;

  const x = Math.sin(deltaLngRad) * Math.cos(lat2);
  const y =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLngRad);

  let bearing = (Math.atan2(x, y) * 180) / Math.PI;
  bearing = (bearing + 360) % 360; // Normalize to 0-360

  return bearing;
}

