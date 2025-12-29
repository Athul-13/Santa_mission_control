import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

/**
 * Represents a detection blip on the radar display
 */
export interface RadarBlip {
  /** Unique identifier for the blip */
  id: string;
  /** Angle in degrees (0-360, 0 = top, clockwise) */
  angle: number;
  /** Distance from center (0 = center, 1 = edge) */
  distance: number;
  /** Intensity value (0-1), affects size and brightness */
  intensity: number;
  /** Age in milliseconds since creation */
  age: number;
}

/**
 * Props for the Radar component
 */
export interface RadarProps {
  /** Radius of the radar display in pixels (default: 200) */
  radius?: number;
  /** Speed of sweep rotation in degrees per second (default: 60) */
  sweepSpeed?: number;
  /** Interval between new blip generation attempts in milliseconds (default: 2000) */
  blipInterval?: number;
  /** Probability of generating a blip each interval, 0-1 (default: 0.3) */
  blipProbability?: number;
  /** Duration blips persist before fading out in milliseconds (default: 5000) */
  blipLifetime?: number;
  /** Maximum number of blips on screen simultaneously (default: 8) */
  maxBlips?: number;
  /** Callback fired when sweep line passes over a blip (within 5 degrees) */
  onBlipDetected?: (blip: RadarBlip) => void;
  /** Custom className for additional styling */
  className?: string;
}

/**
 * Self-contained, reusable radar component for mission control / submarine radar systems.
 * 
 * Features:
 * - Continuous clockwise sweep rotation
 * - Randomly generated blips with configurable spawn rate
 * - Blips fade out smoothly over their lifetime
 * - Sweep line highlights blips as it passes over them
 * - Event callback when blips are detected by sweep
 * - Fully configurable parameters
 * 
 * @example
 * ```tsx
 * <Radar
 *   radius={200}
 *   sweepSpeed={60}
 *   blipInterval={2000}
 *   blipProbability={0.3}
 *   onBlipDetected={(blip) => console.log('Detected!', blip)}
 * />
 * ```
 */

export function Radar({
  radius = 200,
  sweepSpeed = 60, // 60 degrees per second = 6 seconds per full rotation
  blipInterval = 2000,
  blipProbability = 0.3,
  blipLifetime = 5000,
  maxBlips = 8,
  onBlipDetected,
  className = '',
}: RadarProps) {
  const [sweepAngle, setSweepAngle] = useState(0);
  const [blips, setBlips] = useState<RadarBlip[]>([]);
  const sweepLineRef = useRef<SVGLineElement>(null);
  const sweepGlowRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastBlipCheckRef = useRef<number>(0);

  // Rotate sweep line continuously
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      setSweepAngle((prev) => {
        const newAngle = (prev + sweepSpeed * deltaTime) % 360;
        return newAngle;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sweepSpeed]);

  // Animate sweep line and glow
  useEffect(() => {
    if (sweepLineRef.current && sweepGlowRef.current) {
      const centerX = radius;
      const centerY = radius;
      const angleRad = (sweepAngle * Math.PI) / 180;

      // Update sweep line
      gsap.to(sweepLineRef.current, {
        attr: {
          x2: centerX + Math.sin(angleRad) * radius,
          y2: centerY - Math.cos(angleRad) * radius,
        },
        duration: 0.05,
        ease: 'none',
      });

      // Update sweep glow (trailing fade)
      const sweepGlowPath = `M ${centerX} ${centerY} L ${centerX + Math.sin(angleRad) * radius} ${centerY - Math.cos(angleRad) * radius} L ${centerX + Math.sin((sweepAngle - 15) * Math.PI / 180) * radius} ${centerY - Math.cos((sweepAngle - 15) * Math.PI / 180) * radius} Z`;
      gsap.to(sweepGlowRef.current, {
        attr: { d: sweepGlowPath },
        duration: 0.05,
        ease: 'none',
      });
    }
  }, [sweepAngle, radius]);

  // Generate new blips at random intervals
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < blipProbability && blips.length < maxBlips) {
        const newBlip: RadarBlip = {
          id: `blip-${Date.now()}-${Math.random()}`,
          angle: Math.random() * 360,
          distance: 0.2 + Math.random() * 0.7, // 20% to 90% from center
          intensity: 0.5 + Math.random() * 0.5, // 0.5 to 1.0
          age: 0,
        };

        setBlips((prev) => [...prev, newBlip]);
      }
    }, blipInterval);

    return () => clearInterval(interval);
  }, [blipProbability, blipInterval, maxBlips, blips.length]);

  // Age blips and remove expired ones
  useEffect(() => {
    const interval = setInterval(() => {
      setBlips((prev) => {
        const updated = prev
          .map((blip) => ({
            ...blip,
            age: blip.age + 100,
          }))
          .filter((blip) => blip.age < blipLifetime);

        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [blipLifetime]);

  // Check if sweep passes over blips and trigger detection
  useEffect(() => {
    const currentTime = Date.now();
    if (currentTime - lastBlipCheckRef.current < 50) return; // Throttle checks
    lastBlipCheckRef.current = currentTime;

    blips.forEach((blip) => {
      // Calculate angle difference (handle wrap-around)
      let angleDiff = Math.abs(sweepAngle - blip.angle);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;

      // If sweep is within 5 degrees of blip, trigger detection
      if (angleDiff < 5 && onBlipDetected) {
        onBlipDetected(blip);
      }
    });
  }, [sweepAngle, blips, onBlipDetected]);

  // Convert polar coordinates to cartesian
  const polarToCartesian = useCallback(
    (angle: number, distance: number) => {
      const angleRad = (angle * Math.PI) / 180;
      const r = distance * radius;
      return {
        x: radius + Math.sin(angleRad) * r,
        y: radius - Math.cos(angleRad) * r,
      };
    },
    [radius]
  );

  // Calculate blip opacity based on age
  const getBlipOpacity = useCallback(
    (blip: RadarBlip) => {
      const fadeStart = blipLifetime * 0.7; // Start fading at 70% of lifetime
      if (blip.age < fadeStart) return 1;
      const fadeProgress = (blip.age - fadeStart) / (blipLifetime - fadeStart);
      return Math.max(0, 1 - fadeProgress);
    },
    [blipLifetime]
  );

  // Calculate blip size based on intensity
  const getBlipSize = useCallback((intensity: number) => {
    return 3 + intensity * 5; // 3-8px radius
  }, []);

  const diameter = radius * 2;
  const centerX = radius;
  const centerY = radius;

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: diameter, height: diameter }}
    >
      <svg
        width={diameter}
        height={diameter}
        className="absolute inset-0"
        viewBox={`0 0 ${diameter} ${diameter}`}
      >
        <defs>
          {/* Radial gradient for background */}
          <radialGradient id="radar-bg-gradient">
            <stop offset="0%" stopColor="rgba(15, 23, 42, 0.8)" />
            <stop offset="100%" stopColor="rgba(2, 6, 23, 0.95)" />
          </radialGradient>

          {/* Glow filter for sweep line */}
          <filter id="sweep-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow filter for blips */}
          <filter id="blip-glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="url(#radar-bg-gradient)"
          stroke="rgba(51, 65, 85, 0.4)"
          strokeWidth="1"
        />

        {/* Concentric circles (range rings) */}
        {[0.25, 0.5, 0.75, 1.0].map((scale) => (
          <circle
            key={scale}
            cx={centerX}
            cy={centerY}
            r={radius * scale}
            fill="none"
            stroke="rgba(71, 85, 105, 0.3)"
            strokeWidth="0.5"
          />
        ))}

        {/* Crosshairs */}
        <line
          x1={centerX}
          y1={0}
          x2={centerX}
          y2={diameter}
          stroke="rgba(71, 85, 105, 0.3)"
          strokeWidth="0.5"
        />
        <line
          x1={0}
          y1={centerY}
          x2={diameter}
          y2={centerY}
          stroke="rgba(71, 85, 105, 0.3)"
          strokeWidth="0.5"
        />

        {/* Sweep glow (trailing fade) */}
        <path
          ref={sweepGlowRef}
          fill="rgba(34, 211, 238, 0.1)"
          opacity="0.6"
        />

        {/* Sweep line */}
        <line
          ref={sweepLineRef}
          x1={centerX}
          y1={centerY}
          x2={centerX}
          y2={centerY}
          stroke="rgba(34, 211, 238, 0.9)"
          strokeWidth="1.5"
          filter="url(#sweep-glow)"
        />

        {/* Blips */}
        {blips.map((blip) => {
          const pos = polarToCartesian(blip.angle, blip.distance);
          const opacity = getBlipOpacity(blip);
          const size = getBlipSize(blip.intensity);
          const isHighlighted = Math.abs(sweepAngle - blip.angle) < 5 || Math.abs(sweepAngle - blip.angle) > 355;

          return (
            <g key={blip.id}>
              {/* Blip glow ring (pulses when highlighted) */}
              {isHighlighted && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size + 3}
                  fill="none"
                  stroke="rgba(34, 211, 238, 0.8)"
                  strokeWidth="1"
                  opacity={opacity}
                  className="animate-pulse"
                />
              )}
              {/* Blip circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={size}
                fill={`rgba(34, 211, 238, ${0.7 * opacity})`}
                stroke={`rgba(103, 232, 249, ${0.9 * opacity})`}
                strokeWidth="1"
                filter="url(#blip-glow)"
                opacity={opacity}
              />
            </g>
          );
        })}

        {/* Center dot */}
        <circle
          cx={centerX}
          cy={centerY}
          r="2"
          fill="rgba(34, 211, 238, 0.8)"
          stroke="rgba(103, 232, 249, 1)"
          strokeWidth="0.5"
          filter="url(#blip-glow)"
        />
      </svg>

      {/* Optional: Range labels */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 font-mono text-xs text-slate-500">
        RANGE: {radius}px
      </div>
    </div>
  );
}

