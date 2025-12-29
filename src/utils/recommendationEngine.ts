import { Route, Recommendation, RecommendationType } from '../types';
import { calculateRouteDistance } from './routeData';
import { optimizeRouteOrder, addWeatherDetour, createEfficiencyShortcut } from './routeOptimizer';

const RECOMMENDATION_TEMPLATES: Record<RecommendationType, {
  titles: string[];
  reasoning: string[];
}> = {
  'ROUTE OPTIMIZATION': {
    titles: [
      'Optimize Waypoint Sequence',
      'Reorganize Route for Efficiency',
      'Streamline Navigation Path',
    ],
    reasoning: [
      'Current route has inefficient waypoint ordering. Reordering could save significant time.',
      'Analysis shows a more optimal sequence exists that reduces total travel distance.',
      'Route can be optimized by reordering remaining waypoints for better efficiency.',
    ],
  },
  'WEATHER ADVISORY': {
    titles: [
      'Avoid Storm System',
      'Weather Detour Recommended',
      'Severe Weather Ahead',
    ],
    reasoning: [
      'Weather radar indicates severe conditions ahead. Detour recommended to avoid delays.',
      'Storm system detected in planned route. Adding waypoint to navigate around.',
      'Adverse weather conditions require route modification for safety.',
    ],
  },
  'LOGISTICS': {
    titles: [
      'Remove Unnecessary Waypoint',
      'Create Efficiency Shortcut',
      'Streamline Delivery Path',
    ],
    reasoning: [
      'Analysis shows one waypoint can be bypassed without affecting delivery schedule.',
      'Direct route available that eliminates unnecessary detour.',
      'Route optimization opportunity: remove intermediate waypoint for faster delivery.',
    ],
  },
  'SECURITY': {
    titles: [
      'Security Protocol Detour',
      'Alternative Route Recommended',
      'Enhanced Security Path',
    ],
    reasoning: [
      'Security protocols recommend alternative route for enhanced safety.',
      'Intelligence suggests using alternative path for mission security.',
      'Security analysis recommends route modification for operational safety.',
    ],
  },
};

/**
 * Analyze route and generate recommendations
 */
export function generateRecommendations(route: Route): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Check for route optimization opportunities
  if (route.currentPointIndex < route.points.length - 2) {
    const optimized = optimizeRouteOrder(route);
    const currentDistance = calculateRouteDistance(route.points);
    const optimizedDistance = calculateRouteDistance(optimized.points);

    if (optimizedDistance < currentDistance * 0.95) {
      const templates = RECOMMENDATION_TEMPLATES['ROUTE OPTIMIZATION'];
      const titleIndex = Math.floor(Math.random() * templates.titles.length);
      
      recommendations.push({
        id: `rec-${Date.now()}-${Math.random()}`,
        type: 'ROUTE OPTIMIZATION',
        title: templates.titles[titleIndex],
        reasoning: templates.reasoning[titleIndex],
        riskLevel: 'LOW',
        confidence: Math.floor(75 + Math.random() * 20),
        action: (r) => optimizeRouteOrder(r),
      });
    }
  }

  // Check for weather detour opportunities (random chance)
  if (Math.random() > 0.5 && route.currentPointIndex < route.points.length - 1) {
    const templates = RECOMMENDATION_TEMPLATES['WEATHER ADVISORY'];
    const titleIndex = Math.floor(Math.random() * templates.titles.length);
    
    recommendations.push({
      id: `rec-${Date.now()}-${Math.random()}`,
      type: 'WEATHER ADVISORY',
      title: templates.titles[titleIndex],
      reasoning: templates.reasoning[titleIndex],
      riskLevel: Math.random() > 0.7 ? 'MEDIUM' : 'LOW',
      confidence: Math.floor(60 + Math.random() * 30),
      action: (r) => addWeatherDetour(r),
    });
  }

  // Check for efficiency shortcuts
  if (route.currentPointIndex < route.points.length - 2) {
    const shortcut = createEfficiencyShortcut(route);
    if (shortcut.points.length < route.points.length) {
      const templates = RECOMMENDATION_TEMPLATES['LOGISTICS'];
      const titleIndex = Math.floor(Math.random() * templates.titles.length);
      
      recommendations.push({
        id: `rec-${Date.now()}-${Math.random()}`,
        type: 'LOGISTICS',
        title: templates.titles[titleIndex],
        reasoning: templates.reasoning[titleIndex],
        riskLevel: 'LOW',
        confidence: Math.floor(70 + Math.random() * 25),
        action: (r) => createEfficiencyShortcut(r),
      });
    }
  }

  // Occasionally add security recommendations
  if (Math.random() > 0.7) {
    const templates = RECOMMENDATION_TEMPLATES['SECURITY'];
    const titleIndex = Math.floor(Math.random() * templates.titles.length);
    
    recommendations.push({
      id: `rec-${Date.now()}-${Math.random()}`,
      type: 'SECURITY',
      title: templates.titles[titleIndex],
      reasoning: templates.reasoning[titleIndex],
      riskLevel: 'MEDIUM',
      confidence: Math.floor(65 + Math.random() * 20),
      action: (r) => addWeatherDetour(r),
    });
  }

  // Return 1-3 random recommendations
  const shuffled = recommendations.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(3, shuffled.length));
}

