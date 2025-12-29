import { Route, RoutePoint, RecommendationType } from '../types';
import { calculateRouteDistance, calculateDistance } from './routeData';

/**
 * Optimize route by reordering waypoints for efficiency
 */
export function optimizeRouteOrder(route: Route): Route {
  if (route.points.length <= 2) return route;

  const currentIndex = route.currentPointIndex;
  const visited = route.points.slice(0, currentIndex + 1);
  const remaining = route.points.slice(currentIndex + 1);

  if (remaining.length <= 1) return route;

  // Simple nearest-neighbor heuristic for remaining points
  const optimized: RoutePoint[] = [];
  let current = visited[visited.length - 1];
  const unvisited = [...remaining];

  while (unvisited.length > 0) {
    // Find nearest unvisited point
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(current, unvisited[0]);

    for (let i = 1; i < unvisited.length; i++) {
      const dist = calculateDistance(current, unvisited[i]);
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
    points: [...visited, ...optimized],
  };
}

/**
 * Add detour waypoints to avoid weather
 */
export function addWeatherDetour(route: Route): Route {
  if (route.points.length < 2) return route;

  const currentIndex = route.currentPointIndex;
  const newPoints = [...route.points];

  // Find a segment to add detour to (after current position)
  if (currentIndex < newPoints.length - 1) {
    const segmentIndex = currentIndex;
    const p1 = newPoints[segmentIndex];
    const p2 = newPoints[segmentIndex + 1];

    // Create detour point (offset perpendicular to route)
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const perpX = -dy / length;
    const perpY = dx / length;

    // Offset by 8-12% in perpendicular direction
    const offset = 8 + Math.random() * 4;
    const detourPoint: RoutePoint = {
      id: `detour-${Date.now()}`,
      name: 'Weather Detour',
      x: (p1.x + p2.x) / 2 + perpX * offset,
      y: (p1.y + p2.y) / 2 + perpY * offset,
      airspace: p1.airspace,
    };

    // Insert detour point
    newPoints.splice(segmentIndex + 1, 0, detourPoint);
  }

  return {
    ...route,
    points: newPoints,
  };
}

/**
 * Remove unnecessary waypoints and create shortcuts
 */
export function createEfficiencyShortcut(route: Route): Route {
  if (route.points.length <= 3) return route;

  const currentIndex = route.currentPointIndex;
  const newPoints = [...route.points];

  // Remove a waypoint after current position if it creates a shorter path
  if (currentIndex < newPoints.length - 2) {
    const p1 = newPoints[currentIndex];
    const p2 = newPoints[currentIndex + 1];
    const p3 = newPoints[currentIndex + 2];

    const directDistance = calculateDistance(p1, p3);
    const viaDistance = calculateDistance(p1, p2) + calculateDistance(p2, p3);

    // If direct path is significantly shorter, remove middle point
    if (directDistance < viaDistance * 0.85) {
      newPoints.splice(currentIndex + 1, 1);
    }
  }

  return {
    ...route,
    points: newPoints,
  };
}

/**
 * Apply route modification based on recommendation type
 */
export function applyRouteModification(
  route: Route,
  type: RecommendationType
): Route {
  switch (type) {
    case 'ROUTE OPTIMIZATION':
      return optimizeRouteOrder(route);
    case 'WEATHER ADVISORY':
      return addWeatherDetour(route);
    case 'LOGISTICS':
      return createEfficiencyShortcut(route);
    case 'SECURITY':
      // Security recommendations might add waypoints for safer routes
      return addWeatherDetour(route); // Similar to weather detour
    default:
      return route;
  }
}

