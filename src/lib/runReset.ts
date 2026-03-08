import type { NextRunBonuses } from '../types/progression';
import { createEmptyNextRunBonuses } from './runBonuses';

export type RunResetMode = 'retry' | 'hard-reset';

export interface RunResetContext {
    bonusesToApply: NextRunBonuses;
    remainingBonuses: NextRunBonuses;
    hasSeenTutorial: boolean;
}

export const getRunResetContext = (
    savedBonuses: NextRunBonuses,
    hasSeenTutorial: boolean,
    mode: RunResetMode,
): RunResetContext => {
    if (mode === 'retry') {
        return {
            bonusesToApply: { ...savedBonuses },
            remainingBonuses: createEmptyNextRunBonuses(),
            hasSeenTutorial,
        };
    }

    return {
        bonusesToApply: createEmptyNextRunBonuses(),
        remainingBonuses: createEmptyNextRunBonuses(),
        hasSeenTutorial: false,
    };
};
