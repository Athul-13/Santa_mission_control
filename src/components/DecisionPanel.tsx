import { useState } from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { RiskLevel } from '../types';
import { useGeographicRoute, GeographicRecommendation } from '../contexts/GeographicRouteContext';
import { useActivityFeedContext } from '../contexts/ActivityFeedContext';

const RISK_COLORS: Record<RiskLevel, { text: string; bg: string; border: string }> = {
  LOW: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-950/30',
    border: 'border-emerald-500/30',
  },
  MEDIUM: {
    text: 'text-amber-400',
    bg: 'bg-amber-950/30',
    border: 'border-amber-500/30',
  },
  HIGH: {
    text: 'text-red-400',
    bg: 'bg-red-950/30',
    border: 'border-red-500/30',
  },
};

export function DecisionPanel() {
  const { recommendations, applyRecommendation } = useGeographicRoute();
  const { addEvent } = useActivityFeedContext();
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const handleApply = (recommendation: GeographicRecommendation) => {
    setApplyingId(recommendation.id);
    
    // Apply recommendation
    applyRecommendation(recommendation);
    
    // Add success event
    addEvent({
      type: 'Route',
      severity: 'SUCCESS',
      message: `Route updated: ${recommendation.title}`,
    });

    // Remove applying state after animation
    setTimeout(() => {
      setApplyingId(null);
    }, 300);
  };

  return (
    <div className="w-96 bg-slate-950/50 border-l border-slate-800/50 flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800/50">
        <div className="text-sm text-slate-100 uppercase tracking-wider">OPERATIONS CENTER</div>
        <div className="text-xs text-slate-500 mt-1">System Recommendations</div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-slate-600 text-sm">No active recommendations</div>
            <div className="text-slate-700 text-sm mt-2">All systems nominal</div>
          </div>
        ) : (
          recommendations.map((rec) => {
            const riskColors = RISK_COLORS[rec.riskLevel];
            const isApplying = applyingId === rec.id;

            return (
              <div
                key={rec.id}
                className={`bg-slate-900/50 border border-slate-800/50 rounded-lg p-4 hover:border-slate-700/50 transition-all ${
                  isApplying ? 'opacity-50 scale-95' : ''
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                      {rec.type}
                    </div>
                    <div className="text-base text-slate-100">{rec.title}</div>
                  </div>
                  <div
                    className={`px-2 py-1 border rounded text-xs flex items-center gap-1 ${riskColors.text} ${riskColors.bg} ${riskColors.border}`}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {rec.riskLevel}
                  </div>
                </div>

                {/* Card Body */}
                <div className="text-sm text-slate-400 mb-4">{rec.reasoning}</div>

                {/* Card Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Confidence:</span>
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 transition-all duration-300"
                        style={{ width: `${rec.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {rec.confidence}%
                    </span>
                  </div>
                  <button
                    onClick={() => handleApply(rec)}
                    disabled={isApplying}
                    className="group bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded text-white text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    Apply
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

