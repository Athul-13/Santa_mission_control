import { useState, useEffect, useRef, useCallback } from 'react';
import { Route, SantaPosition } from '../types';
import { interpolatePoint, calculateHeading, calculateDistance } from '../utils/routeData';

const DEBUG = false; // Set to true for debug logs

/**
 * Pure movement logic hook - ONE source of truth for Santa's position
 * 
 * This hook:
 * - Owns segment index and progress
 * - Calculates position ONLY from route + segment + progress
 * - Handles route changes by re-anchoring to new route
 * - NEVER uses GSAP or visual interpolation
 */
export function useSantaMovementLogic(route: Route) {
  const [position, setPosition] = useState<SantaPosition>(() => {
    if (route.points.length === 0) {
      return { x: 50, y: 50, currentSegmentIndex: 0, segmentProgress: 0, heading: 0 };
    }
    const firstPoint = route.points[0];
    return {
      x: firstPoint.x,
      y: firstPoint.y,
      currentSegmentIndex: 0,
      segmentProgress: 0,
      heading: route.points.length > 1 ? calculateHeading(route.points[0], route.points[1]) : 0,
    };
  });

  const routeRef = useRef(route);
  const isPausedRef = useRef(false);

  /**
   * Find the closest point on a route to a given position
   * Returns: { segmentIndex, progress (0-100) }
   */
  const findClosestSegment = useCallback((targetX: number, targetY: number, routePoints: typeof route.points) => {
    if (routePoints.length < 2) {
      return { segmentIndex: 0, progress: 0 };
    }

    let closestSegment = 0;
    let closestProgress = 0;
    let minDistance = Infinity;

    // Check each segment
    for (let i = 0; i < routePoints.length - 1; i++) {
      const p1 = routePoints[i];
      const p2 = routePoints[i + 1];

      // Project target point onto this segment
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);

      if (segmentLength === 0) continue;

      // Vector from p1 to target
      const toTargetX = targetX - p1.x;
      const toTargetY = targetY - p1.y;

      // Project onto segment direction
      const t = Math.max(0, Math.min(1, (toTargetX * dx + toTargetY * dy) / (segmentLength * segmentLength)));

      // Calculate projected point
      const projectedX = p1.x + t * dx;
      const projectedY = p1.y + t * dy;

      // Distance from target to projected point
      const distX = targetX - projectedX;
      const distY = targetY - projectedY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < minDistance) {
        minDistance = distance;
        closestSegment = i;
        closestProgress = t * 100;
      }
    }

    return { segmentIndex: closestSegment, progress: closestProgress };
  }, []);

  /**
   * Re-anchor Santa to a new route
   * Finds the closest point on the new route and continues from there
   */
  const reanchorToRoute = useCallback((newRoute: Route, oldPosition: SantaPosition) => {
    if (newRoute.points.length === 0) return oldPosition;

    if (DEBUG) {
      console.log('[SANTA] Route changed - re-anchoring', {
        oldRouteId: routeRef.current.id,
        newRouteId: newRoute.id,
        oldPosition: { x: oldPosition.x, y: oldPosition.y },
        oldSegment: oldPosition.currentSegmentIndex,
      });
    }

    // Find closest segment on new route
    const { segmentIndex, progress } = findClosestSegment(
      oldPosition.x,
      oldPosition.y,
      newRoute.points
    );

    // Calculate position on new segment
    const segmentStart = newRoute.points[segmentIndex];
    const segmentEnd = newRoute.points[segmentIndex + 1];

    if (!segmentStart || !segmentEnd) {
      // Fallback to first point
      return {
        x: newRoute.points[0].x,
        y: newRoute.points[0].y,
        currentSegmentIndex: 0,
        segmentProgress: 0,
        heading: newRoute.points.length > 1
          ? calculateHeading(newRoute.points[0], newRoute.points[1])
          : 0,
      };
    }

    const t = progress / 100;
    const newPosition = interpolatePoint(segmentStart, segmentEnd, t);
    const newHeading = calculateHeading(segmentStart, segmentEnd);

    if (DEBUG) {
      console.log('[SANTA] Re-anchored', {
        newSegment: segmentIndex,
        newProgress: progress.toFixed(1),
        newPosition: { x: newPosition.x.toFixed(2), y: newPosition.y.toFixed(2) },
        newHeading: newHeading.toFixed(1),
      });
    }

    return {
      x: newPosition.x,
      y: newPosition.y,
      currentSegmentIndex: segmentIndex,
      segmentProgress: progress,
      heading: newHeading,
    };
  }, [findClosestSegment]);

  // Handle route changes - CRITICAL: This must run BEFORE movement tick
  useEffect(() => {
    const oldRoute = routeRef.current;
    const routeChanged = oldRoute.id !== route.id;

    if (routeChanged) {
      if (DEBUG) {
        console.log('[SANTA] Route change detected', {
          oldId: oldRoute.id,
          newId: route.id,
          oldPoints: oldRoute.points.length,
          newPoints: route.points.length,
        });
      }

      // Pause movement during re-anchoring
      isPausedRef.current = true;

      setPosition((prev) => {
        const reanchored = reanchorToRoute(route, prev);
        // Resume movement after re-anchoring
        setTimeout(() => {
          isPausedRef.current = false;
        }, 0);
        return reanchored;
      });
    }

    routeRef.current = route;
  }, [route.id, route, reanchorToRoute]);

  // Movement tick - runs every 50ms, ONLY updates position based on current route
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
            x: lastPoint.x,
            y: lastPoint.y,
            currentSegmentIndex: currentSegmentIndex,
            segmentProgress: 100,
            heading: prev.heading, // Keep last heading
          };
        }

        // Move 0.5% closer to next point
        segmentProgress += 0.5;

        // Check if we've completed this segment
        if (segmentProgress >= 100) {
          currentSegmentIndex = Math.min(
            currentSegmentIndex + 1,
            currentRoute.points.length - 1
          );
          segmentProgress = 0;

          if (DEBUG && currentSegmentIndex < currentRoute.points.length - 1) {
            console.log('[SANTA] Segment completed', {
              from: currentSegmentIndex - 1,
              to: currentSegmentIndex,
              nextPoint: currentRoute.points[currentSegmentIndex + 1]?.name,
            });
          }
        }

        // Get current segment points
        const currentPoint = currentRoute.points[currentSegmentIndex];
        const nextPoint = currentRoute.points[currentSegmentIndex + 1];

        if (!currentPoint || !nextPoint) {
          return prev;
        }

        // Calculate position from segment + progress (THIS IS THE ONLY SOURCE OF TRUTH)
        const t = segmentProgress / 100;
        const interpolated = interpolatePoint(currentPoint, nextPoint, t);

        // Calculate heading from current segment (ALWAYS from segment, never from previous)
        const heading = calculateHeading(currentPoint, nextPoint);

        // Only log heading changes if significant
        if (DEBUG && Math.abs(heading - prev.heading) > 5) {
          console.log('[SANTA] Heading changed', {
            old: prev.heading.toFixed(1),
            new: heading.toFixed(1),
            segment: currentSegmentIndex,
          });
        }

        return {
          x: interpolated.x,
          y: interpolated.y,
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

