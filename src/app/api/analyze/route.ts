/**
 * PharmaGuard - Analysis API Route
 * Main backend endpoint for pharmacogenomic analysis
 * Processes VCF files and returns structured risk assessments
 */

import { NextRequest, NextResponse } from 'next/server';
import { VCFParser } from '@/lib/VCFParser';
import { DrugGeneMap, SupportedDrug, getPrimaryGene, isSupportedDrug } from '@/lib/DrugGeneMap';
import { getPhenotype, parseStarAllele, constructDiplotype, VariantInfo } from '@/lib/VariantPhenotypeMap';
import { RiskEngine, RiskEngineResult, RiskAssessment, RiskLabel, Severity } from '@/lib/RiskEngine';
import { LLMExplainGenerator, LLMExplanationRequest } from '@/lib/LLMExplain';

// Request schema
interface AnalysisRequest {
  vcf_content: string;
  drug?: string; // For single drug analysis
  drugs?: string[]; // For polypharmacy analysis
  analysis_type?: 'single_drug' | 'polypharmacy';
  patient_id?: string;
  ai_provider?: 'openai' | 'gemini' | 'dual' | 'fallback';
}

// Response schema (matches exact specification)
interface AnalysisResponse {
  patient_id: string;
  drug?: string; // For single drug
  drugs?: string[]; // For polypharmacy
  analysis_type: 'single_drug' | 'polypharmacy';
  timestamp: string;
  risk_assessment: {
    risk_label: string;
    confidence_score: number;
    severity: string;
  };
  polypharmacy_alert?: {
    polypharmacy_flag: boolean;
    overall_patient_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    highest_risk_drug?: string;
    interacting_pairs: Array<{
      drug_a: string;
      drug_b: string;
      severity: string;
    }>;
    phenoconversion_risk: boolean;
  };
  pharmacogenomic_profile: {
    primary_gene: string;
    diplotype: string;
    phenotype: string;
    detected_variants: Array<{
      rsid?: string;
      chromosome: string;
      position: number;
      ref: string;
      alt: string;
      gene?: string;
      starAllele?: string;
    }>;
  };
  clinical_recommendation: {
    dosing_guidance?: string;
    monitoring_requirements?: string[];
    alternative_drugs?: string[];
    cpic_level?: string;
    implementation_status?: string;
  };
  llm_generated_explanation: {
    summary: string;
    mechanism: string;
    variant_interpretation: string;
  };
  quality_metrics: {
    vcf_parsing_success: boolean;
    variants_detected: number;
    llm_confidence: number;
  };
}

interface ErrorResponse {
  error: string;
  details?: string;
  timestamp: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Parse request body
    const rawBody: AnalysisRequest = await request.json();
    const body = normalizeRequest(rawBody);
    
    // Validate input
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error,
          timestamp: new Date().toISOString()
        } as ErrorResponse,
        { status: 400 }
      );
    }

    const { vcf_content, drug, drugs, analysis_type = 'single_drug', patient_id, ai_provider } = body;
    const patientId = patient_id || `PATIENT_${Date.now()}`;

    if (analysis_type === 'polypharmacy') {
      return handlePolypharmacyAnalysis({
        vcf_content,
        drugs: drugs!,
        patient_id: patientId,
        ai_provider
      });
    }

    // Single drug analysis (existing logic)
    const supportedDrug = drug as SupportedDrug;
    console.log(`Starting single drug analysis for patient ${patientId}, drug: ${drug}, AI provider: ${ai_provider || 'dual'}`);

    // Step 1: Parse VCF file
    const vcfResult = VCFParser.parseVCF(vcf_content);
    console.log(`VCF parsing result: ${vcfResult.success ? 'success' : 'failed'}, variants: ${vcfResult.totalVariants}`);

    if (!vcfResult.success && vcfResult.variants.length === 0) {
      return NextResponse.json(
        {
          error: 'VCF parsing failed',
          details: vcfResult.errors.join('; '),
          timestamp: new Date().toISOString()
        } as ErrorResponse,
        { status: 400 }
      );
    }

    // Step 2: Filter pharmacogenetic variants
    const pharmVariants = VCFParser.filterPharmacogeneticVariants(vcfResult.variants);
    const primaryGene = getPrimaryGene(supportedDrug);
    
    // Filter for primary gene
    const relevantVariants = pharmVariants.filter(v => 
      v.gene === primaryGene || 
      (v.rsID && isRelevantRsID(v.rsID, primaryGene))
    );

    console.log(`Found ${relevantVariants.length} relevant variants for ${primaryGene}`);

    // Step 3: Infer genotype and phenotype
    let diplotype = "*1/*1"; // Default wild-type
    let alleles = ["*1", "*1"];

    if (relevantVariants.length > 0) {
      // Infer alleles from variants
      const inferredAlleles = relevantVariants.map(v => 
        parseStarAllele(primaryGene, VCFParser.toVariantInfo(v))
      );
      
      if (inferredAlleles.length >= 2) {
        alleles = [inferredAlleles[0], inferredAlleles[1]];
      } else if (inferredAlleles.length === 1) {
        alleles = [inferredAlleles[0], "*1"];
      }
      
      diplotype = constructDiplotype(alleles[0], alleles[1]);
    }

    // Get phenotype
    const phenotype = getPhenotype(primaryGene, diplotype);

    console.log(`Determined genotype: ${diplotype}, phenotype: ${phenotype ? phenotype.name : 'Unknown'}`);

    // Step 4: Risk assessment
    const riskResult = RiskEngine.assessRisk(
      supportedDrug,
      phenotype,
      relevantVariants,
      diplotype
    );

    // Step 5: Generate LLM explanation using dual AI providers
    const llmRequest: LLMExplanationRequest = {
      drug: supportedDrug,
      profile: riskResult.pharmacogenomic_profile,
      risk: riskResult.risk_assessment,
      patientId
    };

    // Try dual AI provider system with intelligent fallback
    const llmResult = await LLMExplainGenerator.generateExplanation(llmRequest, ai_provider);
    
    // Log AI provider status for debugging
    const providerStatus = LLMExplainGenerator.getProvidersStatus();
    console.log(`AI Provider Status:`, providerStatus);
    console.log(`LLM Generation Result: ${llmResult.success ? 'success' : 'failed'} using ${llmResult.provider || 'unknown'} provider`);

    const explanation = llmResult.explanation || {
      summary: "Risk assessment completed based on comprehensive pharmacogenomic analysis using validated clinical guidelines.",
      mechanism: "Genetic variants affect drug metabolism and therapeutic response through established pharmacokinetic and pharmacodynamic pathways.",
      variant_interpretation: "Clinical interpretation follows CPIC guidelines and evidence-based pharmacogenomic recommendations."
    };

    // Convert LLMExplanation to expected format if needed
    let formattedExplanation;
    if (explanation && ('clinical_risk_summary' in explanation || 'polypharmacy_clinical_summary' in explanation)) {
      // This is our enhanced LLMExplanation - convert to legacy format for API compatibility
      formattedExplanation = {
        summary: explanation.clinical_recommendation || explanation.polypharmacy_triage || "Clinical risk assessment completed.",
        mechanism: explanation.biological_mechanism?.enzyme_function || explanation.polypharmacy_mechanisms?.enzymatic_bottleneck || "Genetic variants affect drug metabolism.",
        variant_interpretation: explanation.phenotype_impact || explanation.polypharmacy_impact || "Pharmacogenetic analysis based on detected variants."
      };
    } else {
      formattedExplanation = explanation;
    }

    // Step 6: Build response
    const response: AnalysisResponse = {
      patient_id: patientId,
      drug: supportedDrug,
      analysis_type: 'single_drug',
      timestamp: new Date().toISOString(),
      risk_assessment: {
        risk_label: mapRiskLabel(riskResult.risk_assessment.risk_label),
        confidence_score: riskResult.risk_assessment.confidence_score,
        severity: mapSeverity(riskResult.risk_assessment.severity)
      },
      pharmacogenomic_profile: {
        primary_gene: riskResult.pharmacogenomic_profile.primary_gene,
        diplotype: riskResult.pharmacogenomic_profile.diplotype,
        phenotype: mapPhenotypeNameToCode(riskResult.pharmacogenomic_profile.phenotype),
        detected_variants: mapDetectedVariants(riskResult.pharmacogenomic_profile.detected_variants)
      },
      clinical_recommendation: riskResult.clinical_recommendation,
      llm_generated_explanation: formattedExplanation as { summary: string; mechanism: string; variant_interpretation: string; },
      quality_metrics: {
        vcf_parsing_success: vcfResult.success,
        variants_detected: relevantVariants.length,
        llm_confidence: llmResult.confidence || 0.5
      }
    };

    const processingTime = Date.now() - startTime;
    console.log(`Analysis completed in ${processingTime}ms`);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Analysis API error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      } as ErrorResponse,
      { status: 500 }
    );
  }
}

// OPTIONS method for CORS
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({}, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

/**
 * Handle polypharmacy analysis for multiple drugs
 */
async function handlePolypharmacyAnalysis(params: {
  vcf_content: string;
  drugs: string[];
  patient_id: string;
  ai_provider?: string;
}): Promise<NextResponse> {
  const { vcf_content, drugs, patient_id, ai_provider } = params;
  
  console.log(`Starting polypharmacy analysis for patient ${patient_id}, drugs: ${drugs.join(', ')}`);

  try {
    // Parse VCF file  
    const vcfResult = VCFParser.parseVCF(vcf_content);
    if (!vcfResult.success) {
      throw new Error(`VCF parsing failed: ${vcfResult.errors.join('; ')}`);
    }

    // Analyze each drug individually first
    const individualAnalyses: RiskEngineResult[] = [];
    let overallRisk = 'SAFE';
    let highestRiskDrug = '';
    let maxSeverity = 0;
    
    for (const drug of drugs) {
      const supportedDrug = drug as SupportedDrug;
      const gene = getPrimaryGene(supportedDrug);
      const relevantVariants = vcfResult.variants.filter(variant => 
        isRelevantRsID(variant.rsID || variant.id || '', gene)
      );
      // Calculate phenotype for this drug
      const genotypePair = determineGenotype(relevantVariants, gene);
      const diplotype = constructDiplotype(genotypePair.allele1, genotypePair.allele2);
      const phenotype = getPhenotype(gene, diplotype);
      
      const riskResult = RiskEngine.assessRisk(
        supportedDrug,
        phenotype,
        relevantVariants,
        diplotype
      );

      individualAnalyses.push(riskResult);

      // Track highest risk
      const severityScore = getSeverityScore(riskResult.risk_assessment.severity);
      if (severityScore > maxSeverity) {
        maxSeverity = severityScore;
        overallRisk = riskResult.risk_assessment.risk_label;
        highestRiskDrug = supportedDrug;
      }
    }

    // Detect drug interactions
    const interactionPairs = detectDrugInteractions(drugs as SupportedDrug[]);
    const phenoconversionRisk = detectPhenoconversion(drugs as SupportedDrug[], individualAnalyses);

    // Determine overall patient risk
    const overallPatientRisk = determineOverallRisk(individualAnalyses, interactionPairs);

    // Generate polypharmacy explanation
    const primaryProfile = individualAnalyses[0]?.pharmacogenomic_profile;
    const combinedRisk: RiskAssessment = {
      risk_label: overallRisk as RiskLabel,
      confidence_score: Math.min(...individualAnalyses.map(a => a.risk_assessment.confidence_score)),
      severity: getHighestSeverity(individualAnalyses.map(a => a.risk_assessment.severity)) as Severity
    };

    const llmRequest: LLMExplanationRequest = {
      drugs: drugs as SupportedDrug[],
      profile: primaryProfile,
      risk: combinedRisk,
      patientId: patient_id,
      analysisType: 'polypharmacy'
    };

    const llmResult = await LLMExplainGenerator.generateExplanation(
      llmRequest,
      (ai_provider as any) || 'dual'
    );

    const providerStatus = LLMExplainGenerator.getProvidersStatus();
    
    // Convert polypharmacy LLM explanation to API format
    let formattedExplanation;
    if (llmResult.explanation && ('polypharmacy_clinical_summary' in llmResult.explanation)) {
      formattedExplanation = {
        summary: llmResult.explanation.polypharmacy_triage || "Polypharmacy risk assessment completed.",
        mechanism: llmResult.explanation.polypharmacy_mechanisms?.enzymatic_bottleneck || "Multi-drug metabolic interactions detected.",
        variant_interpretation: llmResult.explanation.polypharmacy_impact || "Complex polypharmacy analysis based on genetic profile."
      };
    } else {
      formattedExplanation = llmResult.explanation || {
        summary: "Polypharmacy risk assessment completed.",
        mechanism: "Multi-drug interactions analyzed.",
        variant_interpretation: "Pharmacogenetic analysis for multiple medications." 
      };
    }
    
    const response: AnalysisResponse = {
      patient_id,
      drugs,
      analysis_type: 'polypharmacy',
      timestamp: new Date().toISOString(),
      risk_assessment: {
        risk_label: mapRiskLabel(combinedRisk.risk_label),
        confidence_score: combinedRisk.confidence_score,
        severity: mapSeverity(combinedRisk.severity)
      },
      polypharmacy_alert: {
        polypharmacy_flag: true,
        overall_patient_risk: overallPatientRisk,
        highest_risk_drug: highestRiskDrug,
        interacting_pairs: interactionPairs,
        phenoconversion_risk: phenoconversionRisk
      },
      pharmacogenomic_profile: primaryProfile
        ? {
            primary_gene: primaryProfile.primary_gene,
            diplotype: primaryProfile.diplotype,
            phenotype: mapPhenotypeNameToCode(primaryProfile.phenotype),
            detected_variants: mapDetectedVariants(primaryProfile.detected_variants)
          }
        : {
            primary_gene: 'Unknown',
            diplotype: '*1/*1',
            phenotype: 'Unknown',
            detected_variants: []
          },
      clinical_recommendation: {
        dosing_guidance: `Multiple drug interactions detected. Individual drug analysis and interaction management required.`,
        monitoring_requirements: ['Enhanced monitoring for drug interactions', 'Regular therapeutic drug monitoring'],
        alternative_drugs: ['Consider alternative drugs with different metabolic pathways'],
        cpic_level: 'Multiple guidelines apply',
        implementation_status: 'Polypharmacy analysis - consult clinical guidelines'
      },

      llm_generated_explanation: formattedExplanation as { summary: string; mechanism: string; variant_interpretation: string; },
      quality_metrics: {
        vcf_parsing_success: vcfResult.success,
        variants_detected: vcfResult.variants.length,
        llm_confidence: llmResult.confidence || 0.7
      }
    };

    console.log(`Polypharmacy analysis completed for ${drugs.length} drugs`);
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Polypharmacy analysis error:', error);
    throw error;
  }
}

/**
 * Detect drug-drug interactions
 */
function detectDrugInteractions(drugs: SupportedDrug[]): Array<{
  drug_a: string;
  drug_b: string;
  severity: string;
}> {
  const interactions = [];
  
  // Known interaction pairs with severity
  const knownInteractions: Record<string, { severity: string; mechanism: string }> = {
    'WARFARIN-SIMVASTATIN': { severity: 'HIGH', mechanism: 'CYP3A4 competition' },
    'WARFARIN-CLOPIDOGREL': { severity: 'MODERATE', mechanism: 'Bleeding risk increase' },
    'CODEINE-FLUOROURACIL': { severity: 'LOW', mechanism: 'Different pathways' },
    'AZATHIOPRINE-FLUOROURACIL': { severity: 'MODERATE', mechanism: 'Immunosuppression synergy' }
  };

  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      const pair1 = `${drugs[i]}-${drugs[j]}`;
      const pair2 = `${drugs[j]}-${drugs[i]}`;
      
      const interaction = knownInteractions[pair1] || knownInteractions[pair2];
      if (interaction) {
        interactions.push({
          drug_a: drugs[i],
          drug_b: drugs[j],
          severity: interaction.severity
        });
      }
    }
  }
  
  return interactions;
}

/**
 * Detect phenoconversion risk
 */
function detectPhenoconversion(drugs: SupportedDrug[], analyses: RiskEngineResult[]): boolean {
  // Simplified phenoconversion detection
  // In reality, this would be much more complex
  const hasInhibitorDrugs = drugs.some(drug => 
    ['CLOPIDOGREL', 'WARFARIN'].includes(drug) // Drugs that can inhibit CYP enzymes
  );
  
  const hasPoorMetabolizers = analyses.some(analysis => 
    analysis.pharmacogenomic_profile.phenotype.includes('Poor')
  );
  
  return hasInhibitorDrugs && hasPoorMetabolizers;
}

/**
 * Determine overall patient risk from multiple analyses
 */
function determineOverallRisk(analyses: RiskEngineResult[], interactions: any[]): 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' {
  const maxIndividualRisk = Math.max(...analyses.map(a => getSeverityScore(a.risk_assessment.severity)));
  const hasHighRiskInteractions = interactions.some(i => i.severity === 'HIGH' || i.severity === 'SEVERE');
  
  if (maxIndividualRisk >= 3 || hasHighRiskInteractions) return 'SEVERE';
  if (maxIndividualRisk >= 2) return 'HIGH';
  if (maxIndividualRisk >= 1 || interactions.length > 0) return 'MODERATE';
  return 'LOW';
}

function getSeverityScore(severity: string): number {
  const scores: Record<string, number> = {
    'NONE': 0,
    'LOW': 0,
    'MODERATE': 1, 
    'HIGH': 2,
    'CRITICAL': 3
  };
  return scores[severity] || 0;
}

function getHighestSeverity(severities: string[]): string {
  const scores = severities.map(s => getSeverityScore(s));
  const maxScore = Math.max(...scores);
  const severityMap: Record<number, string> = {
    0: 'LOW',
    1: 'MODERATE', 
    2: 'HIGH',
    3: 'CRITICAL'
  };
  return severityMap[maxScore] || 'LOW';
}

function normalizeRequest(body: AnalysisRequest): AnalysisRequest {
  const normalizedDrug = body.drug?.trim().toUpperCase();
  const normalizedDrugs = body.drugs
    ?.map(drug => drug.trim().toUpperCase())
    .filter(drug => drug.length > 0);

  return {
    ...body,
    drug: normalizedDrug,
    drugs: normalizedDrugs
  };
}

/**
 * Validate request data
 */
function validateRequest(body: any): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  if (!body.vcf_content || typeof body.vcf_content !== 'string') {
    return { valid: false, error: 'VCF content is required and must be a string' };
  }

  const analysisType = body.analysis_type || 'single_drug';
  
  if (analysisType === 'single_drug') {
    if (!body.drug || typeof body.drug !== 'string') {
      return { valid: false, error: 'Drug is required for single drug analysis' };
    }
    
    if (!isSupportedDrug(body.drug)) {
      return { 
        valid: false, 
        error: `Unsupported drug: ${body.drug}. Supported drugs: ${Object.keys(DrugGeneMap).join(', ')}` 
      };
    }
  } else if (analysisType === 'polypharmacy') {
    if (!body.drugs || !Array.isArray(body.drugs) || body.drugs.length < 2) {
      return { valid: false, error: 'At least 2 drugs required for polypharmacy analysis' };
    }
    
    for (const drug of body.drugs) {
      if (!isSupportedDrug(drug)) {
        return { 
          valid: false, 
          error: `Unsupported drug: ${drug}. Supported drugs: ${Object.keys(DrugGeneMap).join(', ')}` 
        };
      }
    }
  }

  // Validate VCF content
  const vcfValidation = VCFParser.validateVCF(body.vcf_content);
  if (!vcfValidation.valid) {
    return { valid: false, error: vcfValidation.error };
  }

  return { valid: true };
}

/**
 * Determine genotype from variants for polypharmacy analysis  
 */
function determineGenotype(variants: any[], gene: string): { diplotype: string; allele1: string; allele2: string } {
  // Get star alleles from variants
  const starAlleles = variants.map(v => {
    // Handle both string IDs and VariantInfo objects
    const variantId = typeof v === 'string' ? v : (v as any).id || (v as any).rsID;
    return parseStarAllele(gene, { rsID: variantId } as VariantInfo) as string;
  }).filter(Boolean);
  
  if (starAlleles.length >= 2) {
    return {
      diplotype: `${starAlleles[0]}/${starAlleles[1]}`,
      allele1: starAlleles[0] || '*1',
      allele2: starAlleles[1] || '*1'
    };
  }
  
  // Default to normal function if no variants detected
  return {
    diplotype: '*1/*1',
    allele1: '*1',
    allele2: '*1'
  };
}

/**
 * Check if rsID is relevant for a specific gene
 */
function isRelevantRsID(rsID: string, gene: string): boolean {
  const geneRsIDs: Record<string, string[]> = {
    'CYP2D6': ['rs3892097', 'rs35742686', 'rs5030655', 'rs16947'],
    'CYP2C19': ['rs4244285', 'rs4986893', 'rs12248560'],
    'CYP2C9': ['rs1799853', 'rs1057910'],
    'SLCO1B1': ['rs4149056'],
    'TPMT': ['rs1142345', 'rs1800460', 'rs1800462'],
    'DPYD': ['rs3918290', 'rs55886062']
  };

  return geneRsIDs[gene]?.includes(rsID) || false;
}

function mapRiskLabel(label: RiskLabel): 'Safe' | 'Adjust Dosage' | 'Toxic' | 'Ineffective' | 'Unknown' {
  switch (label) {
    case 'SAFE':
      return 'Safe';
    case 'ADJUST_DOSAGE':
      return 'Adjust Dosage';
    case 'TOXIC':
      return 'Toxic';
    case 'INEFFECTIVE':
      return 'Ineffective';
    case 'UNKNOWN':
    default:
      return 'Unknown';
  }
}

function mapSeverity(severity: Severity): 'none' | 'low' | 'moderate' | 'high' | 'critical' {
  switch (severity) {
    case 'NONE':
      return 'none';
    case 'LOW':
      return 'low';
    case 'MODERATE':
      return 'moderate';
    case 'HIGH':
      return 'high';
    case 'CRITICAL':
      return 'critical';
    default:
      return 'none';
  }
}

function mapPhenotypeNameToCode(phenotypeName: string): 'PM' | 'IM' | 'NM' | 'RM' | 'URM' | 'Unknown' {
  const normalized = phenotypeName.toLowerCase();

  if (normalized.includes('poor')) return 'PM';
  if (normalized.includes('intermediate') || normalized.includes('decreased')) return 'IM';
  if (normalized.includes('ultrarapid') || normalized.includes('ultra-rapid')) return 'URM';
  if (normalized.includes('rapid')) return 'RM';
  if (normalized.includes('normal')) return 'NM';

  return 'Unknown';
}

function mapDetectedVariants(variants: Array<{ rsID?: string; chromosome: string; position: number; ref: string; alt: string; gene?: string; starAllele?: string; }>) {
  return variants.map(variant => ({
    rsid: variant.rsID,
    chromosome: variant.chromosome,
    position: variant.position,
    ref: variant.ref,
    alt: variant.alt,
    gene: variant.gene,
    starAllele: variant.starAllele
  }));
}