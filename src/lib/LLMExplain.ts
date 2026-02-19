/**
 * PharmaGuard - Enhanced LLM Explanation Generator
 * Generates human-readable explanations for pharmacogenomic risk assessments
 * Supports dual AI providers: OpenAI GPT-4 and Google Gemini
 * Provides intelligent fallback between providers and rule-based explanations
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupportedDrug } from './DrugGeneMap';
import { PharmacogenomicProfile, RiskAssessment, RiskLabel } from './RiskEngine';

export interface LLMExplanation {
  clinical_risk_summary?: {
    medication: string;
    target_gene: string;
    patient_phenotype: string;
    risk_profile: string;
  };
  biological_mechanism?: {
    enzyme_function: string;
    active_vs_inactive_metabolites: string;
    metabolism_pathway: string;
  };
  phenotype_impact?: string;
  clinical_recommendation?: string;
  
  // Polypharmacy fields
  polypharmacy_clinical_summary?: {
    patient_phenotype: string;
    medication_list: string[];
    primary_threat: string;
  };
  polypharmacy_mechanisms?: {
    enzymatic_bottleneck: string;
    inhibition_induction_profile: string;
    active_vs_inactive_threat: string;
  };
  polypharmacy_impact?: string;
  polypharmacy_triage?: string;
}

export interface LLMExplanationRequest {
  drug?: SupportedDrug;
  drugs?: SupportedDrug[];
  profile: PharmacogenomicProfile;
  risk: RiskAssessment;
  patientId?: string;
  analysisType?: 'single_drug' | 'polypharmacy';
}

export interface LLMResponse {
  success: boolean;
  explanation?: LLMExplanation;
  confidence: number; // 0-1
  error?: string;
  provider?: 'openai' | 'gemini' | 'fallback';
}

export type AIProvider = 'openai' | 'gemini' | 'dual' | 'fallback';

export class LLMExplainGenerator {
  private static readonly MAX_RETRIES = 2;
  private static readonly TIMEOUT_MS = 25000;
  private static readonly GEMINI_MODEL = 'gemini-1.5-pro';

  /**
   * Generate explanation using available AI providers with intelligent fallback
   */
  static async generateExplanation(request: LLMExplanationRequest, preferredProvider?: AIProvider): Promise<LLMResponse> {
    const provider = preferredProvider || this.getProviderPreference();
    
    try {
      switch (provider) {
        case 'openai':
          return await this.tryOpenAI(request);
        
        case 'gemini':
          return await this.tryGemini(request);
        
        case 'dual':
        default:
          // Try OpenAI first, then Gemini, then fallback
          const openAIResult = await this.tryOpenAI(request, false);
          if (openAIResult.success) {
            return openAIResult;
          }
          
          console.log('OpenAI failed, trying Gemini...', openAIResult.error);
          const geminiResult = await this.tryGemini(request, false);
          if (geminiResult.success) {
            return geminiResult;
          }
          
          console.log('Both AI providers failed, using rule-based fallback');
          return this.generateFallbackExplanation(request);
      }
    } catch (error) {
      console.error('LLM explanation generation failed:', error);
      return this.generateFallbackExplanation(request);
    }
  }

  /**
   * Try OpenAI API with error handling
   */
  private static async tryOpenAI(request: LLMExplanationRequest, logErrors = true): Promise<LLMResponse> {
    if (!process.env.OPENAI_API_KEY) {
      return { success: false, error: 'OpenAI API key not configured', confidence: 0 };
    }

    try {
      const prompt = this.buildPrompt(request);
      const response = await this.callOpenAI(prompt);
      return { ...response, provider: 'openai' };
    } catch (error) {
      const errorMsg = `OpenAI failed: ${error instanceof Error ? error.message : String(error)}`;
      if (logErrors) console.error(errorMsg);
      return { success: false, error: errorMsg, confidence: 0 };
    }
  }

  /**
   * Try Google Gemini API with error handling
   */
  private static async tryGemini(request: LLMExplanationRequest, logErrors = true): Promise<LLMResponse> {
    if (!process.env.GEMINI_API_KEY) {
      return { success: false, error: 'Gemini API key not configured', confidence: 0 };
    }

    try {
      const prompt = this.buildPrompt(request);
      const response = await this.callGemini(prompt);
      return { ...response, provider: 'gemini' };
    } catch (error) {
      const errorMsg = `Gemini failed: ${error instanceof Error ? error.message : String(error)}`;
      if (logErrors) console.error(errorMsg);
      return { success: false, error: errorMsg, confidence: 0 };
    }
  }

  /**
   * Call OpenAI API with retry logic
   */
  private static async callOpenAI(prompt: string): Promise<LLMResponse> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: [
              {
                role: 'system', 
                content: 'You are an advanced Pharmacogenomics Clinical Decision Intelligence System providing mechanism-level biological insights for clinicians. Always respond with valid JSON matching the exact structure requested.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1200,
            temperature: 0.3,
            response_format: { type: 'json_object' }
          }),
          signal: AbortSignal.timeout(this.TIMEOUT_MS)
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(`OpenAI error: ${data.error.message}`);
        }

        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('No content in OpenAI response');
        }

        const parsedExplanation = JSON.parse(content) as LLMExplanation;
        
        if (!this.validateExplanation(parsedExplanation)) {
          throw new Error('Invalid explanation structure from OpenAI');
        }

        return {
          success: true,
          explanation: parsedExplanation,
          confidence: 0.95 // High confidence for OpenAI
        };
        
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('OpenAI API failed after retries');
  }

  /**
   * Call Google Gemini API
   */
  private static async callGemini(prompt: string): Promise<LLMResponse> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: this.GEMINI_MODEL });

    try {
      const enhancedPrompt = `${prompt}\n\nIMPORTANT: Respond with valid JSON only, no additional text or markdown formatting.`;
      
      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No content in Gemini response');
      }

      // Clean up potential markdown formatting
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsedExplanation = JSON.parse(cleanedText) as LLMExplanation;
      
      if (!this.validateExplanation(parsedExplanation)) {
        throw new Error('Invalid explanation structure from Gemini');
      }

      return {
        success: true,
        explanation: parsedExplanation,
        confidence: 0.90 // Slightly lower confidence for Gemini
      };

    } catch (error) {
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Build comprehensive prompt for AI models - Advanced Clinical Intelligence Report with Polypharmacy Support
   */
  private static buildPrompt(request: LLMExplanationRequest): string {
    const { drugs, drug, profile, risk, analysisType = 'single_drug' } = request;
    
    const rsIDs = profile.detected_variants
      .filter(v => v.rsID)
      .map(v => v.rsID)
      .join(', ');

    if (analysisType === 'polypharmacy' && drugs && drugs.length > 1) {
      return this.buildPolypharmacyPrompt(drugs, profile, risk, rsIDs);
    }
    
    return this.buildSingleDrugPrompt(drug!, profile, risk, rsIDs);
  }

  /**
   * Build polypharmacy analysis prompt for multiple concurrent medications
   */
  private static buildPolypharmacyPrompt(
    drugs: SupportedDrug[],
    profile: PharmacogenomicProfile, 
    risk: RiskAssessment,
    rsIDs: string
  ): string {
    return `You are an advanced Polypharmacy & Pharmacogenomics Clinical Decision Intelligence System. Your objective is to evaluate arrays of concurrent medications against a patient's genetic profile.

When provided with a list of medications and a patient's genetic profile (Gene and Phenotype), you must output a hybrid response:
1. A strict JSON block containing structured analysis
2. Deep biological reasoning explaining the interactions

Focus specifically on Drug-Drug Interactions (DDI) and Drug-Gene Interactions (DGI), highlighting any competitive inhibition or phenoconversion (where one drug alters the metabolic capacity of an enzyme for another drug).

PATIENT GENETIC PROFILE:
- Primary Gene: ${profile.primary_gene}
- Diplotype: ${profile.diplotype}
- Phenotype: ${profile.phenotype}
- Detected Variants: ${rsIDs || 'None specified'}
- Overall Risk: ${risk.risk_label} (${(risk.confidence_score * 100).toFixed(1)}% confidence)

MEDICATION LIST: ${drugs.join(', ')}

Generate a polypharmacy analysis using the EXACT JSON structure:

{
  "polypharmacy_clinical_summary": {
    "patient_phenotype": "${profile.primary_gene} ${profile.phenotype}",
    "medication_list": ${JSON.stringify(drugs)},
    "primary_threat": "[One-sentence summary of the greatest clinical danger]"
  },
  "polypharmacy_mechanisms": {
    "enzymatic_bottleneck": "[Identify if multiple drugs compete for the same CYP450 enzyme]",
    "inhibition_induction_profile": "[Explain if Drug A inhibits the enzyme needed by Drug B]", 
    "active_vs_inactive_threat": "[Explain the chemical result, e.g., prodrug activation failure or active drug accumulation]"
  },
  "polypharmacy_impact": "[Explain the cascade] -> [Chemical result] -> [Clinical symptom/Danger]",
  "polypharmacy_triage": "[Provide evidence-based sequencing, dosage adjustments, or alternative drug classes]"
}

Key Focus Areas:
1. **Enzymatic Competition**: Multiple drugs competing for same metabolic pathways
2. **Phenoconversion**: One drug altering the effective phenotype for another
3. **Cumulative Risk**: How genetic variants compound with drug interactions
4. **Clinical Prioritization**: Which drug poses the highest immediate risk

Provide mechanism-level detail appropriate for clinical decision makers.`;
  }

  /**
   * Build single drug analysis prompt
   */
  private static buildSingleDrugPrompt(
    drug: SupportedDrug,
    profile: PharmacogenomicProfile,
    risk: RiskAssessment, 
    rsIDs: string
  ): string {

    const riskProfileMapping = {
      'SAFE': 'Normal Risk - Standard Therapy Appropriate',
      'ADJUST_DOSAGE': 'Moderate Risk - Dose Adjustment Required', 
      'TOXIC': 'High Risk of Toxicity - Alternative Therapy Recommended',
      'INEFFECTIVE': 'High Risk of Therapeutic Failure - Alternative Therapy Recommended',
      'UNKNOWN': 'Unknown Risk - Insufficient Evidence for Clinical Determination'
    };

    return `You are an advanced Pharmacogenomics Clinical Decision Intelligence System. Your objective is to move beyond simple risk labeling and provide deep, actionable, mechanism-level biological insights for clinicians.

PATIENT GENETIC PROFILE:
- Gene: ${profile.primary_gene}
- Diplotype: ${profile.diplotype}
- Phenotype: ${profile.phenotype} 
- Detected Variants: ${rsIDs || 'None specified'}
- Risk Assessment: ${risk.risk_label} (${(risk.confidence_score * 100).toFixed(1)}% confidence)

MEDICATION: ${drug}

Generate a structured Clinical Intelligence Report using the EXACT JSON format below. Do not just state the risk—explain the biological mechanism driving it using clear medical/biological terminology.

RESPONSE FORMAT (JSON):
{
  "clinical_risk_summary": {
    "medication": "${drug}",
    "target_gene": "${profile.primary_gene}", 
    "patient_phenotype": "${profile.phenotype}",
    "risk_profile": "${riskProfileMapping[risk.risk_label as keyof typeof riskProfileMapping]}"
  },
  "biological_mechanism": {
    "enzyme_function": "[Explain what this specific enzyme does in the body/liver]",
    "active_vs_inactive_metabolites": "[State whether the parent drug is active or a prodrug, and what the metabolite is]",
    "metabolism_pathway": "[Provide the step-by-step molecular conversion]"
  },
  "phenotype_impact": "[Explain exactly what happens in the patient's body: metabolic failure/acceleration -> chemical result -> clinical symptoms]",
  "clinical_recommendation": "[Provide evidence-based alternatives or dosage adjustments based on CPIC/FDA guidelines]"
}

Focus on:
1. Precise biological mechanisms at the molecular level
2. Clear causal chain: genotype -> phenotype -> metabolic outcome -> clinical effect
3. Evidence-based clinical recommendations following CPIC guidelines
4. Professional medical terminology for clinician audiences
5. Actionable insights that directly inform treatment decisions

Do not use patient-friendly language—this is for clinical decision makers.`;
  }

  /**
   * Generate advanced clinical intelligence fallback explanation when AI APIs are unavailable
   */
  private static generateFallbackExplanation(request: LLMExplanationRequest): LLMResponse {
    const { drug, drugs, profile, risk, analysisType } = request;
    
    // Handle drug parameter for both single and multi-drug analysis
    const primaryDrug = drug || drugs?.[0] || 'UNKNOWN';
    
    if (analysisType === 'polypharmacy' && drugs && drugs.length > 1) {
      // Return polypharmacy explanation
      const explanation: LLMExplanation = {
        polypharmacy_clinical_summary: {
          patient_phenotype: `${profile.primary_gene} ${profile.phenotype}`,
          medication_list: drugs,
          primary_threat: `Multiple drug interactions detected with ${profile.phenotype} metabolizer status creating elevated clinical risk.`
        },
        polypharmacy_mechanisms: {
          enzymatic_bottleneck: `Multiple drugs compete for ${profile.primary_gene} enzyme capacity, creating metabolic bottleneck.`,
          inhibition_induction_profile: 'Drug-drug interactions may alter individual drug clearance profiles.',
          active_vs_inactive_threat: 'Complex multi-drug metabolic competition affecting therapeutic outcomes.'
        },
        polypharmacy_impact: `${profile.phenotype} metabolism → Drug-drug competition → Altered clearance profiles → Increased risk of therapeutic failure or toxicity`,
        polypharmacy_triage: `Enhanced monitoring required. Consider sequential dosing or alternative drugs with different metabolic pathways. Based on CPIC guidelines for ${profile.primary_gene} interactions.`
      };
      
      return {
        success: true,
        explanation,
        confidence: 0.80,
        provider: 'fallback'
      };
    }
    // Single drug analysis (existing logic)
    const clinicalMechanisms = {
      CYP2D6: {
        enzyme_function: "CYP2D6 is a hepatic cytochrome P450 enzyme responsible for oxidative metabolism of approximately 25% of all clinically used drugs. It catalyzes hydroxylation, O-dealkylation, and N-dealkylation reactions.",
        pathways: {
          CODEINE: {
            active_vs_inactive: "Codeine is a prodrug (inactive parent compound) that requires O-demethylation by CYP2D6 to morphine (active opioid metabolite) for analgesic effect.",
            metabolism_pathway: "Codeine → [CYP2D6 O-demethylation] → Morphine → μ-opioid receptor binding → analgesia"
          }
        }
      },
      CYP2C19: {
        enzyme_function: "CYP2C19 is a hepatic cytochrome P450 enzyme that metabolizes proton pump inhibitors and activates thienopyridine prodrugs through oxidative biotransformation.",
        pathways: {
          CLOPIDOGREL: {
            active_vs_inactive: "Clopidogrel is a prodrug requiring two-step CYP2C19-mediated oxidation to form the active thiol metabolite that irreversibly binds P2Y12 receptors.",
            metabolism_pathway: "Clopidogrel → [CYP2C19 oxidation] → 2-oxo-clopidogrel → [CYP2C19 oxidation] → Active thiol metabolite → P2Y12 receptor inhibition"
          },
          WARFARIN: {
            active_vs_inactive: "Warfarin exists as active enantiomers; S-warfarin (more potent) is metabolized by CYP2C9, while R-warfarin is metabolized by CYP2C19.",
            metabolism_pathway: "R-Warfarin → [CYP2C19 hydroxylation] → 6-hydroxy-R-warfarin → renal elimination"
          }
        }
      },
      CYP2C9: {
        enzyme_function: "CYP2C914 is a hepatic cytochrome P450 enzyme that catalyzes hydroxylation of substrates, particularly important for warfarin S-enantiomer metabolism and NSAID clearance.",
        pathways: {
          WARFARIN: {
            active_vs_inactive: "S-warfarin is the pharmacologically active enantiomer (4x more potent than R-warfarin) that inhibits VKORC1 to reduce vitamin K recycling.",
            metabolism_pathway: "S-Warfarin → [CYP2C9 7-hydroxylation] → 7-hydroxy-S-warfarin → glucuronidation → renal elimination"
          }
        }
      },
      SLCO1B1: {
        enzyme_function: "SLCO1B1 encodes OATP1B1 transporter located on hepatocyte sinusoidal membrane, responsible for uptake of organic anions including HMG-CoA reductase inhibitors from portal circulation.",
        pathways: {
          SIMVASTATIN: {
            active_vs_inactive: "Simvastatin is a prodrug lactone that undergoes hepatic hydrolysis to simvastatin acid (active HMG-CoA reductase inhibitor).",
            metabolism_pathway: "Simvastatin → [hepatic esterases] → Simvastatin acid → [OATP1B1 uptake] → hepatocyte → HMG-CoA reductase inhibition"
          }
        }
      },
      TPMT: {
        enzyme_function: "Thiopurine methyltransferase (TPMT) is a cytosolic enzyme that catalyzes S-methylation of thiopurine drugs, representing a major detoxification pathway.",
        pathways: {
          AZATHIOPRINE: {
            active_vs_inactive: "Azathioprine is a prodrug converted to 6-mercaptopurine, then to active 6-thioguanine nucleotides that incorporate into DNA causing cytotoxicity.",
            metabolism_pathway: "Azathioprine → 6-mercaptopurine → [TPMT methylation vs HGPRT phosphorylation] → 6-methylmercaptopurine (inactive) vs 6-thioguanine nucleotides (active/toxic)"
          }
        }
      },
      DPYD: {
        enzyme_function: "Dihydropyrimidine dehydrogenase (DPYD) is the rate-limiting enzyme in pyrimidine catabolism, responsible for >80% of fluoropyrimidine metabolism through reduction to inactive metabolites.",
        pathways: {
          FLUOROURACIL: {
            active_vs_inactive: "5-Fluorouracil is an active antimetabolite that directly inhibits thymidylate synthase and incorporates into RNA/DNA as fraudulent nucleotide.",
            metabolism_pathway: "5-FU → [DPYD reduction] → 5,6-dihydro-5-fluorouracil → further catabolism → inactive metabolites + CO2"
          }
        }
      }
    };

    const phenotypeImpacts = {
      'Poor Metabolizer': (gene: string, drug: string) => {
        const impacts = {
          CYP2D6: "Severely reduced CYP2D6 activity → Minimal codeine-to-morphine conversion → Therapeutic failure with standard opioid dosing → Inadequate analgesia",
          CYP2C19: "Severely reduced CYP2C19 activity → Impaired clopidogrel activation → Reduced active metabolite formation → Increased cardiovascular event risk",
          CYP2C9: "Severely reduced CYP2C9 activity → Impaired S-warfarin clearance → Prolonged anticoagulant effect → Increased bleeding risk",
          TPMT: "Severely reduced TPMT activity → Impaired thiopurine detoxification → Accumulation of cytotoxic metabolites → Life-threatening myelosuppression",
          DPYD: "Severely reduced DPYD activity → Impaired 5-FU catabolism → Drug accumulation → Severe neutropenia, mucositis, and potential fatality"
        };
        return impacts[gene as keyof typeof impacts] || `Severely impaired ${gene} function leads to altered ${drug} metabolism with potential for adverse outcomes.`;
      },
      'Intermediate Metabolizer': (gene: string, drug: string) => {
        const impacts = {
          CYP2D6: "Reduced CYP2D6 activity → Decreased codeine-to-morphine conversion → Suboptimal analgesic response → May require alternative opioid therapy",
          CYP2C19: "Reduced CYP2C19 activity → Decreased clopidogrel activation → Suboptimal platelet inhibition → Increased risk of thrombotic events",
          CYP2C9: "Reduced CYP2C9 activity → Decreased S-warfarin clearance → Enhanced anticoagulant sensitivity → Increased bleeding risk with standard dosing",
          SLCO1B1: "Reduced OATP1B1 function → Decreased hepatic simvastatin uptake → Increased systemic exposure → Elevated myopathy risk"
        };
        return impacts[gene as keyof typeof impacts] || `Moderately impaired ${gene} function requires dose adjustment for optimal ${drug} therapy.`;
      },
      'Normal Metabolizer': (gene: string, drug: string) => `Normal ${gene} enzyme/transporter activity → Standard ${drug} metabolism → Appropriate therapeutic response with standard dosing protocols`,
      'Rapid Metabolizer': (gene: string, drug: string) => {
        const impacts = {
          CYP2D6: "Enhanced CYP2D6 activity → Increased codeine-to-morphine conversion → Potential for enhanced opioid effects → Standard dosing appropriate with monitoring",
          CYP2C19: "Enhanced CYP2C19 activity → Rapid clopidogrel activation → Potential for enhanced platelet inhibition → Standard dosing typically appropriate"
        };
        return impacts[gene as keyof typeof impacts] || `Enhanced ${gene} activity → Rapid ${drug} metabolism → May require dose optimization for sustained therapeutic effect.`;
      },
      'Ultra-Rapid Metabolizer': (gene: string, drug: string) => {
        const impacts = {
          CYP2D6: "Extremely enhanced CYP2D6 activity → Rapid codeine-to-morphine conversion → Risk of opioid toxicity → Contraindicated in pediatric populations",
          CYP2C19: "Extremely enhanced CYP2C19 activity → Rapid clopidogrel activation → Standard antiplatelet effect → Alternative therapy may be considered for high-risk patients"
        };
        return impacts[gene as keyof typeof impacts] || `Extremely enhanced ${gene} activity → Very rapid ${drug} metabolism → Significant risk of therapeutic failure or toxicity.`;
      },
      'Ultrarapid Metabolizer': (gene: string, drug: string) => {
        const impacts = {
          CYP2D6: "Extremely enhanced CYP2D6 activity → Rapid codeine-to-morphine conversion → Risk of opioid toxicity → Contraindicated in pediatric populations",
          CYP2C19: "Extremely enhanced CYP2C19 activity → Rapid clopidogrel activation → Standard antiplatelet effect → Alternative therapy may be considered for high-risk patients"
        };
        return impacts[gene as keyof typeof impacts] || `Extremely enhanced ${gene} activity → Very rapid ${drug} metabolism → Significant risk of therapeutic failure or toxicity.`;
      }
    };

    const clinicalRecommendations = {
      SAFE: "Follow standard clinical protocols with routine therapeutic monitoring per institutional guidelines.",
      ADJUST_DOSAGE: "Implement dose reduction (25-50%) with enhanced monitoring. Consider therapeutic drug monitoring where available.",
      TOXIC: "CONTRAINDICATED - Select alternative therapy. If no alternatives available, use extreme caution with ≥75% dose reduction and intensive monitoring.",
      INEFFECTIVE: "CONTRAINDICATED for optimal efficacy - Select alternative agent with different metabolic pathway or consider alternative dosing strategy with enhanced monitoring.",
      UNKNOWN: "Insufficient genetic evidence. Use standard clinical protocols and consider confirmatory pharmacogenomic testing."
    };

    const riskProfiles = {
      SAFE: "Normal Risk - Standard Therapy Appropriate",
      ADJUST_DOSAGE: "Moderate Risk - Dose Adjustment Required",
      TOXIC: "High Risk of Toxicity - Alternative Therapy Recommended", 
      INEFFECTIVE: "High Risk of Therapeutic Failure - Alternative Therapy Recommended",
      UNKNOWN: "Unknown Risk - Insufficient Evidence for Clinical Determination"
    };

    const mechanism = clinicalMechanisms[profile.primary_gene as keyof typeof clinicalMechanisms];
    const drugPathway = mechanism?.pathways?.[drug as keyof typeof mechanism.pathways];

    const explanation: LLMExplanation = {
      clinical_risk_summary: {
        medication: primaryDrug,
        target_gene: profile.primary_gene,
        patient_phenotype: profile.phenotype,
        risk_profile: riskProfiles[risk.risk_label as keyof typeof riskProfiles] || 'Unknown Risk'
      },
      biological_mechanism: {
        enzyme_function: mechanism?.enzyme_function || `${profile.primary_gene} enzyme affects ${primaryDrug} metabolism through genetic polymorphisms that alter protein function.`,
        active_vs_inactive_metabolites: (drugPathway as any)?.active_vs_inactive || `${primaryDrug} metabolism involves ${profile.primary_gene}-dependent biotransformation affecting therapeutic activity.`,
        metabolism_pathway: (drugPathway as any)?.metabolism_pathway || `${primaryDrug} undergoes ${profile.primary_gene}-mediated metabolism to produce active/inactive metabolites.`
      },
      phenotype_impact: phenotypeImpacts[profile.phenotype as keyof typeof phenotypeImpacts]?.(profile.primary_gene, primaryDrug) || `${profile.phenotype} status affects ${primaryDrug} metabolism with potential clinical implications.`,
      clinical_recommendation: `${clinicalRecommendations[risk.risk_label as keyof typeof clinicalRecommendations] || 'Standard monitoring recommended.'} Based on CPIC guidelines for ${profile.primary_gene}-${primaryDrug} interactions. Confidence: ${(risk.confidence_score * 100).toFixed(0)}%.`
    };

    return {
      success: true,
      explanation,
      confidence: 0.85, // High confidence for comprehensive rule-based clinical intelligence
      provider: 'fallback'
    };
  }

  /**
   * Validate Clinical Intelligence Report structure and content quality
   */
  private static validateExplanation(explanation: LLMExplanation): boolean {
    const minLength = 30;
    
    // Check for single drug explanation
    if (explanation.clinical_risk_summary && explanation.biological_mechanism) {
      return (
        explanation.clinical_risk_summary &&
        typeof explanation.clinical_risk_summary.medication === 'string' &&
        typeof explanation.clinical_risk_summary.target_gene === 'string' &&
        typeof explanation.clinical_risk_summary.patient_phenotype === 'string' &&
        typeof explanation.clinical_risk_summary.risk_profile === 'string' &&
        explanation.biological_mechanism &&
        typeof explanation.biological_mechanism.enzyme_function === 'string' &&
        typeof explanation.biological_mechanism.active_vs_inactive_metabolites === 'string' &&
        typeof explanation.biological_mechanism.metabolism_pathway === 'string' &&
        typeof explanation.phenotype_impact === 'string' &&
        typeof explanation.clinical_recommendation === 'string' &&
        explanation.biological_mechanism.enzyme_function.length >= minLength &&
        explanation.biological_mechanism.active_vs_inactive_metabolites.length >= minLength &&
        explanation.biological_mechanism.metabolism_pathway.length >= minLength &&
        (explanation.phenotype_impact?.length || 0) >= minLength &&
        (explanation.clinical_recommendation?.length || 0) >= minLength
      );
    }
    
    // Check for polypharmacy explanation
    if (explanation.polypharmacy_clinical_summary) {
      return Boolean(
        explanation.polypharmacy_clinical_summary &&
        typeof explanation.polypharmacy_clinical_summary.patient_phenotype === 'string' &&
        Array.isArray(explanation.polypharmacy_clinical_summary.medication_list) &&
        typeof explanation.polypharmacy_clinical_summary.primary_threat === 'string' &&
        explanation.polypharmacy_mechanisms &&
        typeof explanation.polypharmacy_mechanisms.enzymatic_bottleneck === 'string' &&
        typeof explanation.polypharmacy_impact === 'string' &&
        typeof explanation.polypharmacy_triage === 'string'
      );
    }
    
    return false;
  }

  /**
   * Determine AI provider preference based on configuration
   */
  private static getProviderPreference(): AIProvider {
    const preference = process.env.NEXT_PUBLIC_AI_PROVIDER;
    if (preference && ['openai', 'gemini', 'dual'].includes(preference)) {
      return preference as AIProvider;
    }
    return 'dual'; // Default to dual provider
  }

  /**
   * Get explanation synchronously (for testing/development)
   */
  static generateSyncExplanation(request: LLMExplanationRequest): LLMExplanation {
    return this.generateFallbackExplanation(request).explanation!;
  }

  /**
   * Estimate explanation confidence based on available data and provider used
   */
  static estimateConfidence(
    hasVariants: boolean,
    phenotypeConfidence: number,
    llmSuccess: boolean,
    provider?: string
  ): number {
    let confidence = 0.5;
    
    if (hasVariants) confidence += 0.15;
    if (llmSuccess) {
      if (provider === 'openai') confidence += 0.25;
      else if (provider === 'gemini') confidence += 0.20;
      else confidence += 0.15;
    }
    
    return Math.min(confidence * phenotypeConfidence, 1.0);
  }

  /**
   * Get available AI providers status
   */
  static getProvidersStatus(): Record<string, boolean> {
    return {
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      fallback: true
    };
  }
}