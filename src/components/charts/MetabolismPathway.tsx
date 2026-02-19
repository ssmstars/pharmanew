"use client";

import React from 'react';

interface MetabolismPathwayProps {
  drug: string;
  gene: string;
  phenotype: string;
  riskLabel: string;
}

const MetabolismPathway: React.FC<MetabolismPathwayProps> = ({ 
  drug, 
  gene, 
  phenotype, 
  riskLabel 
}) => {
  // Get activity level based on phenotype
  const getActivityLevel = (phenotype: string) => {
    const levels: Record<string, { level: string; width: string; color: string }> = {
      'PM': { level: '▂', width: '20%', color: '#DC2626' },
      'IM': { level: '▃▃', width: '40%', color: '#F97316' },
      'NM': { level: '▅▅▅', width: '70%', color: '#22C55E' },
      'RM': { level: '▆▆▆▆', width: '85%', color: '#3B82F6' },
      'URM': { level: '█████', width: '100%', color: '#8B5CF6' },
      'Unknown': { level: '???', width: '50%', color: '#6B7280' }
    };
    return levels[phenotype] || levels['Unknown'];
  };

  const activity = getActivityLevel(phenotype);

  // Get outcome based on risk label
  const getOutcome = (risk: string) => {
    const outcomes: Record<string, { icon: string; text: string; color: string }> = {
      'Safe': { icon: '✓', text: 'Normal Response Expected', color: '#22C55E' },
      'Adjust Dosage': { icon: '⚠', text: 'Dose Adjustment Needed', color: '#F59E0B' },
      'Toxic': { icon: '☠', text: 'Toxicity Risk - Avoid', color: '#DC2626' },
      'Ineffective': { icon: '✗', text: 'Reduced Efficacy - Alternative Needed', color: '#EF4444' },
      'Unknown': { icon: '?', text: 'Response Uncertain', color: '#6B7280' }
    };
    return outcomes[risk] || outcomes['Unknown'];
  };

  const outcome = getOutcome(riskLabel);

  return (
    <div className="w-full p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
      {/* Pathway visualization */}
      <div className="flex items-center justify-between gap-2 mb-6">
        {/* Drug */}
        <div className="flex-1 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-cyan-100 border-2 border-cyan-300 flex items-center justify-center">
            <span className="text-2xl">💊</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700">{drug}</p>
          <p className="text-xs text-slate-500">Drug</p>
        </div>

        {/* Arrow 1 */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="text-slate-400 text-lg">→</div>
          <span className="text-xs text-slate-400">metabolized by</span>
        </div>

        {/* Gene/Enzyme */}
        <div className="flex-1 text-center">
          <div 
            className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center border-2"
            style={{ 
              backgroundColor: `${activity.color}20`,
              borderColor: activity.color
            }}
          >
            <span className="text-2xl">🧬</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700">{gene}</p>
          <p className="text-xs text-slate-500">{phenotype}</p>
        </div>

        {/* Arrow 2 */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="text-slate-400 text-lg">→</div>
          <span className="text-xs text-slate-400">produces</span>
        </div>

        {/* Outcome */}
        <div className="flex-1 text-center">
          <div 
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2"
            style={{ 
              backgroundColor: `${outcome.color}20`,
              borderColor: outcome.color
            }}
          >
            <span className="text-2xl">{outcome.icon}</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700">{riskLabel}</p>
          <p className="text-xs text-slate-500">Outcome</p>
        </div>
      </div>

      {/* Enzyme activity bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">Enzyme Activity</span>
          <span 
            className="font-semibold"
            style={{ color: activity.color }}
          >
            {phenotype}
          </span>
        </div>
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: activity.width,
              backgroundColor: activity.color
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Low</span>
          <span>Normal</span>
          <span>High</span>
        </div>
      </div>

      {/* Clinical outcome */}
      <div 
        className="mt-4 p-3 rounded-lg border"
        style={{ 
          backgroundColor: `${outcome.color}10`,
          borderColor: `${outcome.color}40`
        }}
      >
        <p 
          className="text-sm font-medium"
          style={{ color: outcome.color }}
        >
          {outcome.text}
        </p>
      </div>
    </div>
  );
};

export default MetabolismPathway;
