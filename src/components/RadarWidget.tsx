import { Radio } from 'lucide-react';
import { Radar, RadarBlip } from './Radar';
import { useActivityFeedContext } from '../contexts/ActivityFeedContext';

export function RadarWidget() {
  const { addEvent } = useActivityFeedContext();

  const handleBlipDetected = (blip: RadarBlip) => {
    // Add activity event when blip is detected
    addEvent({
      type: 'Anomaly',
      severity: 'INFO',
      message: `Sensor detection: ${blip.intensity > 0.8 ? 'Strong' : blip.intensity > 0.5 ? 'Moderate' : 'Weak'} signal at ${blip.distance.toFixed(1)} range`,
    });
  };

  return (
    <div className="absolute bottom-6 right-[416px] w-64 h-64 bg-slate-950/80 backdrop-blur-sm border border-slate-800/50 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-slate-300 uppercase tracking-wider">SENSORS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-slate-500 font-mono">ACTIVE</span>
        </div>
      </div>

      {/* Radar Display */}
      <div className="flex items-center justify-center">
        <Radar
          radius={80}
          sweepSpeed={60}
          blipInterval={2000}
          blipProbability={0.25}
          blipLifetime={5000}
          maxBlips={6}
          onBlipDetected={handleBlipDetected}
          className=""
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 font-mono text-xs text-slate-500">
        <span>RANGE: 500km</span>
        <span>SCAN: ACTIVE</span>
      </div>
    </div>
  );
}

