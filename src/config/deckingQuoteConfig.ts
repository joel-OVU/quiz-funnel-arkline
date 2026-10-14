/**
 * ARKLINE Developments - Decking Quote Quiz Funnel Configuration
 * Single centralized configuration file for all brand assets, copy,
 * questions, answers, call windows, endpoints, and legal links.
 */

export interface DeckingQuizConfig {
  brand: {
    name: string;
    tagline: string;
    logoUrl: string;
    logoDarkUrl: string;
    serviceArea: string;
    proofBadge: string;
    awardDetail: string;
  };
  welcome: {
    headline: string;
    supportingText: string;
    startButtonText: string;
    // Genuine completed project photo from ARKLINE's homepage
    deckingPhotoUrl: string;
    deckingPhotoAlt: string;
    deckingPhotoCaption: string;
  };
  questions: {
    q1: {
      title: string;
      options: string[];
    };
    q2: {
      title: string;
      helperText: string;
      placeholder: string;
    };
    q3: {
      title: string;
      options: string[];
    };
    q4: {
      title: string;
      options: string[];
    };
  };
  contact: {
    headline: string;
    supportingText: string;
    noticeText: string;
    submitButtonText: string;
    privacyPolicyUrl: string;
  };
  success: {
    headline: string;
    description: string;
    secondaryActionText: string;
  };
  business: {
    // Configurable phone number. If empty (""), the secondary call action is automatically hidden.
    phoneNumber: string;
    displayPhoneNumber: string;
    // Configurable submission endpoint. If empty (""), submission is marked as unconnected.
    submissionEndpoint: string;
    hostingPath: string;
  };
}

export const deckingQuizConfig: DeckingQuizConfig = {
  brand: {
    name: 'ARKLINE Developments',
    tagline: 'Building Contractors & Decking Specialists',
    logoUrl:
      'https://images.squarespace-cdn.com/content/v1/680ab9cd990ca527f6900e99/be55244e-472d-414f-88d2-0f2fd978e3d7/Brown_Minimalist_Real_Estate_Logo__300_x_300_px___180_x_180_px___720_x_720_px_-removebg-preview.png',
    logoDarkUrl:
      'https://images.squarespace-cdn.com/content/v1/680ab9cd990ca527f6900e99/e9932551-791e-4bb0-b9b4-5a3155a4400d/Brown+Minimalist+Real+Estate+Logo+%28300+x+300+px%29+%28180+x+180+px%29+%28720+x+720+px%29.png',
    serviceArea: 'Stourbridge and surrounding areas',
    proofBadge: 'Award-winning ARKLINE Developments',
    awardDetail: 'West Midlands Residential Construction Company of the Year 2025/2026',
  },
  welcome: {
    headline: 'Request Your Free Decking Quote',
    supportingText:
      'Thinking about refreshing your outdoor space? Tell us a little about your plans so our team can discuss your project and arrange a quote.',
    startButtonText: 'Start My Quote Request',
    // Genuine completed outdoor project photo from ARKLINE homepage
    deckingPhotoUrl:
      'https://images.squarespace-cdn.com/content/v1/680ab9cd990ca527f6900e99/0b279133-4724-4e0f-923b-ce3e18dde13e/IMG_4787+%281%29.png',
    deckingPhotoAlt: 'Completed garden and outdoor living decking project by ARKLINE Developments in Stourbridge',
    deckingPhotoCaption: 'Completed ARKLINE Garden & Decking Project in Stourbridge',
  },
  questions: {
    q1: {
      title: 'What are you considering for your garden?',
      options: [
        'Replacing existing decking',
        'Installing decking in a new area',
        'Not sure yet—I’d like to discuss my options',
      ],
    },
    q2: {
      title: 'What’s the postcode of the property where you’d like the decking?',
      helperText: 'Please enter the postcode where the work would take place.',
      placeholder: 'e.g. DY8 1AA',
    },
    q3: {
      title: 'If the quote suits you, when would you like the work done?',
      options: [
        'As soon as possible',
        'Within the next three months',
        'Ready for spring or summer',
        'I’m exploring options for later',
      ],
    },
    q4: {
      title: 'What’s the best time for our team to call?',
      options: [
        'Morning (9am–12pm)',
        'Afternoon (12pm–5pm)',
        'Evening (5pm–7pm)',
        'Anytime (9am–7pm)',
      ],
    },
  },
  contact: {
    headline: 'Where should we contact you about your quote?',
    supportingText: 'Our team will call to discuss your ideas and arrange a suitable time to take a look.',
    noticeText: 'We’ll use your details to contact you about your decking project and arrange a quote.',
    submitButtonText: 'Request My Free Quote',
    privacyPolicyUrl: 'https://www.arklinedevelopments.com/privacy-policy',
  },
  success: {
    headline: 'Thanks—Your Quote Request Is In',
    description:
      'Our team will be in touch to hear your ideas and arrange a suitable time to take a look. Keep an eye out for our call.',
    secondaryActionText: 'Prefer to speak sooner? Call ARKLINE.',
  },
  business: {
    phoneNumber: '+44 7949 123456',
    displayPhoneNumber: '07949 123456',
    submissionEndpoint: '/api/quote-request',
    hostingPath: '/decking-quote',
  },
};
