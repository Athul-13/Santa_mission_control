import { Globe, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { MissionStatus } from '../types';
import { useGeographicRoute } from '../contexts/GeographicRouteContext';
import { useSantaPosition } from '../contexts/SantaPositionContext';
import { useMissionStatus } from '../hooks/useMissionStatus';

export function MissionHeader() {
  const { route } = useGeographicRoute();
  const santaPosition = useSantaPosition();
  const status = useMissionStatus();

  // Get current and next points based on Santa's current segment
  const currentPoint = route.points[santaPosition.currentSegmentIndex];
  const nextPoint = route.points[santaPosition.currentSegmentIndex + 1];

  const getStatusConfig = (status: MissionStatus) => {
    switch (status) {
      case 'NORMAL':
        return {
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-950/30',
          icon: CheckCircle2,
          iconColor: 'text-emerald-400',
          text: 'NOMINAL',
          textColor: 'text-emerald-400',
        };
      case 'CAUTION':
        return {
          border: 'border-amber-500/30',
          bg: 'bg-amber-950/30',
          icon: AlertCircle,
          iconColor: 'text-amber-400',
          text: 'CAUTION',
          textColor: 'text-amber-400',
        };
      case 'RISK':
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-950/30',
          icon: AlertCircle,
          iconColor: 'text-red-400',
          text: 'ALERT',
          textColor: 'text-red-400',
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed top-0 left-0 right-0 h-auto bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/50 px-8 py-4 z-50">
      <div className="flex items-center justify-between">
        {/* Section 1: Current Airspace */}
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              CURRENT AIRSPACE
            </div>
            <div className="text-base text-slate-100 tracking-wide">
              {currentPoint?.airspace || 'Unknown Sector'}
            </div>
          </div>
        </div>

        {/* Section 2: Next Destination */}
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              NEXT DESTINATION
            </div>
            <div className="text-base text-slate-100">
              {nextPoint ? (
                <>
                  {nextPoint.name} • ETA {nextPoint.eta || '--:-- UTC'}
                </>
              ) : (
                <span className="text-slate-400">Mission Complete</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Mission Status */}
        <div
          className={`rounded-lg px-2 py-2 border ${statusConfig.border} ${statusConfig.bg} flex items-center gap-2`}
        >
          <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
          <span className={`text-sm font-medium ${statusConfig.textColor}`}>
            {statusConfig.text}
          </span>
        </div>
      </div>
    </div>
  );
}

