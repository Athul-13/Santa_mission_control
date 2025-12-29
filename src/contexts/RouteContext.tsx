import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Route, Recommendation } from '../types';
import { generateRandomRoute } from '../utils/routeData';
import { generateRecommendations } from '../utils/recommendationEngine';

interface RouteContextType {
  route: Route;
  recommendations: Recommendation[];
  updateRoute: (newRoute: Route) => void;
  updateRouteProgress: (currentPointIndex: number, progress: number) => void;
  applyRecommendation: (recommendation: Recommendation) => void;
  refreshRecommendations: () => void;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<Route>(() => generateRandomRoute());
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // Generate initial recommendations
  useEffect(() => {
    const initialRecs = generateRecommendations(route);
    setRecommendations(initialRecs);
  }, []);

  // Refresh recommendations periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRecommendations((prev) => {
        // Only refresh if we have fewer than 3 recommendations
        if (prev.length < 3) {
          return generateRecommendations(route);
        }
        return prev;
      });
    }, 18000); // Every 18 seconds

    return () => clearInterval(interval);
  }, [route]);

  const updateRoute = useCallback((newRoute: Route) => {
    setRoute(newRoute);
    // Generate new recommendations based on updated route
    setTimeout(() => {
      setRecommendations(generateRecommendations(newRoute));
    }, 500);
  }, []);

  const updateRouteProgress = useCallback((currentPointIndex: number, progress: number) => {
    setRoute((prev) => ({
      ...prev,
      currentPointIndex,
      progress,
    }));
  }, []);

  const applyRecommendation = useCallback((recommendation: Recommendation) => {
    // Apply the recommendation's action to modify route
    const modifiedRoute = recommendation.action(route);
    // Create new route with new ID to trigger movement logic re-anchoring
    // Movement logic will find closest point on new route automatically
    const updatedRoute: Route = {
      ...modifiedRoute,
      id: `route-${Date.now()}`, // NEW ID - triggers re-anchoring in movement logic
      currentPointIndex: 0, // Reset - movement logic will recalculate
      progress: 0, // Reset - movement logic will recalculate
    };
    updateRoute(updatedRoute);

    // Remove the applied recommendation
    setRecommendations((prev) => prev.filter((r) => r.id !== recommendation.id));
  }, [route, updateRoute]);

  const refreshRecommendations = useCallback(() => {
    setRecommendations(generateRecommendations(route));
  }, [route]);

  return (
    <RouteContext.Provider
      value={{
        route,
        recommendations,
        updateRoute,
        updateRouteProgress,
        applyRecommendation,
        refreshRecommendations,
      }}
    >
      {children}
    </RouteContext.Provider>
  );
}

export function useRoute() {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return context;
}

