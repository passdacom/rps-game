export interface PremiumConfig {
    aiDifficulty: 'RNJesus' | 'PatternMatcher';
    customSkinsEnabled: boolean;
    advancedStatsEnabled: boolean;
}

export const getConfigForUser = (isPremium: boolean): PremiumConfig => {
    if (isPremium) {
        return {
            aiDifficulty: 'PatternMatcher',
            customSkinsEnabled: true,
            advancedStatsEnabled: true,
        };
    }

    return {
        aiDifficulty: 'RNJesus',
        customSkinsEnabled: false,
        advancedStatsEnabled: false,
    };
};
