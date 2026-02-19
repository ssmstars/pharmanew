"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface RiskGaugeProps {
  riskLabel: string;
  confidenceScore: number;
  severity: string;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ riskLabel, confidenceScore, severity }) => {
  // Map risk labels to numerical values for the gauge
  const riskValues: Record<string, number> = {
    'Safe': 20,
    'Adjust Dosage': 50,
    'Unknown': 50,
    'Ineffective': 75,
    'Toxic': 95
  };

  const riskColors: Record<string, string> = {
    'Safe': '#10B981',
    'Adjust Dosage': '#F59E0B',
    'Unknown': '#6B7280',
    'Ineffective': '#EF4444',
    'Toxic': '#DC2626'
  };

  const severityColors: Record<string, string> = {
    'none': '#10B981',
    'low': '#22C55E',
    'moderate': '#F59E0B',
    'high': '#F97316',
    'critical': '#DC2626'
  };

  const value = riskValues[riskLabel] || 50;
  const color = riskColors[riskLabel] || '#6B7280';
  const sevColor = severityColors[severity] || '#6B7280';

  // Create gauge data - filled portion and empty portion
  const data = [
    { name: 'risk', value: value },
    { name: 'remaining', value: 100 - value }
  ];

  const COLORS = [color, '#F1F5F9'];

  return (
    <div className="flex flex-col items-center w-full">
      {/* Gauge container */}
      <div className="relative w-full" style={{ height: '120px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius="65%"
              outerRadius="95%"
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center label inside gauge */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center">
          <div 
            className="text-2xl font-bold leading-tight"
            style={{ color }}
          >
            {riskLabel}
          </div>
        </div>
      </div>

      {/* Stats below gauge */}
      <div className="mt-4 flex items-center justify-center gap-4 w-full">
        {/* Confidence */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
          <svg className="w-4 h-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold text-slate-700">
            {(confidenceScore * 100).toFixed(0)}%
          </span>
        </div>
        
        {/* Severity */}
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: `${sevColor}20` }}
        >
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: sevColor }}
          />
          <span 
            className="text-sm font-semibold capitalize"
            style={{ color: sevColor }}
          >
            {severity}
          </span>
        </div>
      </div>

      {/* Scale legend */}
      <div className="mt-4 w-full">
        <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 opacity-60" />
        <div className="flex justify-between text-xs text-slate-400 mt-1.5 px-1">
          <span>Safe</span>
          <span>Moderate</span>
          <span>High Risk</span>
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
