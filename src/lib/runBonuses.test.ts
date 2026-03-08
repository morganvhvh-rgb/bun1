import { describe, expect, it } from 'bun:test';
import { getRunStartStats, createEmptyNextRunBonuses, addNextRunReward } from './runBonuses';

describe('run bonuses', () => {
    it('starts empty', () => {
        expect(createEmptyNextRunBonuses()).toEqual({ hp: 0, atk: 0, gold: 0 });
    });

    it('queues rewards cumulatively', () => {
        const afterVitality = addNextRunReward(createEmptyNextRunBonuses(), 'vitality');
        const afterWealth = addNextRunReward(afterVitality, 'wealth');

        expect(afterWealth).toEqual({ hp: 5, atk: 1, gold: 60 });
    });

    it('converts queued rewards into next-run starting stats', () => {
        expect(getRunStartStats({ hp: 10, atk: 2, gold: 60 })).toEqual({
            gold: 260,
            playerHp: 70,
            playerMaxHp: 70,
            playerBaseAtk: 10,
        });
    });
});

