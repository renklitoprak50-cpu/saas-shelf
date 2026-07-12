/**
 * Modular Affiliate Link Generator Utility for SaaShelf
 * Implements a Strategy Pattern / Configuration-based architecture
 * to easily manage active or upcoming affiliate platforms.
 */

export interface AffiliateConfig {
  platform: string;
  defaultRefCode: string;
  generateUrl: (originalUrl: string, refCode: string) => string;
}

export const PLATFORM_CONFIGS: Record<string, AffiliateConfig> = {
  trustmrr: {
    platform: 'trustmrr',
    defaultRefCode: 'toprak-renkli-2800ac',
    generateUrl: (originalUrl, refCode) => {
      try {
        const url = new URL(originalUrl);
        url.searchParams.set('ref', refCode);
        return url.toString();
      } catch {
        // Fallback for simple/unformatted URLs
        const separator = originalUrl.includes('?') ? '&' : '?';
        return `${originalUrl}${separator}ref=${refCode}`;
      }
    }
  },
  flippa: {
    platform: 'flippa',
    defaultRefCode: 'saashelf_partner',
    generateUrl: (originalUrl, refCode) => {
      try {
        const url = new URL(originalUrl);
        url.searchParams.set('utm_source', 'saashelf');
        url.searchParams.set('aff', refCode);
        return url.toString();
      } catch {
        const separator = originalUrl.includes('?') ? '&' : '?';
        return `${originalUrl}${separator}aff=${refCode}`;
      }
    }
  },
  empireflippers: {
    platform: 'empireflippers',
    defaultRefCode: 'EF_SAASHELF',
    generateUrl: (originalUrl, refCode) => {
      try {
        const url = new URL(originalUrl);
        url.searchParams.set('referral', refCode);
        return url.toString();
      } catch {
        const separator = originalUrl.includes('?') ? '&' : '?';
        return `${originalUrl}${separator}referral=${refCode}`;
      }
    }
  }
};

/**
 * Generates an affiliate query encoded URL safely for custom platforms.
 * 
 * @param originalUrl The destination listing link
 * @param platform The platform of origin ('trustmrr', 'flippa', 'empireflippers')
 * @param customRefCode Optional custom referral code overrides
 * @returns The final affiliate-ready URL
 */
export function generateAffiliateLink(
  originalUrl: string,
  platform: string = 'trustmrr',
  customRefCode?: string
): string {
  const normalizedPlatform = platform.trim().toLowerCase();
  const config = PLATFORM_CONFIGS[normalizedPlatform];
  
  if (!config) {
    // Return original url to prevent breaking custom platform expansions
    return originalUrl;
  }
  
  const refCode = customRefCode && customRefCode.trim() !== '' 
    ? customRefCode 
    : config.defaultRefCode;
    
  return config.generateUrl(originalUrl, refCode);
}
