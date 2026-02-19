"use client";

import React from 'react';
import { DRUG_INFO } from '@/lib/types';
import { Pill } from 'lucide-react';

interface DrugSelectorProps {
  selectedDrugs: string[];
  onDrugSelect: (drugs: string[]) => void;
  mode: 'single' | 'multiple';
  onModeChange: (mode: 'single' | 'multiple') => void;
}

const DrugSelector: React.FC<DrugSelectorProps> = ({ selectedDrugs, onDrugSelect, mode, onModeChange }) => {
  const drugs = Object.entries(DRUG_INFO);

  const handleDrugClick = (drugKey: string) => {
    if (mode === 'single') {
      onDrugSelect([drugKey]);
    } else {
      // Multiple selection mode
      if (selectedDrugs.includes(drugKey)) {
        // Remove drug if already selected
        onDrugSelect(selectedDrugs.filter(d => d !== drugKey));
      } else {
        // Add drug if not selected
        onDrugSelect([...selectedDrugs, drugKey]);
      }
    }
  };

  const isSelected = (drugKey: string) => selectedDrugs.includes(drugKey);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <Pill className="w-5 h-5 text-cyan-700" />
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Select Medication(s)</h2>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex items-center space-x-1 bg-slate-100 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => onModeChange('single')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === 'single'
                ? 'bg-white text-slate-900 shadow-md transform scale-105'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } focus-ring`}
          >
            Single Drug
          </button>
          <button
            onClick={() => onModeChange('multiple')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === 'multiple' 
                ? 'bg-white text-slate-900 shadow-md transform scale-105'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } focus-ring`}
          >
            🧬 Polypharmacy
          </button>
        </div>
      </div>
      
      {/* Selection Info */}
      {mode === 'multiple' && (
        <div className="bg-gradient-to-r from-cyan-50 to-sky-50 border-l-4 border-cyan-400 rounded-r-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="text-cyan-900 font-semibold text-sm flex items-center space-x-2">
              <span>⚗️</span>
              <span>Drug-Drug-Gene Interaction Analysis</span>
            </div>
          </div>
          <p className="text-cyan-700 text-xs mt-2 leading-relaxed">
            Select multiple medications to analyze polypharmacy interactions and phenoconversion risks with advanced DDGI assessment
          </p>
          {selectedDrugs.length > 0 && (
            <div className="mt-3 p-2 bg-cyan-100 rounded-md">
              <span className="text-cyan-900 font-semibold text-xs">Selected ({selectedDrugs.length}):</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {selectedDrugs.map(drug => (
                  <span key={drug} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-cyan-200 text-cyan-900">
                    {DRUG_INFO[drug as keyof typeof DRUG_INFO]?.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="grid gap-3 sm:gap-4">
        {drugs.map(([drugKey, drugInfo]) => {
          const selected = isSelected(drugKey);
          return (
            <div
              key={drugKey}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md ${
                selected
                  ? 'border-cyan-500 bg-gradient-to-r from-cyan-50 to-sky-50 shadow-lg scale-[1.01]'
                  : 'border-slate-200 hover:border-cyan-300 hover:bg-slate-50 bg-white shadow-sm'
              } focus-ring`}
              onClick={() => handleDrugClick(drugKey)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDrugClick(drugKey);
                }
              }}
              aria-pressed={selected}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                  selected ? 'bg-cyan-200 shadow-md' : 'bg-slate-100'
                }`}>
                  {mode === 'multiple' && (
                    <div className={`w-5 h-5 rounded-md border-2 mr-2 flex items-center justify-center transition-all duration-200 ${
                      selected 
                        ? 'bg-cyan-600 border-cyan-600 shadow-sm' 
                        : 'border-slate-300 hover:border-cyan-400'
                    }`}>
                      {selected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                  <Pill className={`h-5 w-5 transition-colors duration-200 ${
                    selected ? 'text-cyan-700' : 'text-slate-600'
                  }`} />
                </div>
              
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold text-base transition-colors duration-200 ${
                      selected ? 'text-cyan-900' : 'text-slate-900'
                    }`}>
                      {drugInfo.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                      selected
                        ? 'bg-cyan-200 text-cyan-900 shadow-sm' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {drugInfo.category}
                    </span>
                  </div>
                  <p className={`text-sm mt-2 leading-relaxed transition-colors duration-200 ${
                    selected ? 'text-cyan-800' : 'text-slate-600'
                  }`}>
                    {drugInfo.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedDrugs.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-emerald-900 text-sm mb-2">
                {mode === 'single' ? 'Selected Medication' : `Selected Medications (${selectedDrugs.length})`}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedDrugs.map(drug => (
                  <div key={drug} className="inline-flex items-center space-x-2 px-3 py-1 bg-white border border-emerald-300 rounded-lg shadow-sm">
                    <Pill className="w-3 h-3 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">
                      {DRUG_INFO[drug as keyof typeof DRUG_INFO]?.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugSelector;