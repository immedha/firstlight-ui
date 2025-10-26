/**
 * Karma System Configuration
 * 
 * Tiers:
 * - Tier 1 (Great): 100+ karma
 * - Tier 2 (Mid): 40-99 karma
 * - Tier 3 (Bad): 0-39 karma
 */

export const KARMA_CONFIG = {
  // Starting karma for new users
  STARTING_KARMA: 50,
  
  // Tier thresholds
  TIER_1_THRESHOLD: 100,  // Great
  TIER_2_THRESHOLD: 40,   // Mid
  
  // Karma rewards based on review quality ratings
  REWARDS: {
    EXCELLENT: 10,    // 4-5 stars (Great feedback)
    NEUTRAL: 1,       // 3 stars (Neutral - just participating)
    POOR: -3,         // 1-2 stars (Bad feedback)
  },
  
  // Get user's tier based on karma points
  getTier: (karma: number): 1 | 2 | 3 => {
    if (karma >= KARMA_CONFIG.TIER_1_THRESHOLD) return 1;
    if (karma >= KARMA_CONFIG.TIER_2_THRESHOLD) return 2;
    return 3;
  },
  
  // Calculate karma change based on star rating
  getKarmaChange: (rating: number): number => {
    if (rating >= 4) return KARMA_CONFIG.REWARDS.EXCELLENT;  // 4-5 stars
    if (rating === 3) return KARMA_CONFIG.REWARDS.NEUTRAL;    // 3 stars
    return KARMA_CONFIG.REWARDS.POOR;                         // 1-2 stars
  },
  
  // Get tier name for display
  getTierName: (tier: number): string => {
    if (tier === 1) return "Great";
    if (tier === 2) return "Mid";
    return "Bad";
  },
};

