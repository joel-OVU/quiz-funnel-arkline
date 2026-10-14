export type GardenOption =
  | 'Replacing existing decking'
  | 'Installing decking in a new area'
  | 'Not sure yet—I’d like to discuss my options';

export type TimeframeOption =
  | 'As soon as possible'
  | 'Within the next three months'
  | 'Ready for spring or summer'
  | 'I’m exploring options for later';

export interface CampaignParameters {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  referrer?: string;
}

export interface DeckingQuoteFormData {
  gardenOption: GardenOption | '';
  postcode: string;
  timeframe: TimeframeOption | '';
  callTime: string;
  fullName: string;
  phone: string;
  honeypot: string; // Anti-spam hidden field
}

export interface SubmissionPayload extends DeckingQuoteFormData {
  utm: CampaignParameters;
  submittedAt: string;
  pageUrl: string;
}

export interface SubmissionResult {
  success: boolean;
  message?: string;
  enquiryId?: string;
  timestamp?: string;
  error?: string;
  isUnconnected?: boolean;
}

export interface FormValidationErrors {
  gardenOption?: string;
  postcode?: string;
  timeframe?: string;
  callTime?: string;
  fullName?: string;
  phone?: string;
  general?: string;
}
