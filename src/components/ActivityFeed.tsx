import { useEffect, useRef } from 'react';
import { MapPin, AlertCircle, Activity, Navigation } from 'lucide-react';
import { EventType, EventSeverity } from '../types';
import { useActivityFeedContext } from '../contexts/ActivityFeedContext';

const EVENT_ICONS: Record<EventType, typeof MapPin> = {
  Region: MapPin,
  Anomaly: AlertCircle,
  Recommendation: Activity,
  Route: Navigation,
};

const SEVERITY_COLORS: Record<EventSeverity, { text: string; bg: string }> = {
  INFO: { text: 'text-cyan-400', bg: 'bg-cyan-950/30' },
  WARNING: { text: 'text-amber-400', bg: 'bg-amber-950/30' },
  SUCCESS: { text: 'text-emerald-400', bg: 'bg-emerald-950/30' },
};

function formatTime(date: Date): string {
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function ActivityFeed() {
  const { events } = useActivityFeedContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="h-48 bg-slate-950/50 border-t border-slate-800/50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/50">
        <span className="text-sm text-slate-100 uppercase tracking-wider">MISSION ACTIVITY</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">LIVE FEED</span>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Scrollable Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-3 space-y-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {events.map((event) => {
          const Icon = EVENT_ICONS[event.type];
          const colors = SEVERITY_COLORS[event.severity];

          return (
            <div
              key={event.id}
              className="flex items-start gap-3 py-2 border-l-2 border-slate-800 pl-3 hover:border-cyan-500/50 transition-colors"
            >
              <div className={`w-7 h-7 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-400">{event.message}</div>
                <div className="text-xs text-slate-600 font-mono mt-0.5">
                  {formatTime(event.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

