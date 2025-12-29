/**
 * Example usage of the Radar component
 * 
 * This demonstrates how to use the self-contained Radar component
 * with various configurations and event handling.
 */

import { Radar, RadarBlip } from './Radar';

export function RadarExample() {
  const handleBlipDetected = (blip: RadarBlip) => {
    console.log('Blip detected!', {
      angle: blip.angle.toFixed(1),
      distance: blip.distance.toFixed(2),
      intensity: blip.intensity.toFixed(2),
    });
    // You can trigger alerts, update state, etc.
  };

  return (
    <div className="p-8 space-y-8 bg-slate-950">
      {/* Default radar */}
      <div>
        <h2 className="text-slate-300 mb-4">Default Radar</h2>
        <Radar />
      </div>

      {/* Fast scanning radar with more blips */}
      <div>
        <h2 className="text-slate-300 mb-4">Fast Scan (High Activity)</h2>
        <Radar
          radius={150}
          sweepSpeed={120}
          blipInterval={1000}
          blipProbability={0.5}
          maxBlips={12}
          onBlipDetected={handleBlipDetected}
        />
      </div>

      {/* Slow, careful scanning */}
      <div>
        <h2 className="text-slate-300 mb-4">Slow Scan (Precise Monitoring)</h2>
        <Radar
          radius={250}
          sweepSpeed={30}
          blipInterval={5000}
          blipProbability={0.1}
          blipLifetime={8000}
          maxBlips={5}
        />
      </div>

      {/* Compact radar for sidebar */}
      <div>
        <h2 className="text-slate-300 mb-4">Compact Sidebar Radar</h2>
        <Radar
          radius={100}
          sweepSpeed={45}
          blipInterval={3000}
          blipProbability={0.2}
          className="border border-slate-800 rounded-lg p-4 bg-slate-900/50"
        />
      </div>
    </div>
  );
}

