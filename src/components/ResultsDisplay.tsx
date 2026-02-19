"use client";

import React, { useState } from 'react';
import { AnalysisResponse } from '@/lib/types';
import { ChevronDown, ChevronUp, Copy, Download, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

interface ResultsDisplayProps {
  result: AnalysisResponse;
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onReset }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    genotype: false,
    explanation: false,
    clinical: false,
    json: false
  });

  const getDoseDelta = (drug?: string, riskLabel?: string) => {
    if (!drug) {
      return {
        normal: 'Not available',
        adjusted: 'Run a single-drug analysis to compute adjustments.'
      };
    }

    const normalDoseMap: Record<string, string> = {
      CODEINE: 'CPIC: Standard dosing if normal metabolizer; otherwise follow CPIC alternative guidance.',
      WARFARIN: 'CPIC: Use genotype-guided dosing algorithms as standard of care.',
      CLOPIDOGREL: 'CPIC: Standard dosing for normal/rapid metabolizers; otherwise follow CPIC alternatives.',
      SIMVASTATIN: 'CPIC: Standard dosing for normal function; otherwise follow CPIC dose limits.',
      AZATHIOPRINE: 'CPIC: Standard dosing for normal TPMT; adjust per CPIC if decreased function.',
      FLUOROURACIL: 'CPIC: Standard protocol dosing for normal DPYD; adjust per CPIC guidance.'
    };

    const adjustDoseMap: Record<string, Record<string, string>> = {
      CODEINE: {
        'Safe': 'CPIC: Standard dosing is appropriate for normal metabolizers.',
        'Adjust Dosage': 'CPIC: Consider alternative therapy or reduced dosing based on metabolizer status.',
        'Toxic': 'CPIC: Avoid codeine in ultrarapid metabolizers.',
        'Ineffective': 'CPIC: Avoid codeine in poor metabolizers.',
        'Unknown': 'CPIC: Use standard dosing with clinical monitoring if phenotype unknown.'
      },
      WARFARIN: {
        'Safe': 'CPIC: Use genotype-guided dosing algorithm and routine INR monitoring.',
        'Adjust Dosage': 'CPIC: Use genotype-guided reduced dose with frequent INR monitoring.',
        'Toxic': 'CPIC: Consider substantially reduced dosing per genotype-guided algorithm.',
        'Ineffective': 'CPIC: Verify genotype/phenotype and use algorithm-based dosing.',
        'Unknown': 'CPIC: Use standard dosing with INR monitoring if genotype unknown.'
      },
      CLOPIDOGREL: {
        'Safe': 'CPIC: Standard dosing is appropriate for normal/rapid metabolizers.',
        'Adjust Dosage': 'CPIC: Consider alternative antiplatelet therapy for intermediate metabolizers.',
        'Toxic': 'CPIC: Follow alternative therapy guidance based on phenotype.',
        'Ineffective': 'CPIC: Avoid clopidogrel in poor metabolizers; use alternative therapy.',
        'Unknown': 'CPIC: Standard dosing with monitoring if phenotype unknown.'
      },
      SIMVASTATIN: {
        'Safe': 'CPIC: Standard dosing for normal function is appropriate.',
        'Adjust Dosage': 'CPIC: Use reduced dose or alternative statin for decreased function.',
        'Toxic': 'CPIC: Avoid high-dose simvastatin for poor function.',
        'Ineffective': 'CPIC: Consider alternative statin based on phenotype.',
        'Unknown': 'CPIC: Standard dosing with myopathy monitoring if phenotype unknown.'
      },
      AZATHIOPRINE: {
        'Safe': 'CPIC: Standard dosing for normal TPMT is appropriate.',
        'Adjust Dosage': 'CPIC: Reduce starting dose and titrate based on TPMT phenotype.',
        'Toxic': 'CPIC: Consider alternative therapy or extreme dose reduction for poor metabolizers.',
        'Ineffective': 'CPIC: Consider alternative therapy if indicated by phenotype.',
        'Unknown': 'CPIC: Standard dosing with close CBC monitoring if phenotype unknown.'
      },
      FLUOROURACIL: {
        'Safe': 'CPIC: Standard protocol dosing for normal DPYD is appropriate.',
        'Adjust Dosage': 'CPIC: Reduce dose based on DPYD activity and titrate by toxicity.',
        'Toxic': 'CPIC: Avoid fluorouracil or use extreme dose reduction for poor metabolizers.',
        'Ineffective': 'CPIC: Consider alternative regimen based on phenotype.',
        'Unknown': 'CPIC: Standard protocol dosing with toxicity monitoring if phenotype unknown.'
      }
    };

    const normal = normalDoseMap[drug] || 'Standard adult dose per protocol.';
    const adjusted = adjustDoseMap[drug]?.[riskLabel || 'Unknown'] || 'Use clinical judgment; consider CPIC guidance.';

    return { normal, adjusted };
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getRiskColor = (riskLabel: string) => {
    switch (riskLabel) {
      case 'Safe': return 'text-emerald-900 bg-emerald-50 border-emerald-200';
      case 'Adjust Dosage': return 'text-amber-900 bg-amber-50 border-amber-200';
      case 'Toxic':
      case 'Ineffective':
        return 'text-rose-900 bg-rose-50 border-rose-200';
      case 'Unknown':
        return 'text-slate-800 bg-slate-50 border-slate-200';
      default: return 'text-slate-800 bg-slate-50 border-slate-200';
    }
  };

  const getRiskIcon = (riskLabel: string) => {
    switch (riskLabel) {
      case 'Safe': return '✓';
      case 'Adjust Dosage': return '⚠';
      case 'Toxic':
      case 'Ineffective':
        return '⚠';
      case 'Unknown':
        return '•';
      default: return '•';
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmaguard_analysis_${result.patient_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Reset Button */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-cyan-700 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Clinical Analysis Report</h1>
        </div>
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-300"
        >
          <RotateCcw className="h-4 w-4" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* Patient & Drug Info */}
      <div className="bg-white/90 border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-slate-600">Patient ID</label>
            <p className="mt-1 text-lg font-semibold text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">{result.patient_id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">
              {result.analysis_type === 'polypharmacy' ? 'Medications' : 'Drug'}
            </label>
            <p className="mt-1 text-lg font-semibold text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
              {result.analysis_type === 'polypharmacy' && result.drugs 
                ? result.drugs.join(', ')
                : result.drug
              }
            </p>
          </div>
        </div>
      </div>

      {/* Polypharmacy Alert - Show only for multi-drug analysis */}
      {result.polypharmacy_alert && result.polypharmacy_alert.polypharmacy_flag && (
        <div className="premium-card">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Polypharmacy Executive Summary</h3>
                <p className="text-sm text-slate-500">Drug-drug-gene interaction overview for multi-drug regimens.</p>
              </div>
              <span className="tag-strong">{result.polypharmacy_alert.overall_patient_risk} risk</span>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="summary-card">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Highest Risk Drug</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {result.polypharmacy_alert.highest_risk_drug || '—'}
                </p>
                <div className="sparkline mt-3">
                  <span className="sparkline-bar" style={{ ['--spark' as any]: '35%' }} />
                  <span className="sparkline-bar" style={{ ['--spark' as any]: '55%' }} />
                  <span className="sparkline-bar" style={{ ['--spark' as any]: '80%' }} />
                </div>
              </div>
              <div className="summary-card">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Phenoconversion</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {result.polypharmacy_alert.phenoconversion_risk ? 'Detected' : 'Not Detected'}
                </p>
                <div className="sparkline mt-3">
                  <span className="sparkline-bar" style={{ ['--spark' as any]: result.polypharmacy_alert.phenoconversion_risk ? '70%' : '30%' }} />
                  <span className="sparkline-bar" style={{ ['--spark' as any]: '40%' }} />
                  <span className="sparkline-bar" style={{ ['--spark' as any]: result.polypharmacy_alert.phenoconversion_risk ? '85%' : '45%' }} />
                </div>
              </div>
              <div className="summary-card">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Interaction Pairs</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {result.polypharmacy_alert.interacting_pairs.length}
                </p>
                <div className="sparkline mt-3">
                  <span className="sparkline-bar" style={{ ['--spark' as any]: `${Math.min(result.polypharmacy_alert.interacting_pairs.length * 20, 100)}%` }} />
                  <span className="sparkline-bar" style={{ ['--spark' as any]: '50%' }} />
                  <span className="sparkline-bar" style={{ ['--spark' as any]: '30%' }} />
                </div>
              </div>
            </div>

            {result.polypharmacy_alert.interacting_pairs.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-800">Interaction Matrix</h4>
                  <span className="tag-strong">DDGI summary</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Drug A</th>
                        <th>Drug B</th>
                        <th>Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.polypharmacy_alert.interacting_pairs.map((pair, index) => (
                        <tr key={index}>
                          <td>{pair.drug_a}</td>
                          <td>{pair.drug_b}</td>
                          <td>
                            <span className="tag-strong">
                              {pair.severity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risk Assessment Card */}
      <div className="premium-card">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Risk Assessment</h2>
              <p className="text-sm text-slate-500">Clinical summary of patient-specific risk and confidence.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="metric-pill">Primary Gene <span>{result.pharmacogenomic_profile.primary_gene}</span></div>
              <div className="metric-pill">Severity <span>{result.risk_assessment.severity}</span></div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] mt-6">
            <div className={`p-5 rounded-2xl border-2 ${getRiskColor(result.risk_assessment.risk_label)}`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold">{getRiskIcon(result.risk_assessment.risk_label)}</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Risk Label</p>
                  <p className="text-2xl font-semibold text-slate-900">{result.risk_assessment.risk_label}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {result.clinical_recommendation.dosing_guidance
                      ? result.clinical_recommendation.dosing_guidance
                      : result.llm_generated_explanation.summary}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Clinical confidence</span>
                  <span>{(result.risk_assessment.confidence_score * 100).toFixed(1)}%</span>
                </div>
                <div
                  className="micro-bar mt-2"
                  style={{
                    ['--micro-bar' as any]: `${Math.round(result.risk_assessment.confidence_score * 100)}%`
                  }}
                />
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Quality Index</p>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>VCF parsing</span>
                    <span>{result.quality_metrics.vcf_parsing_success ? 'Success' : 'Failed'}</span>
                  </div>
                  <div
                    className="micro-bar mt-2"
                    style={{
                      ['--micro-bar' as any]: result.quality_metrics.vcf_parsing_success ? '100%' : '35%'
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>AI confidence</span>
                    <span>{(result.quality_metrics.llm_confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div
                    className="micro-bar mt-2"
                    style={{
                      ['--micro-bar' as any]: `${Math.round(result.quality_metrics.llm_confidence * 100)}%`
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Variants detected</span>
                    <span>{result.quality_metrics.variants_detected}</span>
                  </div>
                  <div
                    className="micro-bar mt-2"
                    style={{
                      ['--micro-bar' as any]: `${Math.min(result.quality_metrics.variants_detected * 12, 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Genotype Details */}
        <div className="border-b">
          <button
            onClick={() => toggleSection('genotype')}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <h3 className="font-medium text-slate-900">Genomic Profile</h3>
            {expandedSections.genotype ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          
          {expandedSections.genotype && (
            <div className="px-6 pb-6 space-y-4 bg-slate-50">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <label className="text-sm font-medium text-slate-600">Diplotype</label>
                  <p className="mt-1 font-mono text-lg font-semibold text-slate-900">{result.pharmacogenomic_profile.diplotype}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <label className="text-sm font-medium text-slate-600">Phenotype</label>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{result.pharmacogenomic_profile.phenotype}</p>
                </div>
              </div>
              
              {result.pharmacogenomic_profile.detected_variants.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                    <label className="text-sm font-medium text-slate-600">
                      Detected Variants ({result.pharmacogenomic_profile.detected_variants.length})
                    </label>
                    <span className="tag-strong">VCF matched</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Variant</th>
                          <th>Gene</th>
                          <th>Change</th>
                          <th>Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.pharmacogenomic_profile.detected_variants.map((variant, index) => (
                          <tr key={index}>
                            <td className="font-mono text-slate-800">{variant.rsid || `${variant.chromosome}:${variant.position}`}</td>
                            <td>{variant.gene || '—'}</td>
                            <td>{variant.ref} → {variant.alt}</td>
                            <td className="text-slate-500">{variant.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clinical Recommendations */}
        <div className="border-b">
          <button
            onClick={() => toggleSection('clinical')}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <h3 className="font-medium text-slate-900">Clinical Recommendations</h3>
            {expandedSections.clinical ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          
          {expandedSections.clinical && (
            <div className="px-6 pb-4 space-y-4">
              {result.analysis_type === 'single_drug' ? (
                <div className="summary-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Dose Delta (Healthy Adults)</p>
                      <p className="text-sm text-slate-500">Assumes ages 18-65 with normal renal/hepatic function.</p>
                    </div>
                    <span className="tag-strong">{result.drug || 'N/A'}</span>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Normal Dose</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {getDoseDelta(result.drug, result.risk_assessment.risk_label).normal}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Adjusted Guidance</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {getDoseDelta(result.drug, result.risk_assessment.risk_label).adjusted}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Not for pediatric, geriatric, pregnancy, or organ impairment dosing. Follow institutional protocols.
                  </p>
                </div>
              ) : (
                <div className="summary-card">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Dose Delta (Polypharmacy)</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Polypharmacy summaries do not provide per-drug dosing adjustments. Run single-drug analysis for each medication to compute individualized dose deltas.
                  </p>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="summary-card">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Dosing Guidance</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {result.clinical_recommendation.dosing_guidance ? 'Provided' : 'Not available'}
                  </p>
                  <div className="sparkline mt-3">
                    <span className="sparkline-bar" style={{ ['--spark' as any]: result.clinical_recommendation.dosing_guidance ? '75%' : '30%' }} />
                    <span className="sparkline-bar" style={{ ['--spark' as any]: '45%' }} />
                    <span className="sparkline-bar" style={{ ['--spark' as any]: result.clinical_recommendation.dosing_guidance ? '60%' : '35%' }} />
                  </div>
                </div>
                <div className="summary-card">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Monitoring Items</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {result.clinical_recommendation.monitoring_requirements?.length || 0}
                  </p>
                  <div className="sparkline mt-3">
                    <span className="sparkline-bar" style={{ ['--spark' as any]: `${Math.min((result.clinical_recommendation.monitoring_requirements?.length || 0) * 18, 100)}%` }} />
                    <span className="sparkline-bar" style={{ ['--spark' as any]: '50%' }} />
                    <span className="sparkline-bar" style={{ ['--spark' as any]: '35%' }} />
                  </div>
                </div>
                <div className="summary-card">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Alternative Therapies</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {result.clinical_recommendation.alternative_drugs?.length || 0}
                  </p>
                  <div className="sparkline mt-3">
                    <span className="sparkline-bar" style={{ ['--spark' as any]: `${Math.min((result.clinical_recommendation.alternative_drugs?.length || 0) * 20, 100)}%` }} />
                    <span className="sparkline-bar" style={{ ['--spark' as any]: '40%' }} />
                    <span className="sparkline-bar" style={{ ['--spark' as any]: '25%' }} />
                  </div>
                </div>
              </div>
              {result.clinical_recommendation.dosing_guidance && (
                <div>
                  <p className="text-sm text-slate-600 font-medium">Dosing Guidance</p>
                  <p className="text-slate-900">{result.clinical_recommendation.dosing_guidance}</p>
                </div>
              )}
              
              {result.clinical_recommendation.monitoring_requirements && result.clinical_recommendation.monitoring_requirements.length > 0 && (
                <div>
                  <p className="text-sm text-slate-600 font-medium">Monitoring Requirements</p>
                  <ul className="list-disc list-inside text-slate-900 space-y-1">
                    {result.clinical_recommendation.monitoring_requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {result.clinical_recommendation.alternative_drugs && result.clinical_recommendation.alternative_drugs.length > 0 && (
                <div>
                  <p className="text-sm text-slate-600 font-medium">Alternative Medications</p>
                  <p className="text-slate-900">{result.clinical_recommendation.alternative_drugs.join(', ')}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div>
                  <p className="text-sm text-slate-600">CPIC Level</p>
                  <p className="font-medium text-slate-900">{result.clinical_recommendation.cpic_level || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Implementation Status</p>
                  <p className="font-medium text-slate-900">{result.clinical_recommendation.implementation_status || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clinical Intelligence Report */}
        <div className="border-b">
          <button
            onClick={() => toggleSection('explanation')}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <h3 className="font-medium text-slate-900">🧬 Clinical Intelligence Report</h3>
            {expandedSections.explanation ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          
          {expandedSections.explanation && (
            <div className="px-6 pb-4 space-y-6">
              {/* Check if this is polypharmacy or single drug analysis */}
              {result.analysis_type === 'polypharmacy' ? (
                // Polypharmacy Analysis Display - Using simplified format
                <>
                  {/* Polypharmacy Summary */}
                  <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                    <h4 className="text-sm font-semibold text-cyan-800 mb-3 flex items-center">
                      🚑 Polypharmacy Analysis Summary
                    </h4>
                    <p className="text-cyan-900 text-sm">{result.llm_generated_explanation.summary}</p>
                  </div>

                  {/* Drug Interaction Mechanism */}
                  <div className="bg-sky-50 rounded-lg p-4 border border-sky-200">
                    <h4 className="text-sm font-semibold text-sky-800 mb-3 flex items-center">
                      ⚙️ Multi-Drug Interaction Mechanism
                    </h4>
                    <p className="text-sky-900 text-sm">{result.llm_generated_explanation.mechanism}</p>
                  </div>

                  {/* Clinical Interpretation */} 
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center">
                      🏥 Clinical Interpretation
                    </h4>
                    <p className="text-emerald-900 text-sm">{result.llm_generated_explanation.variant_interpretation}</p>
                  </div>
                </>
              ) : (
                // Single Drug Analysis Display - Using simplified format
                <>
                  {/* Summary */}
                  <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                    <h4 className="text-sm font-semibold text-cyan-800 mb-3 flex items-center">
                      ⚠️ Clinical Risk Summary
                    </h4>
                    <p className="text-cyan-900 text-sm">{result.llm_generated_explanation.summary}</p>
                  </div>

                  {/* Biological Mechanism */}
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center">
                      🧬 Biological Mechanism
                    </h4>
                    <p className="text-emerald-900 text-sm">{result.llm_generated_explanation.mechanism}</p>
                  </div>

                  {/* Variant Interpretation */}
                  <div className="bg-sky-50 rounded-lg p-4 border border-sky-200">
                    <h4 className="text-sm font-semibold text-sky-800 mb-3 flex items-center">
                      🔬 Variant Interpretation
                    </h4>
                    <p className="text-sky-900 text-sm">{result.llm_generated_explanation.variant_interpretation}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* JSON Export */}
        <div>
          <button
            onClick={() => toggleSection('json')}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <h3 className="font-medium text-slate-900">Raw JSON Data</h3>
            {expandedSections.json ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          
          {expandedSections.json && (
            <div className="px-6 pb-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex space-x-2 mb-3">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-white border border-slate-200 hover:border-slate-300 rounded transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={downloadJSON}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-cyan-700 text-white hover:bg-cyan-800 rounded transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
                <pre className="text-xs text-slate-800 overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="bg-white/90 rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-medium text-slate-900 mb-4">Quality Metrics</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            {result.quality_metrics.vcf_parsing_success ? 
              <CheckCircle className="h-5 w-5 text-emerald-600" /> : 
              <AlertTriangle className="h-5 w-5 text-rose-500" />
            }
            <div>
              <p className="text-sm text-slate-600">VCF Parsing</p>
              <p className="font-medium">{result.quality_metrics.vcf_parsing_success ? 'Success' : 'Failed'}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-slate-600">Variants Detected</p>
            <p className="font-medium text-slate-900">{result.quality_metrics.variants_detected}</p>
          </div>
          
          <div>
            <p className="text-sm text-slate-600">AI Confidence</p>
            <p className="font-medium text-slate-900">{(result.quality_metrics.llm_confidence * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Clinical Decision Support Only</p>
            <p>This analysis is for clinical decision support and educational purposes only. It should not be used as the sole basis for medical decisions. Always consult with qualified healthcare professionals and follow institutional guidelines.</p>
          </div>
        </div>
      </div>

      {/* Timestamp */}
      <div className="text-center text-sm text-slate-500">
        Analysis completed: {new Date(result.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default ResultsDisplay;