import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
  Lock,
  MapPin,
  Trophy,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { deckingQuizConfig } from '../config/deckingQuoteConfig';
import { DeckingQuoteFormData, GardenOption, TimeframeOption, SubmissionResult } from '../types';
import {
  normalizePostcode,
  isValidUKPostcode,
  normalizePhone,
  isValidUKPhone,
  getCampaignParameters,
} from '../utils/validation';
import { measurement } from '../utils/measurement';

interface PerspectiveQuizFunnelProps {
  onSuccess: (result: SubmissionResult, formData: DeckingQuoteFormData) => void;
  overrideEndpoint?: string;
}

// Stage sequence:
// 0: Welcome Screen
// 1: Question 1 of 4 (Garden consideration)
// 2: Question 2 of 4 (Postcode)
// 3: Question 3 of 4 (Timing)
// 4: Question 4 of 4 (Call window)
// 5: Contact Details stage
export type QuizStage = 0 | 1 | 2 | 3 | 4 | 5;

export const PerspectiveQuizFunnel: React.FC<PerspectiveQuizFunnelProps> = ({
  onSuccess,
  overrideEndpoint,
}) => {
  const [stage, setStage] = useState<QuizStage>(0);
  const [formData, setFormData] = useState<DeckingQuoteFormData>({
    gardenOption: '',
    postcode: '',
    timeframe: '',
    callTime: '',
    fullName: '',
    phone: '',
    honeypot: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isUnconnectedWarning, setIsUnconnectedWarning] = useState(false);

  // Focus ref for screen reader and keyboard accessibility
  const headingRef = useRef<HTMLHeadingElement>(null);
  const postcodeInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Shift focus to the new question heading after advancing
  useEffect(() => {
    setValidationError(null);
    setServerError(null);

    // Focus management
    if (stage === 2) {
      setTimeout(() => postcodeInputRef.current?.focus(), 120);
    } else if (stage === 5) {
      setTimeout(() => nameInputRef.current?.focus(), 120);
    } else {
      setTimeout(() => headingRef.current?.focus(), 100);
    }
  }, [stage]);

  // Stage navigation
  const handleStartQuiz = () => {
    const campaign = getCampaignParameters();
    measurement.trackQuizStarted(campaign);
    setStage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromQ1 = () => {
    if (!formData.gardenOption) {
      setValidationError('Please select an option for your garden to continue.');
      return;
    }
    setValidationError(null);
    measurement.trackStepCompleted(1, 'garden_plan');
    setStage(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromQ2 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPostcode = formData.postcode.trim();
    if (!cleanPostcode) {
      setValidationError('Please enter your property postcode.');
      return;
    }
    if (!isValidUKPostcode(cleanPostcode)) {
      setValidationError('Please enter a valid UK postcode (e.g. DY8 1AA).');
      return;
    }
    setValidationError(null);
    measurement.trackStepCompleted(2, 'postcode');
    setStage(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromQ3 = () => {
    if (!formData.timeframe) {
      setValidationError('Please select when you would like the work done.');
      return;
    }
    setValidationError(null);
    measurement.trackStepCompleted(3, 'timeframe');
    setStage(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromQ4 = () => {
    if (!formData.callTime) {
      setValidationError('Please select the best time for our team to call.');
      return;
    }
    setValidationError(null);
    measurement.trackStepCompleted(4, 'call_window');
    setStage(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setValidationError(null);
    setServerError(null);
    if (stage > 0) {
      setStage((prev) => (prev - 1) as QuizStage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit Contact Details & Trigger Verified Enquiry
  const effectiveEndpoint =
    overrideEndpoint !== undefined ? overrideEndpoint : deckingQuizConfig.business.submissionEndpoint;

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setServerError(null);
    setIsUnconnectedWarning(false);

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setValidationError('Please enter your full name.');
      return;
    }

    if (!formData.phone.trim()) {
      setValidationError('Please enter your telephone number so we can call you.');
      return;
    }

    if (!isValidUKPhone(formData.phone)) {
      setValidationError('Please enter a valid UK telephone number (e.g. 07123 456789 or 01384 123456).');
      return;
    }

    // Unconnected backend protection rule
    // "If no backend is configured, clearly mark the integration as unconnected. Do not simulate a successful real enquiry."
    if (!effectiveEndpoint || effectiveEndpoint.trim() === '' || effectiveEndpoint === 'UNCONNECTED') {
      setIsUnconnectedWarning(true);
      setServerError(
        'Submission Unconnected: No backend submission endpoint has been configured. In accordance with system instructions, enquiries are never simulated without a verified endpoint. Please configure your endpoint in deckingQuoteConfig.ts.'
      );
      return;
    }

    setIsSubmitting(true);

    const campaignParams = getCampaignParameters();

    const payload = {
      gardenOption: formData.gardenOption,
      postcode: normalizePostcode(formData.postcode),
      timeframe: formData.timeframe,
      callTime: formData.callTime,
      fullName: formData.fullName.trim(),
      phone: normalizePhone(formData.phone),
      honeypot: formData.honeypot, // Spam honeypot
      utm: campaignParams,
      submittedAt: new Date().toISOString(),
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
    };

    try {
      const response = await fetch(effectiveEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errMsg = `Server responded with status ${response.status}`;
        try {
          const json = await response.json();
          if (json && json.error) errMsg = json.error;
        } catch {
          // fallback
        }
        throw new Error(errMsg);
      }

      const data = await response.json();

      // Show success only when the backend confirms the enquiry was saved
      if (data && data.success) {
        const enquiryId = data.enquiryId || `ARK-${Date.now().toString().slice(-6)}`;
        measurement.trackLeadSubmitted(enquiryId, campaignParams);

        onSuccess(
          {
            success: true,
            enquiryId,
            message: data.message || 'Enquiry recorded',
            timestamp: data.timestamp || new Date().toISOString(),
          },
          formData
        );
      } else {
        throw new Error(data.error || 'The endpoint did not confirm receipt of your enquiry.');
      }
    } catch (err: unknown) {
      console.error('[ARKLINE Submission Error]:', err);
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to connect to the quote submission server. Please check your connection and retry.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress Bar calculation
  // Stage 1 -> 25%, Stage 2 -> 50%, Stage 3 -> 75%, Stage 4 -> 100%, Stage 5 -> 100%
  const getProgressPercentage = () => {
    if (stage === 0) return 0;
    if (stage === 1) return 25;
    if (stage === 2) return 50;
    if (stage === 3) return 75;
    return 100;
  };

  return (
    <div className="w-full max-w-[600px] mx-auto px-4 py-4 sm:py-6 flex flex-col justify-center min-h-[calc(100vh-140px)]">
      {/* =========================================================================
          STAGE 0: WELCOME SCREEN
      ========================================================================= */}
      {stage === 0 && (
        <div className="w-full bg-[#FFFFFF] border border-[#362617]/15 rounded-3xl p-6 sm:p-9 shadow-sm space-y-6 animate-step-transition">
          {/* Trust Kicker & Proof */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F0EA] border border-[#AD855C]/40 text-[#362617] font-bold">
                <Trophy className="w-3.5 h-3.5 text-[#AD855C]" aria-hidden="true" />
                <span>{deckingQuizConfig.brand.proofBadge}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F6F0EA] text-[#362617]/70 text-[11px]">
                <MapPin className="w-3 h-3 text-[#AD855C]" aria-hidden="true" />
                <span>{deckingQuizConfig.brand.serviceArea}</span>
              </span>
            </div>

            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#362617] leading-[1.2] outline-none"
            >
              {deckingQuizConfig.welcome.headline}
            </h1>

            <p className="text-sm sm:text-base text-[#362617]/80 leading-[1.4]">
              {deckingQuizConfig.welcome.supportingText}
            </p>
          </div>

          {/* Genuine Project Photo (Supplied from ARKLINE's homepage) */}
          <div className="space-y-1.5">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] border border-[#362617]/10 bg-[#F6F0EA]">
              <img
                src={deckingQuizConfig.welcome.deckingPhotoUrl}
                alt={deckingQuizConfig.welcome.deckingPhotoAlt}
                className="w-full h-full object-cover"
                loading="eager"
                width="560"
                height="350"
              />
            </div>
            <p className="text-[11px] text-[#362617]/60 italic text-center">
              {deckingQuizConfig.welcome.deckingPhotoCaption}
            </p>
          </div>

          {/* Journey Steps Preview: Transparent and Aligned */}
          <div className="p-3.5 rounded-2xl bg-[#F6F0EA] border border-[#362617]/10 space-y-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#AD855C] block">
              Clear 4-Step Process
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-white border border-[#362617]/10">
                <span className="font-bold text-[#362617] block">1. Form</span>
                <span className="text-[10px] text-[#362617]/70">Tell us ideas</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-[#362617]/10">
                <span className="font-bold text-[#362617] block">2. Call</span>
                <span className="text-[10px] text-[#362617]/70">Quick phone chat</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-[#362617]/10">
                <span className="font-bold text-[#362617] block">3. Visit</span>
                <span className="text-[10px] text-[#362617]/70">Measure up</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-[#362617]/10">
                <span className="font-bold text-[#362617] block">4. Quote</span>
                <span className="text-[10px] text-[#362617]/70">Zero obligation</span>
              </div>
            </div>
          </div>

          {/* Start CTA Button: Solid Pill in Deep Brown with White text */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartQuiz}
              className="w-full py-4 px-8 rounded-full bg-[#362617] hover:bg-[#22170d] text-[#FFFFFF] font-bold text-base sm:text-lg tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer focus-visible:outline-3 focus-visible:outline-[#AD855C]"
            >
              <span>{deckingQuizConfig.welcome.startButtonText}</span>
              <ArrowRight className="w-5 h-5 text-[#AD855C]" />
            </button>
            <p className="text-center text-[11px] text-[#362617]/60 pt-2">
              Free enquiry · No credit card · Zero purchasing commitment
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGES 1 to 5: PERSPECTIVE-STYLE QUIZ QUESTION CONTAINER
      ========================================================================= */}
      {stage >= 1 && (
        <div className="w-full bg-[#FFFFFF] border border-[#362617]/15 rounded-3xl p-6 sm:p-9 shadow-sm space-y-6 animate-step-transition">
          {/* Top Progress & Stage Header */}
          <div className="space-y-2 border-b border-[#362617]/10 pb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#AD855C] tracking-wide uppercase">
                {stage <= 4 ? `Question ${stage} of 4` : 'Your contact details'}
              </span>
              <span className="font-mono text-[#362617]/60 tabular-nums">
                {getProgressPercentage()}%
              </span>
            </div>

            {/* Smooth Track Progress Bar */}
            <div className="w-full h-2 bg-[#F6F0EA] rounded-full overflow-hidden border border-[#362617]/10">
              <div
                className="h-full bg-[#362617] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
                role="progressbar"
                aria-valuenow={getProgressPercentage()}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>

          {/* ================= QUESTION 1 of 4 ================= */}
          {stage === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-xl sm:text-2xl font-bold text-[#362617] leading-[1.2] outline-none"
                >
                  {deckingQuizConfig.questions.q1.title}
                </h2>
                <p className="text-xs text-[#362617]/70">
                  Select your garden requirement, then tap Continue:
                </p>
              </div>

              {/* Large selectable answer cards */}
              <div className="space-y-3" role="radiogroup" aria-label={deckingQuizConfig.questions.q1.title}>
                {deckingQuizConfig.questions.q1.options.map((option) => {
                  const isSelected = formData.gardenOption === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, gardenOption: option as GardenOption }));
                        setValidationError(null);
                      }}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-3 focus-visible:outline-[#AD855C] min-h-[64px] ${
                        isSelected
                          ? 'bg-[#F6F0EA] border-2 border-[#362617] shadow-sm'
                          : 'bg-[#FFFFFF] border-[#362617]/20 hover:border-[#362617]/50 hover:bg-[#F6F0EA]/40'
                      }`}
                    >
                      <span className="text-sm sm:text-base font-bold text-[#362617] leading-snug">
                        {option}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-[#362617] bg-[#362617]'
                            : 'border-[#362617]/30 bg-white'
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Actions */}
              {validationError && (
                <p className="text-xs text-[#b91c1c] flex items-center gap-1.5" role="alert">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </p>
              )}

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#362617]/10">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 rounded-full border border-[#362617]/25 text-xs sm:text-sm font-bold text-[#362617] hover:bg-[#F6F0EA] transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#AD855C]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextFromQ1}
                  className="px-7 py-3.5 rounded-full bg-[#362617] hover:bg-[#22170d] text-[#FFFFFF] text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer focus-visible:outline-3 focus-visible:outline-[#AD855C]"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 text-[#AD855C]" />
                </button>
              </div>
            </div>
          )}

          {/* ================= QUESTION 2 of 4 ================= */}
          {stage === 2 && (
            <form onSubmit={handleNextFromQ2} className="space-y-6">
              <div className="space-y-1">
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-xl sm:text-2xl font-bold text-[#362617] leading-[1.2] outline-none"
                >
                  {deckingQuizConfig.questions.q2.title}
                </h2>
                <p className="text-xs text-[#362617]/70">
                  {deckingQuizConfig.questions.q2.helperText}
                </p>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <MapPin className="w-5 h-5 text-[#AD855C] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={postcodeInputRef}
                    type="text"
                    name="postal-code"
                    autoComplete="postal-code"
                    placeholder={deckingQuizConfig.questions.q2.placeholder}
                    value={formData.postcode}
                    maxLength={10}
                    onChange={(e) => {
                      const norm = normalizePostcode(e.target.value);
                      setFormData((prev) => ({ ...prev, postcode: norm }));
                      if (validationError) setValidationError(null);
                    }}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F6F0EA] border border-[#362617]/25 text-[#362617] font-mono text-base sm:text-lg uppercase placeholder:text-[#362617]/40 focus:outline-none focus:ring-2 focus:ring-[#362617] transition-all"
                    aria-describedby="postcode-helper"
                  />
                </div>
                <p id="postcode-helper" className="text-[11px] text-[#362617]/60">
                  We serve Stourbridge and surrounding areas.
                </p>

                {validationError && (
                  <p className="text-xs text-[#b91c1c] flex items-center gap-1.5 pt-1" role="alert">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </p>
                )}
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#362617]/10">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 rounded-full border border-[#362617]/25 text-xs sm:text-sm font-bold text-[#362617] hover:bg-[#F6F0EA] transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#AD855C]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-full bg-[#362617] hover:bg-[#22170d] text-[#FFFFFF] text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer focus-visible:outline-3 focus-visible:outline-[#AD855C]"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 text-[#AD855C]" />
                </button>
              </div>
            </form>
          )}

          {/* ================= QUESTION 3 of 4 ================= */}
          {stage === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-xl sm:text-2xl font-bold text-[#362617] leading-[1.2] outline-none"
                >
                  {deckingQuizConfig.questions.q3.title}
                </h2>
                <p className="text-xs text-[#362617]/70">
                  Select your expected timeframe, then tap Continue:
                </p>
              </div>

              {/* Large selectable answer cards */}
              <div className="space-y-3" role="radiogroup" aria-label={deckingQuizConfig.questions.q3.title}>
                {deckingQuizConfig.questions.q3.options.map((option) => {
                  const isSelected = formData.timeframe === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, timeframe: option as TimeframeOption }));
                        setValidationError(null);
                      }}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-3 focus-visible:outline-[#AD855C] min-h-[64px] ${
                        isSelected
                          ? 'bg-[#F6F0EA] border-2 border-[#362617] shadow-sm'
                          : 'bg-[#FFFFFF] border-[#362617]/20 hover:border-[#362617]/50 hover:bg-[#F6F0EA]/40'
                      }`}
                    >
                      <span className="text-sm sm:text-base font-bold text-[#362617] leading-snug">
                        {option}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-[#362617] bg-[#362617]'
                            : 'border-[#362617]/30 bg-white'
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {validationError && (
                <p className="text-xs text-[#b91c1c] flex items-center gap-1.5" role="alert">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </p>
              )}

              {/* Navigation Actions */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#362617]/10">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 rounded-full border border-[#362617]/25 text-xs sm:text-sm font-bold text-[#362617] hover:bg-[#F6F0EA] transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#AD855C]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextFromQ3}
                  className="px-7 py-3.5 rounded-full bg-[#362617] hover:bg-[#22170d] text-[#FFFFFF] text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer focus-visible:outline-3 focus-visible:outline-[#AD855C]"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 text-[#AD855C]" />
                </button>
              </div>
            </div>
          )}

          {/* ================= QUESTION 4 of 4 ================= */}
          {stage === 4 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-xl sm:text-2xl font-bold text-[#362617] leading-[1.2] outline-none"
                >
                  {deckingQuizConfig.questions.q4.title}
                </h2>
                <p className="text-xs text-[#362617]/70">
                  Select your preferred call window, then tap Continue:
                </p>
              </div>

              {/* Large selectable answer cards */}
              <div className="space-y-3" role="radiogroup" aria-label={deckingQuizConfig.questions.q4.title}>
                {deckingQuizConfig.questions.q4.options.map((timeOption) => {
                  const isSelected = formData.callTime === timeOption;
                  return (
                    <button
                      key={timeOption}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, callTime: timeOption }));
                        setValidationError(null);
                      }}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-3 focus-visible:outline-[#AD855C] min-h-[64px] ${
                        isSelected
                          ? 'bg-[#F6F0EA] border-2 border-[#362617] shadow-sm'
                          : 'bg-[#FFFFFF] border-[#362617]/20 hover:border-[#362617]/50 hover:bg-[#F6F0EA]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-[#AD855C] shrink-0" />
                        <span className="text-sm sm:text-base font-bold text-[#362617]">
                          {timeOption}
                        </span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-[#362617] bg-[#362617]'
                            : 'border-[#362617]/30 bg-white'
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {validationError && (
                <p className="text-xs text-[#b91c1c] flex items-center gap-1.5" role="alert">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </p>
              )}

              {/* Navigation Actions */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#362617]/10">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 rounded-full border border-[#362617]/25 text-xs sm:text-sm font-bold text-[#362617] hover:bg-[#F6F0EA] transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#AD855C]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextFromQ4}
                  className="px-7 py-3.5 rounded-full bg-[#362617] hover:bg-[#22170d] text-[#FFFFFF] text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer focus-visible:outline-3 focus-visible:outline-[#AD855C]"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 text-[#AD855C]" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STAGE 5: SEPARATE CONTACT DETAILS STAGE ================= */}
          {stage === 5 && (
            <form onSubmit={handleSubmitContact} noValidate className="space-y-6">
              {/* Spam Honeypot Field */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website_hp"
                  value={formData.honeypot}
                  onChange={(e) => setFormData((prev) => ({ ...prev, honeypot: e.target.value }))}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-1">
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-xl sm:text-2xl font-bold text-[#362617] leading-[1.2] outline-none"
                >
                  {deckingQuizConfig.contact.headline}
                </h2>
                <p className="text-xs sm:text-sm text-[#362617]/75">
                  {deckingQuizConfig.contact.supportingText}
                </p>
              </div>

              {/* Notice above the fields */}
              <div className="p-4 rounded-2xl bg-[#F6F0EA] border border-[#AD855C]/40 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#AD855C] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs text-[#362617] leading-relaxed">
                  {deckingQuizConfig.contact.noticeText}
                </p>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="contact-full-name" className="block text-xs font-bold text-[#362617]">
                    Full name <span className="text-[#AD855C]">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    id="contact-full-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="e.g. David Harrison"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, fullName: e.target.value }));
                      if (validationError) setValidationError(null);
                    }}
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F6F0EA] border border-[#362617]/25 text-[#362617] text-base placeholder:text-[#362617]/40 focus:outline-none focus:ring-2 focus:ring-[#362617] transition-all"
                    aria-required="true"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label htmlFor="contact-phone" className="block text-xs font-bold text-[#362617]">
                    Phone number <span className="text-[#AD855C]">*</span>
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="e.g. 07123 456789"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, phone: e.target.value }));
                      if (validationError) setValidationError(null);
                    }}
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F6F0EA] border border-[#362617]/25 text-[#362617] text-base placeholder:text-[#362617]/40 focus:outline-none focus:ring-2 focus:ring-[#362617] transition-all"
                    aria-required="true"
                  />
                  <p className="text-[11px] text-[#362617]/60">
                    Accepts UK mobile or landline numbers. No SMS verification.
                  </p>
                </div>

                {validationError && (
                  <p className="text-xs text-[#b91c1c] flex items-center gap-1.5 pt-1" role="alert">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </p>
                )}
              </div>

              {/* Privacy Policy Link */}
              <div className="text-[11px] text-[#362617]/70 flex items-center gap-1.5 pt-1">
                <Lock className="w-3.5 h-3.5 text-[#AD855C] shrink-0" aria-hidden="true" />
                <span>
                  Read ARKLINE’s{' '}
                  <a
                    href={deckingQuizConfig.contact.privacyPolicyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#362617] font-bold hover:text-[#AD855C] transition-colors"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </div>

              {/* Submission Error Banner */}
              {serverError && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                    isUnconnectedWarning
                      ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E]'
                      : 'bg-[#FEE2E2] border-[#EF4444] text-[#B91C1C]'
                  }`}
                  role="alert"
                >
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{isUnconnectedWarning ? 'Endpoint Unconnected' : 'Submission Failed'}</span>
                  </div>
                  <p className="leading-relaxed">{serverError}</p>
                  <p className="text-[11px] opacity-90 pt-1">
                    Your answers remain safely preserved. Please retry once ready.
                  </p>
                </div>
              )}

              {/* Submit and Back Actions */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#362617]/10">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="px-5 py-3.5 rounded-full border border-[#362617]/25 text-xs sm:text-sm font-bold text-[#362617] hover:bg-[#F6F0EA] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-4 rounded-full bg-[#362617] hover:bg-[#22170d] text-[#FFFFFF] text-sm sm:text-base font-bold tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-3 focus-visible:outline-[#AD855C] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#AD855C]" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <span>{deckingQuizConfig.contact.submitButtonText}</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Trust micro-banner below the card */}
      <div className="pt-3 text-center">
        <p className="text-[11px] text-[#362617]/60 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#AD855C]" />
          <span>Award-Winning ARKLINE Developments · Stourbridge & West Midlands</span>
        </p>
      </div>
    </div>
  );
};
