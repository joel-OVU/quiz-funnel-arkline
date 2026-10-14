/**
 * ARKLINE Decking Quiz Measurement & Attribution System
 *
 * Requirements:
 * - Clearly named integration points for:
 *   1. Quiz started
 *   2. Each step completed
 *   3. Successful lead submission (only when backend confirms saved enquiry; never on raw button clicks)
 * - Captures UTM campaign parameters separately from personal information.
 * - NEVER sends personal information (names, phone numbers, postcodes) into analytics events.
 * - Does not load third-party ad trackers by default.
 */

import { CampaignParameters } from '../types';

export interface QuizAnalyticsEvent {
  event: string;
  stepNumber?: number;
  stepName?: string;
  enquiryId?: string;
  campaign?: CampaignParameters;
  timestamp: string;
}

export const measurement = {
  /**
   * Dispatched when homeowner clicks "Start My Quote Request"
   */
  trackQuizStarted: (campaign?: CampaignParameters) => {
    const payload: QuizAnalyticsEvent = {
      event: 'quiz_started',
      campaign,
      timestamp: new Date().toISOString(),
    };
    logEvent(payload);
  },

  /**
   * Dispatched when a specific question/stage is completed
   */
  trackStepCompleted: (stepNumber: number, stepName: string) => {
    const payload: QuizAnalyticsEvent = {
      event: 'quiz_step_completed',
      stepNumber,
      stepName,
      timestamp: new Date().toISOString(),
    };
    logEvent(payload);
  },

  /**
   * Dispatched ONLY when the server confirms the enquiry was saved with an ID.
   * NEVER triggered by a simple button click.
   */
  trackLeadSubmitted: (enquiryId: string, campaign?: CampaignParameters) => {
    const payload: QuizAnalyticsEvent = {
      event: 'lead_submitted_verified',
      enquiryId,
      campaign,
      timestamp: new Date().toISOString(),
    };
    logEvent(payload);
  },
};

function logEvent(eventData: QuizAnalyticsEvent) {
  // Push to dataLayer if present (Google Tag Manager / Analytics consent compatible)
  if (typeof window !== 'undefined') {
    const win = window as unknown as { dataLayer?: unknown[] };
    if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push(eventData);
    }
  }

  // Debug log for QA testing
  if (process.env.NODE_ENV !== 'production') {
    console.log('[ARKLINE Analytics Event]:', eventData.event, eventData);
  }
}
