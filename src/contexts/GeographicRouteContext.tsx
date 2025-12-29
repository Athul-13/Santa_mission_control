import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GeographicRoute, RecommendationType } from '../types';
import { generateGeographicRoute } from '../utils/geographicRouteData';
import { generateGeographicRecommendations } from '../utils/geographicRecommendationEngine';

// Geographic version of Recommendation
export interface GeographicRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  reasoning: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number; // 0-100
  action: (route: GeographicRoute) => GeographicRoute; // Function to modify route
}

interface GeographicRouteContextType {
  route: GeographicRoute;
  recommendations: GeographicRecommendation[];
  updateRoute: (newRoute: GeographicRoute) => void;
  applyRecommendation: (recommendation: GeographicRecommendation) => void;
  refreshRecommendations: () => void;
}

const GeographicRouteContext = createContext<GeographicRouteContextType | undefined>(undefined);

export function GeographicRouteProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<GeographicRoute>(() => generateGeographicRoute());
  const [recommendations, setRecommendations] = useState<GeographicRecommendation[]>([]);

  // Generate initial recommendations
  useEffect(() => {
    const initialRecs = generateGeographicRecommendations(route);
    setRecommendations(initialRecs);
  }, []);

  // Refresh recommendations periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRecommendations((prev) => {
        // Only refresh if we have fewer than 3 recommendations
        if (prev.length < 3) {
          return generateGeographicRecommendations(route);
        }
        return prev;
      });
    }, 18000); // Every 18 seconds

    return () => clearInterval(interval);
  }, [route]);

  const updateRoute = useCallback((newRoute: GeographicRoute) => {
    setRoute(newRoute);
    // Generate new recommendations based on updated route
    setTimeout(() => {
      setRecommendations(generateGeographicRecommendations(newRoute));
    }, 500);
  }, []);

  const applyRecommendation = useCallback((recommendation: GeographicRecommendation) => {
    // Apply the recommendation's action to modify route
    const modifiedRoute = recommendation.action(route);
    // Create new route with new ID to trigger movement logic re-anchoring
    const updatedRoute: GeographicRoute = {
      ...modifiedRoute,
      id: `geo-route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // NEW ID - triggers re-anchoring
    };
    
    console.log(`✅ RECOMMENDATION APPLIED: ${recommendation.title}`);
    console.log(`  Route ID changed: ${route.id} → ${updatedRoute.id}`);
    
    updateRoute(updatedRoute);

    // Remove the applied recommendation
    setRecommendations((prev) => prev.filter((r) => r.id !== recommendation.id));
  }, [route, updateRoute]);

  const refreshRecommendations = useCallback(() => {
    setRecommendations(generateGeographicRecommendations(route));
  }, [route]);

  return (
    <GeographicRouteContext.Provider
      value={{
        route,
        recommendations,
        updateRoute,
        applyRecommendation,
        refreshRecommendations,
      }}
    >
      {children}
    </GeographicRouteContext.Provider>
  );
}

export function useGeographicRoute() {
  const context = useContext(GeographicRouteContext);
  if (context === undefined) {
    throw new Error('useGeographicRoute must be used within a GeographicRouteProvider');
  }
  return context;
}

