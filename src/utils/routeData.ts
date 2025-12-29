import { RoutePoint, Route } from '../types';

// Pool of cities worldwide with coordinates
export const CITY_POOL: Omit<RoutePoint, 'id'>[] = [
  { name: 'North Pacific', x: 15, y: 30, airspace: 'North Pacific Sector' },
  { name: 'Tokyo', x: 30, y: 25, airspace: 'Asia-Pacific Sector' },
  { name: 'Shanghai', x: 32, y: 28, airspace: 'Asia-Pacific Sector' },
  { name: 'New Delhi', x: 45, y: 35, airspace: 'South Asia Sector' },
  { name: 'Moscow', x: 55, y: 25, airspace: 'Eastern Europe Sector' },
  { name: 'Berlin', x: 65, y: 30, airspace: 'Central Europe Sector' },
  { name: 'London', x: 75, y: 35, airspace: 'Western Europe Sector' },
  { name: 'New York', x: 85, y: 40, airspace: 'North Atlantic Sector' },
  { name: 'Los Angeles', x: 12, y: 38, airspace: 'Pacific Sector' },
  { name: 'Sydney', x: 35, y: 55, airspace: 'Oceania Sector' },
  { name: 'Cairo', x: 58, y: 42, airspace: 'Middle East Sector' },
  { name: 'Rio de Janeiro', x: 75, y: 60, airspace: 'South America Sector' },
  { name: 'Toronto', x: 80, y: 32, airspace: 'North America Sector' },
  { name: 'Dubai', x: 62, y: 38, airspace: 'Middle East Sector' },
  { name: 'Singapore', x: 38, y: 32, airspace: 'Southeast Asia Sector' },
  { name: 'Paris', x: 68, y: 32, airspace: 'Western Europe Sector' },
  { name: 'Mexico City', x: 20, y: 42, airspace: 'Central America Sector' },
  { name: 'Buenos Aires', x: 78, y: 62, airspace: 'South America Sector' },
  { name: 'Cape Town', x: 62, y: 68, airspace: 'Africa Sector' },
  { name: 'Seoul', x: 33, y: 28, airspace: 'Asia-Pacific Sector' },
  { name: 'Bangkok', x: 40, y: 35, airspace: 'Southeast Asia Sector' },
  { name: 'Istanbul', x: 60, y: 32, airspace: 'Eastern Europe Sector' },
  { name: 'Lagos', x: 58, y: 48, airspace: 'Africa Sector' },
  { name: 'Jakarta', x: 42, y: 38, airspace: 'Southeast Asia Sector' },
];

/**
 * Generate a random route from the city pool
 */
export function generateRandomRoute(): Route {
  // Select 6-8 random cities
  const numPoints = Math.floor(Math.random() * 3) + 6; // 6-8 points
  const shuffled = [...CITY_POOL].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, numPoints);

  const points: RoutePoint[] = selected.map((city, index) => ({
    ...city,
    id: `point-${index}`,
    eta: generateETA(index),
  }));

  return {
    id: `route-${Date.now()}`,
    points,
    currentPointIndex: 0,
    progress: 0,
  };
}

/**
 * Generate ETA string for a route point
 */
function generateETA(index: number): string {
  const hours = Math.floor(Math.random() * 12) + index * 2;
  const minutes = Math.floor(Math.random() * 60);
  const hour24 = (hours % 24).toString().padStart(2, '0');
  const minStr = minutes.toString().padStart(2, '0');
  return `${hour24}:${minStr} UTC`;
}

/**
 * Calculate distance between two points (simple Euclidean)
 */
export function calculateDistance(p1: RoutePoint, p2: RoutePoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate total route distance
 */
export function calculateRouteDistance(points: RoutePoint[]): number {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += calculateDistance(points[i], points[i + 1]);
  }
  return total;
}

/**
 * Interpolate between two points
 */
export function interpolatePoint(
  p1: RoutePoint,
  p2: RoutePoint,
  t: number
): { x: number; y: number } {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  };
}

/**
 * Calculate heading angle between two points (in degrees)
 */
export function calculateHeading(p1: RoutePoint, p2: RoutePoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

