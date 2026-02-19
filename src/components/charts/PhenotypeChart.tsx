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
  LabelList
} from 'recharts';

interface PhenotypeChartProps {
  currentPhenotype: string;
}

const PhenotypeChart: React.FC<PhenotypeChartProps> = ({ currentPhenotype }) => {
  // Phenotype distribution data (typical population frequencies)
  const phenotypes = [
    { name: 'PM', label: 'Poor', frequency: 7, description: 'Poor Metabolizer' },
    { name: 'IM', label: 'Inter', frequency: 15, description: 'Intermediate Metabolizer' },
    { name: 'NM', label: 'Normal', frequency: 60, description: 'Normal Metabolizer' },
    { name: 'RM', label: 'Rapid', frequency: 12, description: 'Rapid Metabolizer' },
    { name: 'URM', label: 'Ultra', frequency: 6, description: 'Ultrarapid Metabolizer' }
  ];

  const getColor = (phenotype: string, isCurrent: boolean) => {
    if (!isCurrent) return '#E5E7EB';
    
    const colors: Record<string, string> = {
      'PM': '#DC2626',   // Red - Poor
      'IM': '#F97316',   // Orange - Intermediate
      'NM': '#22C55E',   // Green - Normal
      'RM': '#3B82F6',   // Blue - Rapid
      'URM': '#8B5CF6',  // Purple - Ultrarapid
      'Unknown': '#6B7280'
    };
    return colors[phenotype] || '#6B7280';
  };

  const data = phenotypes.map(p => ({
    ...p,
    fill: getColor(p.name, p.name === currentPhenotype),
    isCurrent: p.name === currentPhenotype
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, description, frequency, isCurrent } = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-medium text-slate-900">{description}</p>
          <p className="text-sm text-slate-600">Population: ~{frequency}%</p>
          {isCurrent && (
            <p className="text-sm font-medium text-cyan-700 mt-1">← Patient phenotype</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis 
              dataKey="label" 
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="frequency" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList 
                dataKey="frequency" 
                position="top" 
                formatter={(value: any) => `${value}%`}
                fill="#64748B"
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Current phenotype indicator */}
      <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full animate-pulse"
              style={{ backgroundColor: getColor(currentPhenotype, true) }}
            />
            <span className="text-sm font-medium text-slate-700">
              Patient: {currentPhenotype === 'Unknown' ? 'Unknown' : phenotypes.find(p => p.name === currentPhenotype)?.description || currentPhenotype}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Highlighted in chart
          </span>
        </div>
      </div>
    </div>
  );
};

export default PhenotypeChart;
