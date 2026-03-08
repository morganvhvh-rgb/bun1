import { describe, expect, it } from 'bun:test';
import {
    BATTLE_ROUNDS,
    GAME_CONSTANTS,
    WAVE_REWARD_BATTLES,
    ENEMY_GLOBAL_STAT_BONUS,
    applyEnemyStatBonus,
} from './constants';
import {
    getCompletedRunBattleCount,
    getNextBattleRound,
    getWaveRewardNumber,
    isRunComplete,
} from './battleProgression';

describe('battle progression', () => {
    it('keeps the round table aligned with MAX_BATTLES', () => {
        expect(BATTLE_ROUNDS).toHaveLength(GAME_CONSTANTS.MAX_BATTLES);
    });

    it('returns the next round until the run is complete', () => {
        expect(getNextBattleRound(1, BATTLE_ROUNDS)).toBe(BATTLE_ROUNDS[1]);
        expect(getNextBattleRound(GAME_CONSTANTS.MAX_BATTLES, BATTLE_ROUNDS)).toBeNull();
    });

    it('marks run completion consistently', () => {
        const completedBattleCount = getCompletedRunBattleCount(GAME_CONSTANTS.MAX_BATTLES);

        expect(completedBattleCount).toBe(10);
        expect(isRunComplete(completedBattleCount, GAME_CONSTANTS.MAX_BATTLES)).toBe(true);
        expect(isRunComplete(GAME_CONSTANTS.MAX_BATTLES, GAME_CONSTANTS.MAX_BATTLES)).toBe(false);
    });

    it('maps wave reward checkpoints to wave numbers', () => {
        expect(getWaveRewardNumber(4, WAVE_REWARD_BATTLES)).toBe(1);
        expect(getWaveRewardNumber(8, WAVE_REWARD_BATTLES)).toBe(2);
        expect(getWaveRewardNumber(5, WAVE_REWARD_BATTLES)).toBeNull();
    });

    it('applies a global enemy bonus to both visible enemies and solo bosses', () => {
        const boostedRounds = applyEnemyStatBonus(
            [
                {
                    e1: { name: 'wyvern', hp: 40, atk: 8, lvl: 1, type: 'flying' },
                    e2: { name: 'octopus', hp: 40, atk: 8, lvl: 1, type: '---' },
                },
                {
                    e1: { name: 'eye-monster', hp: 105, atk: 19, lvl: 1, type: 'boss' },
                    e2: null,
                },
            ],
            ENEMY_GLOBAL_STAT_BONUS,
        );

        expect(boostedRounds[0]).toMatchObject({
            e1: { hp: 45, atk: 9 },
            e2: { hp: 45, atk: 9 },
        });
        expect(boostedRounds[1]).toMatchObject({
            e1: { hp: 110, atk: 20 },
            e2: null,
        });
    });
});

