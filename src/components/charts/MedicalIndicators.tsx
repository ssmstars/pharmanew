"use client";

import React from 'react';

interface MedicalIndicatorsProps {
  riskLabel: string;
  severity: string;
  confidence: number;
  variantsDetected: number;
  phenotype: string;
}

const MedicalIndicators: React.FC<MedicalIndicatorsProps> = ({
  riskLabel,
  severity,
  confidence,
  variantsDetected,
  phenotype
}) => {
  // Risk indicator colors and animations
  const getRiskIndicator = (risk: string) => {
    const indicators: Record<string, { color: string; pulse: boolean; bpm: string }> = {
      'Safe': { color: '#22C55E', pulse: false, bpm: '60-80' },
      'Adjust Dosage': { color: '#F59E0B', pulse: true, bpm: '80-100' },
      'Toxic': { color: '#DC2626', pulse: true, bpm: '120+' },
      'Ineffective': { color: '#EF4444', pulse: true, bpm: '40-60' },
      'Unknown': { color: '#6B7280', pulse: false, bpm: '---' }
    };
    return indicators[risk] || indicators['Unknown'];
  };

  const getSeverityBadge = (sev: string) => {
    const badges: Record<string, { bg: string; text: string; icon: string }> = {
      'none': { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: '○' },
      'low': { bg: 'bg-green-100', text: 'text-green-800', icon: '◔' },
      'moderate': { bg: 'bg-amber-100', text: 'text-amber-800', icon: '◑' },
      'high': { bg: 'bg-orange-100', text: 'text-orange-800', icon: '◕' },
      'critical': { bg: 'bg-red-100', text: 'text-red-800', icon: '●' }
    };
    return badges[sev] || badges['moderate'];
  };

  const getPhenotypeIndicator = (pheno: string) => {
    const indicators: Record<string, { level: number; label: string; color: string }> = {
      'PM': { level: 1, label: 'Poor', color: '#DC2626' },
      'IM': { level: 2, label: 'Intermediate', color: '#F97316' },
      'NM': { level: 3, label: 'Normal', color: '#22C55E' },
      'RM': { level: 4, label: 'Rapid', color: '#3B82F6' },
      'URM': { level: 5, label: 'Ultrarapid', color: '#8B5CF6' },
      'Unknown': { level: 0, label: 'Unknown', color: '#6B7280' }
    };
    return indicators[pheno] || indicators['Unknown'];
  };

  const riskInd = getRiskIndicator(riskLabel);
  const sevBadge = getSeverityBadge(severity);
  const phenoInd = getPhenotypeIndicator(phenotype);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Risk Monitor */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Risk Level</span>
          <div 
            className={`w-3 h-3 rounded-full ${riskInd.pulse ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: riskInd.color }}
          />
        </div>
        
        {/* ECG-style line */}
        <div className="relative h-12 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 40">
            <path
              d={riskLabel === 'Safe' 
                ? "M0,20 L20,20 L25,15 L30,25 L35,20 L100,20"
                : riskLabel === 'Toxic' || riskLabel === 'Ineffective'
                ? "M0,20 L15,20 L20,5 L25,35 L30,10 L35,30 L40,20 L55,20 L60,8 L65,32 L70,12 L75,28 L80,20 L100,20"
                : "M0,20 L25,20 L30,10 L35,30 L40,20 L65,20 L70,12 L75,28 L80,20 L100,20"
              }
              fill="none"
              stroke={riskInd.color}
              strokeWidth="2"
              className="animate-pulse"
            />
          </svg>
        </div>
        
        <div className="text-center">
          <span 
            className="text-lg font-bold"
            style={{ color: riskInd.color }}
          >
            {riskLabel}
          </span>
        </div>
      </div>

      {/* Severity Badge */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Severity</span>
        </div>
        
        <div className="flex items-center justify-center h-12">
          <div className={`px-4 py-2 rounded-full ${sevBadge.bg}`}>
            <span className={`text-lg font-semibold ${sevBadge.text}`}>
              {sevBadge.icon} {severity}
            </span>
          </div>
        </div>
        
        {/* Severity scale */}
        <div className="flex justify-center gap-1 mt-3">
          {['none', 'low', 'moderate', 'high', 'critical'].map((s, i) => (
            <div 
              key={s}
              className={`w-6 h-2 rounded-full transition-all ${s === severity ? 'scale-y-150' : 'opacity-30'}`}
              style={{ 
                backgroundColor: ['#22C55E', '#84CC16', '#F59E0B', '#F97316', '#DC2626'][i]
              }}
            />
          ))}
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Confidence</span>
          <span className="text-xs text-slate-400">{(confidence * 100).toFixed(0)}%</span>
        </div>
        
        {/* Circular progress */}
        <div className="flex justify-center">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="6"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#0891B2"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${confidence * 176} 176`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-700">
                {(confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-center text-xs text-slate-500 mt-2">Analysis Confidence</p>
      </div>

      {/* Phenotype Activity */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Metabolism</span>
        </div>
        
        {/* Activity bars */}
        <div className="flex justify-center items-end gap-1 h-12">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`w-4 rounded-t transition-all duration-500`}
              style={{
                height: `${level * 8}px`,
                backgroundColor: level <= phenoInd.level ? phenoInd.color : '#E5E7EB'
              }}
            />
          ))}
        </div>
        
        <div className="text-center mt-3">
          <span 
            className="text-sm font-semibold"
            style={{ color: phenoInd.color }}
          >
            {phenoInd.label}
          </span>
          <p className="text-xs text-slate-400">({phenotype})</p>
        </div>
      </div>

      {/* Variants Counter - Full width on mobile */}
      <div className="col-span-2 md:col-span-4 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-xl p-4 border border-cyan-200">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-cyan-600 uppercase tracking-wider">Genetic Variants Analyzed</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-cyan-800">{variantsDetected}</span>
              <span className="text-sm text-cyan-600">variants detected in VCF</span>
            </div>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(variantsDetected, 10) }).map((_, i) => (
              <div 
                key={i}
                className="w-2 h-8 bg-cyan-500 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
            {variantsDetected > 10 && (
              <span className="text-cyan-600 text-sm self-center ml-1">+{variantsDetected - 10}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalIndicators;
