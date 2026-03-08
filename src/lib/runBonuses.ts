import { GAME_CONSTANTS, WAVE_REWARD_OPTIONS } from './constants';
import type { NextRunBonuses, NextRunReward } from '../types/progression';

export const createEmptyNextRunBonuses = (): NextRunBonuses => ({
    hp: 0,
    atk: 0,
    gold: 0,
});

export const addNextRunReward = (
    current: NextRunBonuses,
    reward: NextRunReward,
): NextRunBonuses => {
    const { bonuses } = WAVE_REWARD_OPTIONS[reward];

    return {
        hp: current.hp + bonuses.hp,
        atk: current.atk + bonuses.atk,
        gold: current.gold + bonuses.gold,
    };
};

export const getRunStartStats = (bonuses: NextRunBonuses) => {
    const playerMaxHp = GAME_CONSTANTS.INITIAL_PLAYER_HP + bonuses.hp;

    return {
        gold: GAME_CONSTANTS.INITIAL_GOLD + bonuses.gold,
        playerHp: playerMaxHp,
        playerMaxHp,
        playerBaseAtk: GAME_CONSTANTS.INITIAL_PLAYER_ATK + bonuses.atk,
    };
};
