"use client";

import { useState } from 'react';
import { AnalysisResponse } from '@/lib/types';
import FileUpload from '@/components/FileUpload';
import DrugSelector from '@/components/DrugSelector';
import ResultsDisplay from '@/components/ResultsDisplay';

export default function AnalysisPage() {
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [analysisMode, setAnalysisMode] = useState<'single' | 'multiple'>('single');
  const [vcfContent, setVcfContent] = useState<string>('');
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleAnalysis = async () => {
    if (!vcfContent || selectedDrugs.length === 0) {
      setError('Please upload a VCF file and select at least one drug');
      return;
    }

    if (analysisMode === 'multiple' && selectedDrugs.length < 2) {
      setError('Polypharmacy analysis requires at least 2 drugs');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const requestBody = {
        vcf_content: vcfContent,
        analysis_type: analysisMode === 'single' ? 'single_drug' : 'polypharmacy',
        patient_id: `PATIENT_${Date.now()}`,
        schema_mode: 'extended',
        ...(analysisMode === 'single'
          ? { drug: selectedDrugs[0] }
          : { drugs: selectedDrugs }
        )
      };

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleModeChange = (mode: 'single' | 'multiple') => {
    setAnalysisMode(mode);
    if (mode === 'single' && selectedDrugs.length > 1) {
      setSelectedDrugs([selectedDrugs[0]]);
    }
    setResult(null);
  };

  const resetAnalysis = () => {
    setResult(null);
    setVcfContent('');
    setSelectedDrugs([]);
    setError('');
    setAnalysisMode('single');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
      {!result ? (
        <div className="space-y-8 lg:space-y-12">
          <div className="text-center mb-8 lg:mb-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-900 mb-4 sm:mb-6">
              Pharmacogenomic Risk Assessment
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-4">
              Upload your VCF file and select medications to receive evidence-based
              pharmacogenetic analysis with <span className="font-semibold text-cyan-700">CPIC-aligned</span> clinical recommendations.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
              <div className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold badge-premium">
                🤖 AI-Powered Analysis
              </div>
              <div className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                🧬 CPIC Guidelines
              </div>
              <div className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                ⚗️ Polypharmacy Support
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="order-2 lg:order-1">
              <div className="card-clinical h-full">
                <FileUpload
                  onFileUpload={setVcfContent}
                  error={error}
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="card-clinical h-full">
                <DrugSelector
                  selectedDrugs={selectedDrugs}
                  onDrugSelect={setSelectedDrugs}
                  mode={analysisMode}
                  onModeChange={handleModeChange}
                />
              </div>
            </div>
          </div>

          <div className="text-center px-4">
              <button
              onClick={handleAnalysis}
              disabled={!vcfContent || selectedDrugs.length === 0 || isAnalyzing}
                className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 text-white font-semibold rounded-xl shadow-lg bg-gradient-to-r from-cyan-700 to-sky-700 hover:from-cyan-800 hover:to-sky-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-cyan-700 disabled:hover:to-sky-700 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 focus-ring"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="text-sm sm:text-base">
                    Analyzing {analysisMode === 'multiple' ? 'Drug Interactions' : 'Genetics'}...
                  </span>
                </div>
              ) : (
                <span className="text-sm sm:text-base flex items-center justify-center space-x-2">
                  <span>
                    {analysisMode === 'multiple'
                      ? `🧬 Analyze Polypharmacy (${selectedDrugs.length} drugs)`
                      : '🧬 Analyze Genetic Risk'
                    }
                  </span>
                </span>
              )}
            </button>

            {analysisMode === 'multiple' && selectedDrugs.length < 2 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-700 text-sm font-medium flex items-center justify-center space-x-2">
                  <span>⚠️</span>
                  <span>Select at least 2 drugs for polypharmacy analysis</span>
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-4 shadow-md">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800">Analysis Error</h3>
                    <p className="mt-1 text-sm text-red-700 leading-relaxed">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-full">
          <ResultsDisplay
            result={result}
            onReset={resetAnalysis}
          />
        </div>
      )}
    </div>
  );
}
