import { describe, expect, it } from 'bun:test';
import { getRunStartStats, createEmptyNextRunBonuses, addNextRunReward, applyBonusesToCurrentRun, getRewardBonuses, hasRunBonuses } from './runBonuses';

describe('run bonuses', () => {
    it('starts empty', () => {
        expect(createEmptyNextRunBonuses()).toEqual({ hp: 0, atk: 0, gold: 0 });
    });

    it('queues rewards cumulatively', () => {
        const afterVitality = addNextRunReward(createEmptyNextRunBonuses(), 'vitality');
        const afterWealth = addNextRunReward(afterVitality, 'wealth');

        expect(afterWealth).toEqual({ hp: 5, atk: 1, gold: 60 });
    });

    it('reads reward bonuses from the configured reward table', () => {
        expect(getRewardBonuses('vitality')).toEqual({ hp: 5, atk: 1, gold: 0 });
    });

    it('applies bonuses to the current run immediately', () => {
        const currentRun = {
            gold: 120,
            playerHp: 40,
            playerMaxHp: 60,
            playerBaseAtk: 8,
        };

        applyBonusesToCurrentRun(currentRun, { hp: 5, atk: 1, gold: 60 });

        expect(currentRun).toEqual({
            gold: 180,
            playerHp: 45,
            playerMaxHp: 65,
            playerBaseAtk: 9,
        });
    });

    it('converts queued rewards into next-run starting stats', () => {
        expect(getRunStartStats({ hp: 10, atk: 2, gold: 60 })).toEqual({
            gold: 260,
            playerHp: 70,
            playerMaxHp: 70,
            playerBaseAtk: 10,
        });
    });

    it('detects whether any run bonuses are present', () => {
        expect(hasRunBonuses(createEmptyNextRunBonuses())).toBe(false);
        expect(hasRunBonuses({ hp: 0, atk: 1, gold: 0 })).toBe(true);
    });
});

