"use client";

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface QualityMetrics {
  vcf_parsing_success: boolean;
  variants_detected?: number;
  llm_confidence?: number;
}

interface ConfidenceRadarProps {
  metrics: QualityMetrics;
  confidenceScore: number;
}

const ConfidenceRadar: React.FC<ConfidenceRadarProps> = ({ metrics, confidenceScore }) => {
  const variantsDetected = metrics.variants_detected ?? 0;
  const llmConfidence = metrics.llm_confidence ?? 0.85;
  
  const data = [
    {
      metric: 'VCF Quality',
      value: metrics.vcf_parsing_success ? 95 : 25,
      fullMark: 100
    },
    {
      metric: 'Variant Coverage',
      value: Math.min(variantsDetected * 15, 100),
      fullMark: 100
    },
    {
      metric: 'AI Confidence',
      value: llmConfidence * 100,
      fullMark: 100
    },
    {
      metric: 'Risk Confidence',
      value: confidenceScore * 100,
      fullMark: 100
    },
    {
      metric: 'Data Completeness',
      value: metrics.vcf_parsing_success && variantsDetected > 0 ? 85 : 40,
      fullMark: 100
    }
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fill: '#64748B', fontSize: 11 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#94A3B8', fontSize: 10 }}
            axisLine={false}
          />
          <Radar
            name="Analysis Quality"
            dataKey="value"
            stroke="#0891B2"
            fill="#0891B2"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', color: '#64748B' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConfidenceRadar;
