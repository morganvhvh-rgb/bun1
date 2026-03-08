import type { BattleRound } from './constants';

export const getCompletedRunBattleCount = (maxBattles: number) => maxBattles + 1;

export const isRunComplete = (battleCount: number, maxBattles: number) =>
    battleCount > maxBattles;

export const getNextBattleRound = (
    battleCount: number,
    rounds: BattleRound[],
): BattleRound | null => {
    if (battleCount >= rounds.length) return null;
    return rounds[battleCount];
};

export const getWaveRewardNumber = (
    battleCount: number,
    checkpoints: readonly number[],
): number | null => {
    const checkpointIndex = checkpoints.indexOf(battleCount);
    return checkpointIndex === -1 ? null : checkpointIndex + 1;
};

