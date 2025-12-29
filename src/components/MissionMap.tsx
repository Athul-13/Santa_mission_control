import { useEffect, useRef, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker, Line } from 'react-simple-maps';
import { useGeographicRoute } from '../contexts/GeographicRouteContext';
import { useSantaPosition } from '../contexts/SantaPositionContext';

// World map TopoJSON URL
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export function MissionMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [geographyCount, setGeographyCount] = useState(0);
  const [mapDimensions, setMapDimensions] = useState({ width: 800, height: 600 });
  const [showDebug, setShowDebug] = useState(true);
  
  // Map position and zoom state (controlled)
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({ 
    coordinates: [0, 20], 
    zoom: 1 
  });

  // Get geographic route from context
  const { route: geographicRoute } = useGeographicRoute();

  // Get Santa position from context (calculated in SantaPositionProviderWrapper)
  const santaPosition = useSantaPosition();

  // STEP 1: Verify container dimensions and update mapDimensions
  useEffect(() => {
    const checkDimensions = () => {
      if (mapContainerRef.current) {
        const rect = mapContainerRef.current.getBoundingClientRect();
        
        if (rect.width === 0 || rect.height === 0) {
          console.error('❌ CONTAINER HAS ZERO DIMENSIONS!');
        } else {
          setMapReady(true);
          setMapDimensions({ width: rect.width, height: rect.height });
        }
      }
    };
    
    checkDimensions();
    // Recheck on resize
    window.addEventListener('resize', checkDimensions);
    return () => window.removeEventListener('resize', checkDimensions);
  }, []);

  // STEP 2: Log map state when geographies load
  const handleGeographiesLoad = (geographies: unknown[]) => {
    console.log('🗺️ MAP STATE:');
    console.log('  - Geographies loaded:', geographies.length);
    console.log('✅ Map data loaded successfully');
    setGeographyCount(geographies.length);
  };

  return (
    <div className="flex-1 bg-slate-950/50 border border-slate-800/50 rounded-lg relative overflow-hidden w-full h-full">
      {/* Debug Info */}
      <div className="absolute top-2 left-2 z-20 font-mono text-xs text-slate-300 bg-slate-950/90 px-2 py-1.5 rounded border border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <span>Map Status: {mapReady ? 'READY' : 'LOADING...'}</span>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-cyan-400 hover:text-cyan-300 text-[10px] underline"
          >
            {showDebug ? 'Hide' : 'Show'} Debug
          </button>
        </div>
        {geographyCount > 0 && (
          <div className="mt-1 text-cyan-400">Countries: {geographyCount}</div>
        )}
        <div className="mt-1 text-slate-400 text-[10px]">
          Zoom: {Math.round(position.zoom * 100)}%
        </div>
        {showDebug && (
          <div className="mt-2 pt-2 border-t border-slate-700">
            <div className="text-cyan-400">Santa Position:</div>
            <div className="text-[10px]">
              Lat: {santaPosition.lat.toFixed(4)}
            </div>
            <div className="text-[10px]">
              Lng: {santaPosition.lng.toFixed(4)}
            </div>
            <div className="text-[10px] mt-1">
              Segment: {santaPosition.currentSegmentIndex} / {geographicRoute.points.length - 1}
            </div>
            <div className="text-[10px]">
              Progress: {(santaPosition.segmentProgress * 100).toFixed(1)}%
            </div>
            <div className="text-[10px]">
              Heading: {Math.round(santaPosition.heading)}°
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: Map Container - Fills entire component, no padding */}
      <div 
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          width: '100%',
          height: '100%',
        }}
      >
        <ComposableMap
          projectionConfig={{
            scale: 200,
            center: [0, 20],
          }}
          width={mapDimensions.width}
          height={mapDimensions.height}
          style={{ 
            width: '100%', 
            height: '100%',
            backgroundColor: 'transparent',
            display: 'block',
          }}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            minZoom={1.25}
            maxZoom={6}
            
            onMoveEnd={(newPosition: { coordinates?: [number, number]; zoom?: number }) => {
              if (newPosition) {
                setPosition(prev => ({
                  coordinates: newPosition.coordinates || prev.coordinates,
                  zoom: newPosition.zoom || prev.zoom,
                }));
              }
            }}
          >
            <Geographies 
              geography={geoUrl}
              onError={(error: unknown) => {
                console.error('❌ Map loading error:', error);
              }}
            >
              {({ geographies }: { geographies: unknown[] }) => {
                // STEP 3: Log map initialization (only once when loaded)
                if (geographies.length > 0 && geographyCount === 0) {
                  handleGeographiesLoad(geographies);
                }

                if (geographies.length === 0) {
                  return (
                    <text
                      x="50"
                      y="50"
                      textAnchor="middle"
                      fill="rgba(148, 163, 184, 0.5)"
                      fontSize="2"
                    >
                      Loading map...
                    </text>
                  );
                }

                return (geographies as Array<{ rsmKey: string }>).map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="rgba(34, 211, 238, 0.1)"
                    stroke="rgba(34, 211, 238, 0.8)"
                    strokeWidth={0.5}
                    style={{
                      default: { 
                        outline: 'none',
                        fill: 'rgba(34, 211, 238, 0.1)',
                        stroke: 'rgba(34, 211, 238, 0.8)',
                      },
                      hover: { 
                        outline: 'none', 
                        fill: 'rgba(34, 211, 238, 0.2)',
                        stroke: 'rgba(34, 211, 238, 1)',
                      },
                      pressed: { 
                        outline: 'none',
                        fill: 'rgba(34, 211, 238, 0.1)',
                        stroke: 'rgba(34, 211, 238, 0.8)',
                      },
                    }}
                  />
                ));
              }}
            </Geographies>

            {/* Route Polyline - Connect all route points */}
            <Line
              coordinates={geographicRoute.points.map((point) => [point.lng, point.lat])}
              stroke="rgba(34, 211, 238, 0.6)"
              strokeWidth={1.5}
              strokeDasharray="0"
            />

            {/* Route Points - Show as markers */}
            {geographicRoute.points.map((point, index) => (
              <Marker key={point.id} coordinates={[point.lng, point.lat]}>
                <circle
                  r={3}
                  fill={index <= santaPosition.currentSegmentIndex ? "rgba(34, 211, 238, 0.8)" : "rgba(148, 163, 184, 0.4)"}
                  stroke="rgba(34, 211, 238, 1)"
                  strokeWidth={0.5}
                />
                {showDebug && (
                  <text
                    textAnchor="middle"
                    y={-8}
                    style={{
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '8px',
                      fill: 'rgba(148, 163, 184, 0.8)',
                    }}
                  >
                    {point.name}
                  </text>
                )}
              </Marker>
            ))}

            {/* Santa Marker */}
            <Marker coordinates={[santaPosition.lng, santaPosition.lat]}>
              <g transform={`rotate(${santaPosition.heading})`}>
                {/* Santa icon - simple triangle pointing forward */}
                <path
                  d="M 0,-8 L -6,8 L 6,8 Z"
                  fill="rgba(239, 68, 68, 0.9)"
                  stroke="rgba(239, 68, 68, 1)"
                  strokeWidth={0.5}
                />
                {/* Glow effect */}
                <circle
                  r={10}
                  fill="rgba(239, 68, 68, 0.2)"
                />
              </g>
            </Marker>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
}
