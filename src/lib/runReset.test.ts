import { describe, expect, it } from 'bun:test';
import { getRunResetContext } from './runReset';

describe('run reset context', () => {
    it('keeps saved bonuses and tutorial state when retrying a run', () => {
        expect(getRunResetContext({ hp: 5, atk: 1, gold: 60 }, true, 'retry')).toEqual({
            bonusesToApply: { hp: 5, atk: 1, gold: 60 },
            savedBonuses: { hp: 5, atk: 1, gold: 60 },
            hasSeenTutorial: true,
        });
    });

    it('clears saved bonuses and tutorial state on hard reset', () => {
        expect(getRunResetContext({ hp: 5, atk: 1, gold: 60 }, true, 'hard-reset')).toEqual({
            bonusesToApply: { hp: 0, atk: 0, gold: 0 },
            savedBonuses: { hp: 0, atk: 0, gold: 0 },
            hasSeenTutorial: false,
        });
    });
});
