import { useState, useEffect, useRef } from 'react';
import { Route, SantaPosition } from '../types';
import { interpolatePoint, calculateHeading } from '../utils/routeData';

export function useSantaPosition(route: Route) {
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
  const positionRef = useRef(position);

  // Update route ref when route changes
  useEffect(() => {
    routeRef.current = route;
    
    // If route changed, smoothly transition Santa to new position
    const currentPoint = route.points[route.currentPointIndex];
    if (currentPoint) {
      setPosition((prev) => ({
        ...prev,
        x: currentPoint.x,
        y: currentPoint.y,
        currentSegmentIndex: route.currentPointIndex,
        segmentProgress: 0,
        heading: route.points.length > route.currentPointIndex + 1
          ? calculateHeading(currentPoint, route.points[route.currentPointIndex + 1])
          : prev.heading,
      }));
    }
  }, [route.id]); // Only react to route ID changes (new route)

  // Update position every 50ms
  useEffect(() => {
    const interval = setInterval(() => {
      const currentRoute = routeRef.current;
      if (currentRoute.points.length === 0) return;

      setPosition((prev) => {
        let { currentSegmentIndex, segmentProgress } = prev;

        // Check if we need to move to next segment
        if (currentSegmentIndex >= currentRoute.points.length - 1) {
          // Reached end, stay at last point
          const lastPoint = currentRoute.points[currentRoute.points.length - 1];
          return {
            ...prev,
            x: lastPoint.x,
            y: lastPoint.y,
            currentSegmentIndex: currentSegmentIndex,
            segmentProgress: 100,
          };
        }

        // Move 0.5% closer to next point
        segmentProgress += 0.5;

        if (segmentProgress >= 100) {
          // Move to next segment
          currentSegmentIndex = Math.min(
            currentSegmentIndex + 1,
            currentRoute.points.length - 1
          );
          segmentProgress = 0;
        }

        const currentPoint = currentRoute.points[currentSegmentIndex];
        const nextPoint = currentRoute.points[currentSegmentIndex + 1];

        if (!currentPoint || !nextPoint) {
          return prev;
        }

        const t = segmentProgress / 100;
        const interpolated = interpolatePoint(currentPoint, nextPoint, t);
        const heading = calculateHeading(currentPoint, nextPoint);

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

