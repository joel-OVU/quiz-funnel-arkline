import React from 'react';
import { CheckCircle2, Phone, MapPin, Clock, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import { SubmissionResult, DeckingQuoteFormData } from '../types';
import { deckingQuizConfig } from '../config/deckingQuoteConfig';

interface SuccessViewProps {
  result: SubmissionResult;
  formData: DeckingQuoteFormData;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  result,
  formData,
  onReset,
}) => {
  const hasPhoneConfigured = !!deckingQuizConfig.business.phoneNumber;

  return (
    <div className="w-full max-w-[600px] mx-auto px-4 py-4 sm:py-6 flex flex-col justify-center animate-step-transition">
      <div className="w-full bg-[#FFFFFF] border border-[#362617]/15 rounded-3xl p-6 sm:p-9 shadow-sm space-y-6">
        {/* Success Icon & Headline */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#F6F0EA] border-2 border-[#AD855C] flex items-center justify-center mx-auto text-[#AD855C]">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" aria-hidden="true" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#362617] leading-[1.2]">
            {deckingQuizConfig.success.headline}
          </h2>

          <p className="text-sm sm:text-base text-[#362617]/80 leading-[1.4] max-w-md mx-auto">
            {deckingQuizConfig.success.description}
          </p>

          {result.enquiryId && (
            <div className="pt-1">
              <span className="inline-block px-3 py-1 rounded-full bg-[#F6F0EA] border border-[#362617]/15 text-xs font-mono font-bold text-[#362617]">
                Enquiry Ref: {result.enquiryId}
              </span>
            </div>
          )}
        </div>

        {/* Selected Project Summary */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F6F0EA] border border-[#362617]/10 space-y-2.5 text-xs sm:text-sm">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#AD855C] block">
            Your Project Summary
          </span>

          <div className="flex items-center justify-between border-b border-[#362617]/10 pb-2">
            <span className="text-[#362617]/70">Homeowner</span>
            <span className="font-bold text-[#362617]">{formData.fullName}</span>
          </div>

          <div className="flex items-center justify-between border-b border-[#362617]/10 pb-2">
            <span className="text-[#362617]/70 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#AD855C]" />
              Postcode
            </span>
            <span className="font-mono font-bold text-[#362617]">{formData.postcode}</span>
          </div>

          <div className="flex items-center justify-between border-b border-[#362617]/10 pb-2">
            <span className="text-[#362617]/70">Project Plan</span>
            <span className="font-bold text-[#362617] text-right">{formData.gardenOption}</span>
          </div>

          <div className="flex items-center justify-between border-b border-[#362617]/10 pb-2">
            <span className="text-[#362617]/70">Timeframe</span>
            <span className="font-bold text-[#362617]">{formData.timeframe}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#362617]/70 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#AD855C]" />
              Best Call Window
            </span>
            <span className="font-bold text-[#362617]">{formData.callTime}</span>
          </div>
        </div>

        {/* Journey Alignment Notice */}
        <div className="p-4 rounded-2xl bg-white border border-[#362617]/15 space-y-2">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#362617] block">
            Aligned Journey Next Steps
          </span>
          <div className="text-xs text-[#362617]/80 space-y-1.5">
            <p className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#AD855C] text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <span><strong>Phone Call</strong> — An ARKLINE specialist calls during your preferred window.</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#F6F0EA] border border-[#362617]/20 text-[#362617] flex items-center justify-center text-[10px] font-bold">2</span>
              <span><strong>Appointment</strong> — Convenient in-person visit to inspect your garden space.</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#F6F0EA] border border-[#362617]/20 text-[#362617] flex items-center justify-center text-[10px] font-bold">3</span>
              <span><strong>Free Quote</strong> — Detailed itemised quote with zero commitment to purchase.</span>
            </p>
          </div>
        </div>

        {/* Optional Secondary Action: Call ARKLINE */}
        {hasPhoneConfigured && (
          <div className="p-4 rounded-2xl bg-[#F6F0EA] border border-[#362617]/10 text-center space-y-2.5">
            <p className="text-xs sm:text-sm font-bold text-[#362617]">
              {deckingQuizConfig.success.secondaryActionText}
            </p>
            <a
              href={`tel:${deckingQuizConfig.business.phoneNumber.replace(/\s+/g, '')}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#362617] hover:bg-[#22170d] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-[#AD855C]"
            >
              <Phone className="w-4 h-4 text-[#AD855C]" aria-hidden="true" />
              <span>Call {deckingQuizConfig.business.displayPhoneNumber}</span>
            </a>
          </div>
        )}

        {/* Reset Action */}
        <div className="text-center pt-1 border-t border-[#362617]/10">
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-[#362617]/70 hover:text-[#362617] underline transition-colors cursor-pointer"
          >
            Submit another enquiry
          </button>
        </div>
      </div>
    </div>
  );
};
