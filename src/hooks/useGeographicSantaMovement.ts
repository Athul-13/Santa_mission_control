import { useState, useEffect, useRef } from 'react';
import { GeographicRoute, GeographicSantaPosition } from '../types';
import { interpolateGeographicPoint, calculateGeographicHeading } from '../utils/geographicRouteData';

/**
 * Movement logic hook for geographic (lat/lng) coordinates
 * 
 * This hook:
 * - Owns segment index and progress
 * - Calculates position ONLY from route + segment + progress in lat/lng space
 * - Handles route changes by re-anchoring to new route
 * - Updates position on a fixed interval (50ms)
 */
export function useGeographicSantaMovement(route: GeographicRoute) {
  const [position, setPosition] = useState<GeographicSantaPosition>(() => {
    if (route.points.length === 0) {
      return { lat: 0, lng: 0, currentSegmentIndex: 0, segmentProgress: 0, heading: 0 };
    }
    const firstPoint = route.points[0];
    const heading =
      route.points.length > 1
        ? calculateGeographicHeading(route.points[0], route.points[1])
        : 0;
    return {
      lat: firstPoint.lat,
      lng: firstPoint.lng,
      currentSegmentIndex: 0,
      segmentProgress: 0,
      heading,
    };
  });

  const routeRef = useRef(route);
  const isPausedRef = useRef(false);

  // Handle route changes - re-anchor Santa to the new route
  useEffect(() => {
    if (routeRef.current.id === route.id) {
      routeRef.current = route;
      return;
    }

    // Route changed - find closest point on new route using Haversine distance
    const oldRouteId = routeRef.current.id;
    const currentPos = position;
    
    console.log(`🔄 ROUTE CHANGE DETECTED:`);
    console.log(`  Old Route ID: ${oldRouteId}`);
    console.log(`  New Route ID: ${route.id}`);
    console.log(`  Santa Position Before: lat=${currentPos.lat.toFixed(4)}, lng=${currentPos.lng.toFixed(4)}`);

    let closestSegmentIndex = 0;
    let closestDistance = Infinity;
    let closestPointOnSegment: { lat: number; lng: number } | null = null;

    // Import Haversine distance function
    const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
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
    };

    // Find closest point on each segment
    for (let i = 0; i < route.points.length - 1; i++) {
      const start = route.points[i];
      const end = route.points[i + 1];

      // Calculate distance to start and end points
      const distToStart = haversineDistance(currentPos.lat, currentPos.lng, start.lat, start.lng);
      const distToEnd = haversineDistance(currentPos.lat, currentPos.lng, end.lat, end.lng);

      // Find closest point on the segment (simplified: check start, end, and midpoint)
      let minDist = Math.min(distToStart, distToEnd);
      let closestPoint: { lat: number; lng: number } = distToStart < distToEnd 
        ? { lat: start.lat, lng: start.lng } 
        : { lat: end.lat, lng: end.lng };

      // Check midpoint
      const midLat = (start.lat + end.lat) / 2;
      const midLng = (start.lng + end.lng) / 2;
      const distToMid = haversineDistance(currentPos.lat, currentPos.lng, midLat, midLng);
      
      if (distToMid < minDist) {
        minDist = distToMid;
        closestPoint = { lat: midLat, lng: midLng };
      }

      if (minDist < closestDistance) {
        closestDistance = minDist;
        closestSegmentIndex = i;
        closestPointOnSegment = closestPoint;
      }
    }

    // Re-anchor to closest segment
    const anchorPoint = closestPointOnSegment || route.points[closestSegmentIndex];
    const heading =
      closestSegmentIndex < route.points.length - 1
        ? calculateGeographicHeading(
            route.points[closestSegmentIndex],
            route.points[closestSegmentIndex + 1]
          )
        : position.heading;

    console.log(`  Re-anchored to segment ${closestSegmentIndex}`);
    console.log(`  Santa Position After: lat=${anchorPoint.lat.toFixed(4)}, lng=${anchorPoint.lng.toFixed(4)}`);
    console.log(`  Distance to closest segment: ${closestDistance.toFixed(2)} km`);

    setPosition({
      lat: anchorPoint.lat,
      lng: anchorPoint.lng,
      currentSegmentIndex: closestSegmentIndex,
      segmentProgress: 0,
      heading,
    });

    routeRef.current = route;
  }, [route.id, route, position]);

  // Movement tick - runs every 50ms, updates position based on current route
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPausedRef.current) return;

      const currentRoute = routeRef.current;
      if (currentRoute.points.length === 0) return;

      setPosition((prev) => {
        let { currentSegmentIndex, segmentProgress } = prev;

        // Check if we've reached the end
        if (currentSegmentIndex >= currentRoute.points.length - 1) {
          const lastPoint = currentRoute.points[currentRoute.points.length - 1];
          return {
            ...prev,
            lat: lastPoint.lat,
            lng: lastPoint.lng,
            currentSegmentIndex: currentSegmentIndex,
            segmentProgress: 1,
            heading: prev.heading, // Keep last heading
          };
        }

        // Move 0.5% closer to next point (0.005 per tick, 50ms = 20 ticks/sec = 10% per second)
        segmentProgress += 0.005;

        // Check if we've completed this segment
        if (segmentProgress >= 1) {
          currentSegmentIndex = Math.min(
            currentSegmentIndex + 1,
            currentRoute.points.length - 1
          );
          segmentProgress = 0;
        }

        // Get current segment points
        const currentPoint = currentRoute.points[currentSegmentIndex];
        const nextPoint = currentRoute.points[currentSegmentIndex + 1];

        if (!currentPoint || !nextPoint) {
          return prev;
        }

        // Calculate position from segment + progress (THIS IS THE ONLY SOURCE OF TRUTH)
        const interpolated = interpolateGeographicPoint(currentPoint, nextPoint, segmentProgress);
        const heading = calculateGeographicHeading(currentPoint, nextPoint);

        return {
          lat: interpolated.lat,
          lng: interpolated.lng,
          currentSegmentIndex,
          segmentProgress,
          heading,
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return position;
}

