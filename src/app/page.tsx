import Link from 'next/link';
import { ArrowRight, CheckCircle, ClipboardList, FlaskConical, ShieldCheck, Target } from 'lucide-react';

const workflow = [
  {
    title: '1. Upload VCF',
    description: 'Securely ingest a VCF file with local validation and privacy-first parsing.'
  },
  {
    title: '2. Parse Variants',
    description: 'Extract pharmacogenomic markers (genes, rsIDs, star alleles) from INFO fields.'
  },
  {
    title: '3. Map Phenotypes',
    description: 'Translate diplotypes into clinically meaningful phenotypes.'
  },
  {
    title: '4. Assess Risk',
    description: 'Apply CPIC-backed logic to classify risk and dosing guidance.'
  },
  {
    title: '5. Explain',
    description: 'Generate clear clinical and patient summaries with AI assistance.'
  },
  {
    title: '6. Deliver',
    description: 'Return structured results for export, sharing, or audit.'
  }
];

const features = [
  {
    icon: <FlaskConical className="h-6 w-6" />,
    title: 'AI-Powered Explanations',
    description: 'Dual-audience summaries for clinicians and patients, grounded in the evidence.'
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: 'CPIC-Aligned Guidance',
    description: 'Dose and therapy recommendations mapped to recognized guidelines.'
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Clinical-Grade UX',
    description: 'Clear status, confidence signals, and export-ready results.'
  },
  {
    icon: <ClipboardList className="h-6 w-6" />,
    title: 'Polypharmacy Ready',
    description: 'Evaluate multiple drug risks to surface interaction and safety concerns.'
  }
];

export default function Home() {
  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(11,106,169,0.16),_transparent_55%)]" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 max-w-6xl">
          <div className="max-w-3xl animate-rise-in">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold badge-premium">
              <CheckCircle className="h-4 w-4" />
              Precision Pharmacogenomics Platform
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 leading-tight">
              PharmaGuard turns genomic evidence into clinical prescribing decisions.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed">
              Upload VCF data, select medications, and receive CPIC-aligned risk insights with actionable recommendations. Built for safety, clarity, and real-world clinical workflows.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-white font-semibold shadow-lg transition-all bg-gradient-to-r from-cyan-700 to-sky-700 hover:from-cyan-800 hover:to-sky-800"
              >
                Launch Analysis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#workflow"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-slate-700 font-semibold hover:border-slate-400 hover:text-slate-900 transition-all"
              >
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-6xl">
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="card-clinical">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="workflow" className="bg-white/70 border-y border-slate-200/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">From raw data to actionable insight</h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">A transparent pipeline clinicians can trust.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workflow.map((step) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900">Designed for precision medicine teams</h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
              PharmaGuard bridges the gap between complex genomic data and bedside decisions. It pairs a deterministic risk engine with AI-generated explanations to help clinicians act confidently while keeping patients informed.
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />
                <p className="text-sm text-gray-600">Supports core pharmacogenes and high-impact medications with confidence scores.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />
                <p className="text-sm text-gray-600">Outputs shareable JSON reports for clinical documentation.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />
                <p className="text-sm text-gray-600">Privacy-first workflow: data stays local until analysis submission.</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h3 className="text-lg font-semibold text-blue-900">Clinical safety notes</h3>
            <p className="mt-3 text-sm text-blue-900/80 leading-relaxed">
              PharmaGuard is designed to assist clinical decision making, not replace it. Always validate against institutional policy and current CPIC guidelines.
            </p>
            <div className="mt-6">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                Start an analysis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 max-w-6xl">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-10 sm:px-10 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-semibold">Ready to analyze your first VCF?</h2>
              <p className="mt-2 text-sm sm:text-base text-blue-100">
                Launch the analysis workspace and get risk results in minutes.
              </p>
            </div>
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-blue-700 font-semibold shadow-lg hover:bg-blue-50 transition-all"
            >
              Go to Analysis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
