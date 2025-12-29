export interface RoutePoint {
  id: string;
  name: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  airspace?: string;
  eta?: string;
}

export interface Route {
  id: string;
  points: RoutePoint[];
  currentPointIndex: number;
  progress: number; // 0-100
}

export type MissionStatus = 'NORMAL' | 'CAUTION' | 'RISK';

export type RecommendationType = 
  | 'ROUTE OPTIMIZATION' 
  | 'WEATHER ADVISORY' 
  | 'LOGISTICS' 
  | 'SECURITY';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  reasoning: string;
  riskLevel: RiskLevel;
  confidence: number; // 0-100
  action: (route: Route) => Route; // Function to modify route
}

export type EventType = 'Region' | 'Anomaly' | 'Recommendation' | 'Route';
export type EventSeverity = 'INFO' | 'WARNING' | 'SUCCESS';

export interface ActivityEvent {
  id: string;
  type: EventType;
  severity: EventSeverity;
  message: string;
  timestamp: Date;
}

export interface SantaPosition {
  x: number; // percentage
  y: number; // percentage
  currentSegmentIndex: number;
  segmentProgress: number; // 0-100 within current segment
  heading: number; // degrees
}

// Geographic navigation types (for map-space coordinates)
export interface NavPoint {
  id: string;
  name: string;
  lat: number; // latitude (-90 to 90)
  lng: number; // longitude (-180 to 180)
  airspace?: string;
  eta?: string;
}

export interface GeographicRoute {
  id: string;
  points: NavPoint[];
}

export interface GeographicSantaPosition {
  lat: number; // latitude
  lng: number; // longitude
  currentSegmentIndex: number;
  segmentProgress: number; // 0-1 within current segment
  heading: number; // degrees (0-360, 0 = North)
}

