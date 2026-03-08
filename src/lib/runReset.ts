import type { NextRunBonuses } from '../types/progression';
import { createEmptyNextRunBonuses } from './runBonuses';

export type RunResetMode = 'retry' | 'hard-reset';

export interface RunResetContext {
    bonusesToApply: NextRunBonuses;
    savedBonuses: NextRunBonuses;
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
            savedBonuses: { ...savedBonuses },
            hasSeenTutorial,
        };
    }

    return {
        bonusesToApply: createEmptyNextRunBonuses(),
        savedBonuses: createEmptyNextRunBonuses(),
        hasSeenTutorial: false,
    };
};
