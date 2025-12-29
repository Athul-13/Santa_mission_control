import { GeographicRoute, NavPoint } from '../types';
import { calculateGeographicDistance } from './geographicRouteData';
import { RecommendationType } from '../types';

/**
 * Optimize route by reordering waypoints for efficiency using geographic distances
 */
export function optimizeGeographicRouteOrder(route: GeographicRoute): GeographicRoute {
  if (route.points.length <= 2) return route;

  // For now, we'll optimize the entire route
  // In a real scenario, we'd preserve visited points
  const remaining = [...route.points];

  if (remaining.length <= 1) return route;

  // Simple nearest-neighbor heuristic
  const optimized: NavPoint[] = [];
  let current = remaining[0];
  optimized.push(current);
  const unvisited = remaining.slice(1);

  while (unvisited.length > 0) {
    // Find nearest unvisited point
    let nearestIndex = 0;
    let nearestDistance = calculateGeographicDistance(current, unvisited[0]);

    for (let i = 1; i < unvisited.length; i++) {
      const dist = calculateGeographicDistance(current, unvisited[i]);
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearestIndex = i;
      }
    }

    const next = unvisited.splice(nearestIndex, 1)[0];
    optimized.push(next);
    current = next;
  }

  return {
    ...route,
    id: `geo-route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    points: optimized,
  };
}

/**
 * Add detour waypoint to avoid weather (geographic version)
 */
export function addGeographicWeatherDetour(route: GeographicRoute): GeographicRoute {
  if (route.points.length < 2) return route;

  const newPoints = [...route.points];

  // Find a segment to add detour to (middle segment)
  const segmentIndex = Math.floor((route.points.length - 1) / 2);
  if (segmentIndex >= newPoints.length - 1) {
    return route;
  }

  const p1 = newPoints[segmentIndex];
  const p2 = newPoints[segmentIndex + 1];

  // Calculate midpoint
  const midLat = (p1.lat + p2.lat) / 2;
  const midLng = (p1.lng + p2.lng) / 2;

  // Calculate perpendicular direction (for detour offset)
  // Convert to approximate local coordinates
  const dLat = p2.lat - p1.lat;
  const dLng = p2.lng - p1.lng;
  const segmentLength = Math.sqrt(dLat * dLat + dLng * dLng);

  if (segmentLength === 0) return route;

  // Perpendicular vector (swap and negate one component)
  const perpLat = -dLng / segmentLength;
  const perpLng = dLat / segmentLength;

  // Offset by 2-4 degrees (roughly 200-400km at equator)
  const offset = 2 + Math.random() * 2;
  const detourPoint: NavPoint = {
    id: `detour-${Date.now()}`,
    name: 'Weather Detour',
    lat: midLat + perpLat * offset,
    lng: midLng + perpLng * offset,
    airspace: p1.airspace,
  };

  // Insert detour point
  newPoints.splice(segmentIndex + 1, 0, detourPoint);

  return {
    ...route,
    id: `geo-route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    points: newPoints,
  };
}

/**
 * Remove unnecessary waypoints and create shortcuts (geographic version)
 */
export function createGeographicEfficiencyShortcut(route: GeographicRoute): GeographicRoute {
  if (route.points.length <= 3) return route;

  const newPoints = [...route.points];

  // Find a segment where we can skip the middle point
  for (let i = 0; i < newPoints.length - 2; i++) {
    const p1 = newPoints[i];
    const p2 = newPoints[i + 1];
    const p3 = newPoints[i + 2];

    const directDistance = calculateGeographicDistance(p1, p3);
    const viaDistance =
      calculateGeographicDistance(p1, p2) + calculateGeographicDistance(p2, p3);

    // If direct path is significantly shorter (15% savings), remove middle point
    if (directDistance < viaDistance * 0.85) {
      newPoints.splice(i + 1, 1);
      break; // Only remove one point per optimization
    }
  }

  return {
    ...route,
    id: `geo-route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    points: newPoints,
  };
}

/**
 * Apply route modification based on recommendation type (geographic version)
 */
export function applyGeographicRouteModification(
  route: GeographicRoute,
  type: RecommendationType
): GeographicRoute {
  switch (type) {
    case 'ROUTE OPTIMIZATION':
      return optimizeGeographicRouteOrder(route);
    case 'WEATHER ADVISORY':
      return addGeographicWeatherDetour(route);
    case 'LOGISTICS':
      return createGeographicEfficiencyShortcut(route);
    case 'SECURITY':
      // Security recommendations might add waypoints for safer routes
      return addGeographicWeatherDetour(route); // Similar to weather detour
    default:
      return route;
  }
}

