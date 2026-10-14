import { CampaignParameters } from '../types';

/**
 * Normalises and formats a UK postcode input:
 * - Trims external whitespace
 * - Replaces multiple spaces with single space
 * - Converts to uppercase
 * - Inserts space before the 3-character inward code if omitted (e.g. "DY81AA" -> "DY8 1AA")
 */
export function normalizePostcode(raw: string): string {
  if (!raw) return '';
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, ' ');
  const noSpace = cleaned.replace(/\s/g, '');

  // If user entered without space (e.g. DY81AA, B11AA, SW1A1AA)
  if (noSpace.length >= 5 && noSpace.length <= 8 && !cleaned.includes(' ')) {
    const inward = noSpace.slice(-3);
    const outward = noSpace.slice(0, -3);
    return `${outward} ${inward}`;
  }

  return cleaned;
}

/**
 * Validates UK postcode leniently to prevent blocking valid addresses.
 * UK postcodes are 5-8 alphanumeric characters with 1 outward and 1 inward part.
 */
export function isValidUKPostcode(postcode: string): boolean {
  if (!postcode) return false;
  const cleaned = postcode.trim().toUpperCase().replace(/\s+/g, '');
  
  // Must be between 5 and 8 characters long
  if (cleaned.length < 5 || cleaned.length > 8) {
    return false;
  }

  // Lenient UK Postcode regex:
  // Starts with 1-2 letters, followed by 1-2 digits or digit+letter, ending with 1 digit and 2 letters
  const lenientUkRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/;
  return lenientUkRegex.test(cleaned);
}

/**
 * Normalises a phone number input:
 * Trims whitespace and removes formatting clutter like brackets, hyphens, and dots.
 */
export function normalizePhone(raw: string): string {
  if (!raw) return '';
  return raw.trim().replace(/[\(\)\.\-\s]/g, '');
}

/**
 * Validates UK phone numbers leniently.
 * Accepts mobile (07xxx), UK landlines (01xxx, 02xxx, 03xxx), and international prefix (+44 / 0044).
 */
export function isValidUKPhone(raw: string): boolean {
  if (!raw) return false;
  const cleaned = normalizePhone(raw);

  // Must have between 10 and 15 digits (standard E.164 and UK national format)
  const digitsOnly = cleaned.replace(/\D/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return false;
  }

  // Accepts standard UK formats:
  // 07xxx (mobile), 01xxx/02xxx/03xxx (landline), +447xxx, +441xxx, 0044xxx
  const ukPhoneRegex = /^(?:(?:\+44\s?|0044\s?|0)(?:[1-9]\d{8,9}))$/;
  return ukPhoneRegex.test(cleaned);
}

/**
 * Safely extracts campaign and attribution parameters from URL query strings.
 * Stored separately from personal details, never placed in localStorage or URLs.
 */
export function getCampaignParameters(): CampaignParameters {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const campaign: CampaignParameters = {};

    const utmSource = params.get('utm_source');
    if (utmSource) campaign.utm_source = utmSource.slice(0, 100);

    const utmMedium = params.get('utm_medium');
    if (utmMedium) campaign.utm_medium = utmMedium.slice(0, 100);

    const utmCampaign = params.get('utm_campaign');
    if (utmCampaign) campaign.utm_campaign = utmCampaign.slice(0, 100);

    const utmContent = params.get('utm_content');
    if (utmContent) campaign.utm_content = utmContent.slice(0, 100);

    const utmTerm = params.get('utm_term');
    if (utmTerm) campaign.utm_term = utmTerm.slice(0, 100);

    const gclid = params.get('gclid');
    if (gclid) campaign.gclid = gclid.slice(0, 100);

    if (document.referrer) {
      campaign.referrer = document.referrer.slice(0, 200);
    }

    return campaign;
  } catch {
    return {};
  }
}
