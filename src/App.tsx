import React, { useState } from 'react';
import { Header } from './components/Header';
import { PerspectiveQuizFunnel } from './components/PerspectiveQuizFunnel';
import { SuccessView } from './components/SuccessView';
import { TechnicalConfigModal } from './components/TechnicalConfigModal';
import { deckingQuizConfig } from './config/deckingQuoteConfig';
import { SubmissionResult, DeckingQuoteFormData } from './types';

export default function App() {
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    result: SubmissionResult;
    formData: DeckingQuoteFormData;
  } | null>(null);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [overrideEndpoint, setOverrideEndpoint] = useState<string | undefined>(undefined);

  const handleSuccess = (result: SubmissionResult, formData: DeckingQuoteFormData) => {
    setSubmissionSuccess({ result, formData });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSubmissionSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F6F0EA] text-[#362617] flex flex-col font-mono selection:bg-[#AD855C] selection:text-white">
      {/* 1. Top Header with Small ARKLINE Logo */}
      <Header onOpenConfig={() => setIsConfigOpen(true)} />

      {/* 2. Main Funnel Container (Centred max-w-[600px], comfortable mobile padding) */}
      <main className="flex-1 w-full flex flex-col justify-center">
        {submissionSuccess ? (
          <SuccessView
            result={submissionSuccess.result}
            formData={submissionSuccess.formData}
            onReset={handleReset}
          />
        ) : (
          <PerspectiveQuizFunnel
            onSuccess={handleSuccess}
            overrideEndpoint={overrideEndpoint}
          />
        )}
      </main>

      {/* 3. Quiet Legal Footer */}
      <footer className="w-full py-4 text-[11px] text-[#362617]/60 text-center border-t border-[#362617]/10 bg-white/40">
        <div className="max-w-[600px] mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} {deckingQuizConfig.brand.name}</span>
          <div className="flex items-center gap-3">
            <a
              href={deckingQuizConfig.contact.privacyPolicyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#362617] transition-colors"
            >
              Privacy Policy
            </a>
            <button
              type="button"
              onClick={() => setIsConfigOpen(true)}
              className="hover:text-[#362617] underline transition-colors cursor-pointer"
            >
              Technical Setup
            </button>
          </div>
        </div>
      </footer>

      {/* 4. Deployment & Technical Reference Drawer (Kept outside customer-facing view) */}
      <TechnicalConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        overrideEndpoint={overrideEndpoint}
        setOverrideEndpoint={setOverrideEndpoint}
      />
    </div>
  );
}
