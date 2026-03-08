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
    const bonuses = getRewardBonuses(reward);

    return {
        hp: current.hp + bonuses.hp,
        atk: current.atk + bonuses.atk,
        gold: current.gold + bonuses.gold,
    };
};

export const getRewardBonuses = (reward: NextRunReward): NextRunBonuses =>
    WAVE_REWARD_OPTIONS[reward].bonuses;

export const hasRunBonuses = (bonuses: NextRunBonuses) =>
    bonuses.hp > 0 || bonuses.atk > 0 || bonuses.gold > 0;

export const applyBonusesToCurrentRun = (
    state: Pick<{ gold: number; playerHp: number; playerMaxHp: number; playerBaseAtk: number }, 'gold' | 'playerHp' | 'playerMaxHp' | 'playerBaseAtk'>,
    bonuses: NextRunBonuses,
) => {
    state.gold += bonuses.gold;
    state.playerHp += bonuses.hp;
    state.playerMaxHp += bonuses.hp;
    state.playerBaseAtk += bonuses.atk;
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
