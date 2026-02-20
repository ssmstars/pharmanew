# 🧬 PharmaGuard - Pharmacogenomic Risk Prediction System

**RIFT 2026 Hackathon | Pharmacogenomics / Explainable AI Track**

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Production-ready pharmacogenomic analysis platform with AI-powered explanations and CPIC-aligned recommendations**

---

## ✅ Submission Links (REQUIRED)

| Requirement | Link |
|-------------|------|
| **🌐 Live Application URL** | https://pharmanew-z518.vercel.app/ |
| **🎥 LinkedIn Demo Video** | https://www.linkedin.com/posts/harteij-v-k-raju-77233b29a_rift2026-pharmaguard-pharmacogenomics-ugcPost-7430425033824567296-PJUA?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEhPBYYBFXOaRgdkB8RHFU_RyLHyfj-zGic |
| **📂 GitHub Repository** | https://github.com/ssmstars/pharmanew.git |

> ⚠️ **LinkedIn Requirements**: The video must be PUBLIC, tag the official RIFT2026 page, and include hashtags: `#RIFT2026 #PharmaGuard #Pharmacogenomics #AIinHealthcare`

---

## 🎯 Problem Statement

**Adverse drug reactions kill over 100,000 Americans annually.** Many of these deaths are preventable through pharmacogenomic testing — analyzing how genetic variants affect drug metabolism.

PharmaGuard addresses this by building an AI-powered web application that:
1. **Parses authentic VCF files** (Variant Call Format — industry standard for genomic data)
2. **Identifies pharmacogenomic variants** across 6 critical genes
3. **Predicts drug-specific risks**: Safe, Adjust Dosage, Toxic, Ineffective, Unknown
4. **Generates clinical explanations** using LLMs with variant citations
5. **Provides CPIC-aligned dosing recommendations**

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
   git clone https://github.com/ssmstars/pharmanew.git
   cd pharmanew
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

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PharmaGuard Architecture                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │   Frontend  │    │    API Layer    │    │      Core Engine            │  │
│  │   Next.js   │───▶│  POST /analyze  │───▶│                             │  │
│  │   React     │    │                 │    │  ┌─────────────────────┐    │  │
│  │   Tailwind  │    │  Request        │    │  │    VCF Parser       │    │  │
│  └─────────────┘    │  Validation     │    │  │    (VCFParser.ts)   │    │  │
│        │            └─────────────────┘    │  └──────────┬──────────┘    │  │
│        │                                   │             │               │  │
│        ▼                                   │             ▼               │  │
│  ┌─────────────┐                           │  ┌─────────────────────┐    │  │
│  │  File Upload│                           │  │  Star Allele Caller │    │  │
│  │  Drug Select│                           │  │  (Diplotype Engine) │    │  │
│  │  Results UI │                           │  └──────────┬──────────┘    │  │
│  └─────────────┘                           │             │               │  │
│                                            │             ▼               │  │
│                                            │  ┌─────────────────────┐    │  │
│                                            │  │    Risk Engine      │    │  │
│                                            │  │  (CPIC Guidelines)  │    │  │
│                                            │  └──────────┬──────────┘    │  │
│                                            │             │               │  │
│                                            └─────────────┼───────────────┘  │
│                                                          │                  │
│                              ┌────────────────────────────┘                 │
│                              ▼                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        LLM Explanation Layer                          │  │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐   │  │
│  │   │   OpenAI    │    │   Gemini    │    │   Rule-Based Fallback   │   │  │
│  │   │   GPT-4     │    │   Pro       │    │   (Always Available)    │   │  │
│  │   └─────────────┘    └─────────────┘    └─────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Pipeline

```
VCF File → Parse Variants → Identify Gene Variants → Call Star Alleles 
         → Determine Diplotype → Map to Phenotype → Assess Risk (CPIC)
         → Generate LLM Explanation → Return JSON Response
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS 3.4 |
| **Backend** | Next.js API Routes, Node.js Runtime |
| **AI/LLM** | OpenAI GPT-4, Google Gemini, Rule-based fallback |
| **Data Processing** | Custom VCF Parser, Star Allele Calling Engine |
| **Guidelines** | CPIC 2017/2022/2023 Clinical Guidelines |
| **Deployment** | Vercel (Serverless) |

## 📖 API Documentation

### POST `/api/analyze`

Analyzes VCF genetic data for pharmacogenomic risks.

**Request Body**
```json
{
  "vcf_content": "<raw_vcf_string>",
  "drug": "CODEINE",
  "patient_id": "PATIENT_123"
}
```

**Response (Hackathon Schema-Compliant)**
```json
{
  "patient_id": "PATIENT_123",
  "drug": "CODEINE",
  "timestamp": "2026-02-20T12:00:00.000Z",
  "risk_assessment": {
    "risk_label": "Safe",
    "confidence_score": 0.92,
    "severity": "none"
  },
  "pharmacogenomic_profile": {
    "primary_gene": "CYP2D6",
    "diplotype": "*1/*1",
    "phenotype": "NM",
    "detected_variants": [
      {
        "rsid": "rs3892097",
        "chromosome": "chr22",
        "position": 42524947,
        "ref": "C",
        "alt": "T",
        "gene": "CYP2D6",
        "starAllele": "*4",
        "genotype": "0/1",
        "functionImpact": "No function"
      }
    ]
  },
  "clinical_recommendation": {
    "dosing_guidance": "Use standard dosing per labeling.",
    "monitoring_requirements": ["Standard monitoring"],
    "alternative_drugs": [],
    "cpic_level": "A",
    "guideline_source": "CPIC Guideline for CYP2D6 and Codeine Therapy (2014)"
  },
  "llm_generated_explanation": {
    "summary": "Patient has normal CYP2D6 metabolism. Standard codeine dosing is appropriate.",
    "mechanism": "CYP2D6 converts codeine to morphine. Normal metabolizers produce therapeutic morphine levels.",
    "variant_interpretation": "No loss-of-function variants detected. Diplotype *1/*1 indicates normal enzyme activity."
  },
  "quality_metrics": {
    "vcf_parsing_success": true,
    "variants_detected": 1,
    "llm_confidence": 0.9
  }
}
```

### Risk Label Values (Enum)
| Value | Description |
|-------|-------------|
| `Safe` | Standard dosing appropriate |
| `Adjust Dosage` | Dose modification recommended |
| `Toxic` | High toxicity risk |
| `Ineffective` | Reduced/no efficacy expected |
| `Unknown` | Insufficient data for assessment |

### Phenotype Values (Enum)
| Value | Description |
|-------|-------------|
| `PM` | Poor Metabolizer |
| `IM` | Intermediate Metabolizer |
| `NM` | Normal Metabolizer |
| `RM` | Rapid Metabolizer |
| `URM` | Ultrarapid Metabolizer |
| `Unknown` | Cannot be determined |

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
pharmanew/
├── src/
│   ├── app/
│   │   ├── api/analyze/
│   │   │   └── route.ts          # Main analysis API (hackathon-compliant)
│   │   ├── app/
│   │   │   └── page.tsx          # Main application interface
│   │   ├── globals.css           # Global styles
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── DrugSelector.tsx      # Drug selection dropdown
│   │   ├── FileUpload.tsx        # VCF file upload (drag-drop)
│   │   ├── Header.tsx            # Application header
│   │   ├── ResultsDisplay.tsx    # Risk results visualization
│   │   └── charts/               # Data visualization components
│   └── lib/
│       ├── DrugGeneMap.ts        # 6 drugs ↔ 6 genes mapping
│       ├── LLMExplain.ts         # OpenAI/Gemini integration
│       ├── RiskEngine.ts         # CPIC-aligned risk assessment
│       ├── StarAlleleCalling.ts  # Diplotype calling engine
│       ├── VCFParser.ts          # VCF v4.2 parser
│       ├── VariantPhenotypeMap.ts# Genotype → Phenotype mapping
│       └── types.ts              # TypeScript definitions
├── public/
│   └── sample.vcf                # Sample VCF for testing
├── sample_data.vcf               # Additional test file
├── sample_patient.vcf            # Patient test case
├── .env.example                  # Environment template
├── package.json                  # Dependencies
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

### Sample VCF Files Included

| File | Description |
|------|-------------|
| `public/sample.vcf` | General pharmacogenomic test file |
| `sample_data.vcf` | Comprehensive variant data |
| `sample_patient.vcf` | Patient-specific test case |

### Manual Testing Steps

1. **Open Application**: Navigate to https://pharmanew-z518.vercel.app/
2. **Upload VCF**: Use drag-and-drop or file picker with `public/sample.vcf`
3. **Select Drug**: Choose from dropdown (e.g., "CODEINE", "WARFARIN")
4. **Analyze**: Click "Analyze Risk" button
5. **Review Results**: Examine risk label, clinical recommendations, LLM explanation
6. **Export**: Download JSON or copy to clipboard

### Test Cases

| Drug | Expected Gene | Test Scenario |
|------|---------------|---------------|
| CODEINE | CYP2D6 | Normal metabolizer → Safe |
| WARFARIN | CYP2C9 | Missing VKORC1 → Unknown |
| CLOPIDOGREL | CYP2C19 | Poor metabolizer → Ineffective |
| SIMVASTATIN | SLCO1B1 | Decreased function → Adjust Dosage |
| AZATHIOPRINE | TPMT | Poor metabolizer → Toxic |
| FLUOROURACIL | DPYD | Normal → Safe |

## 📄 License

This project is licensed under the MIT License.

---

**⚠️ Disclaimer**: This application is for clinical decision support and educational purposes only. It should not be used as the sole basis for medical decisions. Always consult with qualified healthcare professionals and follow institutional guidelines.

**Built with ❤️ for precision medicine and improved patient outcomes.**

## 👥 Team Members

| Member | Role | Contributions |
|--------|------|---------------|
| **Shufwath Raqeeb S** | Backend & Genomic Data Processing | VCF Parser, Star Allele Calling Engine |
| **Suhas D** | Full Stack Development & AI Integration | Next.js Architecture, OpenAI/Gemini Integration |
| **Shiva Ganesh S R** | Risk Engine & CPIC Logic Implementation | CPIC Guidelines, Risk Assessment Logic |
| **Harteij V K Raju** | UI/UX & Deployment Engineering | React Components, Vercel Deployment |

---

**Built for RIFT 2026 Hackathon — Precision Medicine & Improved Patient Outcomes**
