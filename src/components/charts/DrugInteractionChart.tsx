"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

interface InteractionPair {
  drug_a: string;
  drug_b: string;
  severity: string;
}

interface DrugInteractionChartProps {
  interactions: InteractionPair[];
  drugs: string[];
}

const DrugInteractionChart: React.FC<DrugInteractionChartProps> = ({ interactions, drugs }) => {
  // Map severity to numeric values and colors
  const severityMap: Record<string, { value: number; color: string }> = {
    'LOW': { value: 25, color: '#22C55E' },
    'MODERATE': { value: 50, color: '#F59E0B' },
    'HIGH': { value: 75, color: '#F97316' },
    'SEVERE': { value: 100, color: '#DC2626' }
  };

  // Create data for the chart
  const data = interactions.map((pair, index) => ({
    name: `${pair.drug_a.slice(0, 3)}-${pair.drug_b.slice(0, 3)}`,
    fullName: `${pair.drug_a} ↔ ${pair.drug_b}`,
    severity: pair.severity,
    value: severityMap[pair.severity]?.value || 50,
    color: severityMap[pair.severity]?.color || '#6B7280'
  }));

  // If no interactions, show a placeholder
  if (data.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-emerald-50 rounded-lg border border-emerald-200">
        <div className="text-center">
          <div className="text-4xl mb-2">✓</div>
          <p className="text-emerald-700 font-medium">No Drug Interactions Detected</p>
          <p className="text-emerald-600 text-sm">The selected medications appear safe to combine</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-medium text-slate-900">{data.fullName}</p>
          <p className="text-sm" style={{ color: data.color }}>
            Severity: {data.severity}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => {
                if (value === 25) return 'Low';
                if (value === 50) return 'Mod';
                if (value === 75) return 'High';
                if (value === 100) return 'Severe';
                return '';
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={50} stroke="#F59E0B" strokeDasharray="5 5" />
            <ReferenceLine y={75} stroke="#F97316" strokeDasharray="5 5" />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-3 flex-wrap">
        {Object.entries(severityMap).map(([key, { color }]) => (
          <div key={key} className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-slate-600">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrugInteractionChart;
