# 🧬 PharmaGuard - Pharmacogenomic Risk Prediction System

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Production-ready pharmacogenomic analysis platform with AI-powered explanations and CPIC-aligned recommendations**

## 🎯 Overview

**PharmaGuard** is a cutting-edge web application that analyzes genetic variants from VCF files to predict pharmacogenomic risks for specific medications. Built for healthcare professionals, it provides:

- **Precision Medicine**: CPIC-aligned drug-gene interaction analysis
- **AI-Powered Explanations**: LLM-generated clinical interpretations
- **Production Ready**: Scalable architecture with comprehensive error handling
- **Medical Grade**: Clinical decision support with proper disclaimers

## ✅ Submission Links (Required)

- **Live Application URL:** REPLACE_WITH_PUBLIC_URL
- **LinkedIn Demo Video:** REPLACE_WITH_LINKEDIN_PUBLIC_POST
- **GitHub Repository:** REPLACE_WITH_GITHUB_REPO_URL

> Note: The LinkedIn post must be public and tag the official RIFT page with hashtags: #RIFT2026 #PharmaGuard #Pharmacogenomics #AIinHealthcare

## ✨ Features

### 🧬 Core Functionality
- **VCF File Analysis**: Parse and analyze VCF v4.2 format files (up to 5MB)
- **6 Drug Support**: Codeine, Warfarin, Clopidogrel, Simvastatin, Azathioprine, Fluorouracil
- **6 Gene Analysis**: CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, DPYD
- **Risk Classification**: Safe, Adjust Dosage, Toxic, Ineffective, Unknown with confidence scoring

### 🤖 AI & Intelligence
- **OpenAI Integration**: GPT-4 powered clinical explanations
- **Fallback System**: Rule-based explanations when API unavailable
- **Confidence Scoring**: Multi-factor confidence assessment
- **Quality Metrics**: Comprehensive analysis quality indicators

### 💻 User Experience
- **Drag & Drop Upload**: Intuitive file handling with validation
- **Real-time Validation**: Immediate feedback on file format and content
- **Interactive Results**: Expandable sections with detailed clinical data
- **Export Capabilities**: JSON download and clipboard copy
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18.17.0 or later
npm 9.0.0 or later
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/pharmaguard.git
   cd pharmaguard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your OpenAI API key (optional)
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Testing with Sample Data

1. Use the provided sample VCF file: `public/sample.vcf`
2. Upload via the web interface
3. Select a drug (e.g., "Clopidogrel")
4. Click "Analyze Risk"

## 🧬 Supported Drugs & Genes

| Drug | Primary Gene | Category | Risk Factors |
|------|--------------|----------|-------------|
| **Codeine** | CYP2D6 | Opioid Analgesic | Poor metabolizers: ineffective; Ultrarapid: toxicity risk |
| **Warfarin** | CYP2C9 | Anticoagulant | Slow metabolizers: bleeding risk, need dose reduction |
| **Clopidogrel** | CYP2C19 | Antiplatelet | Poor metabolizers: reduced efficacy, cardiovascular risk |
| **Simvastatin** | SLCO1B1 | Statin | Poor function: myopathy risk, especially >20mg |
| **Azathioprine** | TPMT | Immunosuppressant | Poor metabolizers: severe toxicity, myelosuppression |
| **Fluorouracil** | DPYD | Chemotherapy | Poor metabolizers: severe toxicity, potentially fatal |

## 📊 Risk Assessment

### Risk Levels

- **🟢 Safe**: Standard dosing appropriate
- **🟡 Adjust Dosage**: Dose modification recommended  
- **🔴 Toxic**: High toxicity risk, avoid or extreme caution
- **🔴 Ineffective**: Poor efficacy, consider alternatives
- **⚪ Unknown**: Insufficient evidence, consider confirmatory testing

## 🏗 Architecture Overview

- **Frontend**: Next.js App Router + React + Tailwind CSS
- **Backend API**: `POST /api/analyze` for VCF parsing, genotype inference, and risk scoring
- **LLM Layer**: OpenAI/Gemini with rule-based fallback for clinical explanations
- **Data Pipeline**: VCF → variants → diplotype → phenotype → CPIC-aligned risk + recommendations

## 📖 API Documentation

### POST `/api/analyze`

**Input**
```json
{
   "vcf_content": "<raw_vcf_string>",
   "drug": "CODEINE",
   "analysis_type": "single_drug",
   "patient_id": "PATIENT_123"
}
```

**Output (Schema-Compliant)**
```json
{
   "patient_id": "PATIENT_123",
   "drug": "CODEINE",
   "timestamp": "2026-02-20T12:00:00.000Z",
   "risk_assessment": {
      "risk_label": "Safe",
      "confidence_score": 0.92,
      "severity": "low"
   },
   "pharmacogenomic_profile": {
      "primary_gene": "CYP2D6",
      "diplotype": "*1/*1",
      "phenotype": "NM",
      "detected_variants": [
         { "rsid": "rs3892097", "chromosome": "22", "position": 42524947, "ref": "C", "alt": "T" }
      ]
   },
   "clinical_recommendation": { "dosing_guidance": "Use standard dosing." },
   "llm_generated_explanation": {
      "summary": "...",
      "mechanism": "...",
      "variant_interpretation": "..."
   },
   "quality_metrics": { "vcf_parsing_success": true, "variants_detected": 1, "llm_confidence": 0.9 }
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   npx vercel --prod
   ```

2. **Set Environment Variables**
   - `OPENAI_API_KEY` (optional)
   - `NEXT_PUBLIC_APP_NAME=PharmaGuard`

3. **Deploy**
   ```bash
   vercel deploy --prod
   ```

## 📁 Project Structure

```
pharmaguard/
├── src/
│   ├── app/
│   │   ├── api/analyze/
│   │   │   └── route.ts          # Main analysis API endpoint
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main application page
│   ├── components/
│   │   ├── DrugSelector.tsx      # Drug selection interface
│   │   ├── FileUpload.tsx        # VCF file upload component
│   │   ├── Header.tsx            # Application header
│   │   └── ResultsDisplay.tsx    # Results visualization
│   └── lib/
│       ├── DrugGeneMap.ts        # Drug-gene mapping definitions
│       ├── LLMExplain.ts         # AI explanation generator
│       ├── RiskEngine.ts         # Risk assessment logic
│       ├── types.ts              # TypeScript type definitions
│       ├── utils.ts              # Utility functions
│       ├── VCFParser.ts          # VCF file parsing logic
│       └── VariantPhenotypeMap.ts # Genotype-phenotype mapping
├── public/
│   └── sample.vcf                # Sample VCF for testing
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

## 🤖 AI Integration

### OpenAI Configuration

1. **Get API Key**: Sign up at [OpenAI Platform](https://platform.openai.com/)
2. **Set Environment Variable**:
   ```bash
   OPENAI_API_KEY=your_api_key_here
   ```
3. **Model Used**: GPT-4 Turbo for medical accuracy

### Fallback System

When OpenAI API is unavailable:
- **Rule-based explanations** are generated
- **Confidence scores** are adjusted accordingly
- **Full functionality** remains available

## 🧪 Testing

### Manual Testing

1. **Sample VCF**: Use `public/sample.vcf`
2. **Test Drugs**: Try each supported medication
3. **Edge Cases**: Test invalid files, network errors

## 📄 License

This project is licensed under the MIT License.

---

**⚠️ Disclaimer**: This application is for clinical decision support and educational purposes only. It should not be used as the sole basis for medical decisions. Always consult with qualified healthcare professionals and follow institutional guidelines.

**Built with ❤️ for precision medicine and improved patient outcomes.**

## 👥 Team Members

- REPLACE_WITH_TEAM_MEMBER_NAMES

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
