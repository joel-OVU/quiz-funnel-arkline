import React, { useState } from 'react';
import { X, Server, Check } from 'lucide-react';
import { deckingQuizConfig } from '../config/deckingQuoteConfig';
import { getCampaignParameters } from '../utils/validation';

interface TechnicalConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  overrideEndpoint: string | undefined;
  setOverrideEndpoint: (endpoint: string | undefined) => void;
}

export const TechnicalConfigModal: React.FC<TechnicalConfigModalProps> = ({
  isOpen,
  onClose,
  overrideEndpoint,
  setOverrideEndpoint,
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const activeEndpoint =
    overrideEndpoint !== undefined ? overrideEndpoint : deckingQuizConfig.business.submissionEndpoint;

  const campaignParams = getCampaignParameters();

  if (!isOpen) return null;

  const isConnected = !!activeEndpoint && activeEndpoint !== 'UNCONNECTED';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-step-transition"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tech-modal-title"
    >
      <div className="w-full max-w-xl bg-[#FFFFFF] border border-[#362617]/20 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto text-[#362617]">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#362617]/10 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#F6F0EA] text-[#AD855C] text-[10px] font-mono font-bold">
                QUIZ FUNNEL CONFIG
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  isConnected
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {isConnected ? 'Endpoint Connected' : 'Unconnected State'}
              </span>
            </div>
            <h2 id="tech-modal-title" className="text-lg sm:text-xl font-bold text-[#362617] mt-1">
              Configuration & Deployment Guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#362617]/60 hover:text-[#362617] transition-colors"
            aria-label="Close configuration modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Endpoint Testing Toggle */}
        <div className="p-4 rounded-2xl bg-[#F6F0EA] border border-[#362617]/15 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#362617] flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#AD855C]" />
              Submission Endpoint Control
            </span>
            <span className="font-mono text-[#AD855C]">{activeEndpoint || '(Unset)'}</span>
          </div>

          <p className="text-[11px] text-[#362617]/75 leading-relaxed">
            Per system instructions, if no backend is configured, the form marks submissions as
            unconnected and never simulates a fake successful enquiry.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOverrideEndpoint(deckingQuizConfig.business.submissionEndpoint)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                isConnected
                  ? 'bg-[#362617] text-white border-[#362617]'
                  : 'bg-white text-[#362617] border-[#362617]/20 hover:bg-[#F6F0EA]'
              }`}
            >
              ✓ Set Connected (/api/quote-request)
            </button>
            <button
              type="button"
              onClick={() => setOverrideEndpoint('')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                !isConnected
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-[#362617] border-[#362617]/20 hover:bg-[#F6F0EA]'
              }`}
            >
              ⚠ Simulate Unconnected State
            </button>
          </div>
        </div>

        {/* Configurable Parameters Table */}
        <div className="space-y-2 text-xs">
          <span className="font-bold text-[#AD855C] tracking-wider uppercase block text-[10px]">
            Key Config Parameters (src/config/deckingQuoteConfig.ts)
          </span>

          <div className="rounded-2xl border border-[#362617]/15 overflow-hidden text-[11px] divide-y divide-[#362617]/10">
            <div className="p-2.5 bg-white grid grid-cols-12 gap-2">
              <span className="col-span-4 font-mono font-bold text-[#362617]">brand.name</span>
              <span className="col-span-8 text-[#362617]/80">{deckingQuizConfig.brand.name}</span>
            </div>
            <div className="p-2.5 bg-[#F6F0EA]/40 grid grid-cols-12 gap-2">
              <span className="col-span-4 font-mono font-bold text-[#362617]">submissionEndpoint</span>
              <span className="col-span-8 font-mono text-[#362617]">{deckingQuizConfig.business.submissionEndpoint}</span>
            </div>
            <div className="p-2.5 bg-white grid grid-cols-12 gap-2">
              <span className="col-span-4 font-mono font-bold text-[#362617]">phoneNumber</span>
              <span className="col-span-8 text-[#362617]/80">{deckingQuizConfig.business.phoneNumber} (leave empty to hide)</span>
            </div>
            <div className="p-2.5 bg-[#F6F0EA]/40 grid grid-cols-12 gap-2">
              <span className="col-span-4 font-mono font-bold text-[#362617]">privacyPolicyUrl</span>
              <span className="col-span-8 text-[#362617]/80 truncate">{deckingQuizConfig.contact.privacyPolicyUrl}</span>
            </div>
            <div className="p-2.5 bg-white grid grid-cols-12 gap-2">
              <span className="col-span-4 font-mono font-bold text-[#362617]">callWindows</span>
              <span className="col-span-8 text-[#362617]/80">{deckingQuizConfig.questions.q4.options.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Campaign Parameters Status */}
        <div className="p-3.5 rounded-2xl bg-[#F6F0EA] border border-[#362617]/10 space-y-1.5 text-xs">
          <span className="font-bold text-[#362617]">Campaign Tracking (UTM)</span>
          <p className="text-[11px] text-[#362617]/70">
            UTM parameters are parsed at submission time and sent separately from personal contact info.
          </p>
          <pre className="p-2 rounded-xl bg-white border border-[#362617]/10 font-mono text-[10px] text-[#362617] overflow-x-auto">
            {JSON.stringify(campaignParams, null, 2)}
          </pre>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#362617] text-white font-bold text-xs hover:bg-[#22170d] transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
