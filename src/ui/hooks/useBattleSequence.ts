import { useState, useRef } from 'react';
import { useGameStore, selectTotalAttack, selectHasDaggers, selectCrossbowCount, selectAxeActive, selectBellCount } from '@/store/gameStore';
import { BATTLE_ROUNDS } from '@/lib/constants';
import { getNextBattleRound } from '@/lib/battleProgression';

type AnimStatus = 'idle' | 'attack' | 'hurt';

export function useBattleSequence() {
    const [playerAnim, setPlayerAnim] = useState<AnimStatus>('idle');
    const [enemy1Anim, setEnemy1Anim] = useState<AnimStatus>('idle');
    const [enemy2Anim, setEnemy2Anim] = useState<AnimStatus>('idle');
    const [isBattleRunning, setIsBattleRunning] = useState(false);
    const [isPostBattleScreen, setIsPostBattleScreen] = useState(false);
    const runningRef = useRef(false);

    /** Read latest store values mid-loop without ref-sync effects */
    const getSnap = () => useGameStore.getState();

    const runBattle = async () => {
        if (runningRef.current) return;
        runningRef.current = true;
        setIsPostBattleScreen(false);
        setIsBattleRunning(true);

        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
        const finishClearedBattle = async (postBattleDelay: number) => {
            await delay(postBattleDelay);

            const { battleCount, resetBattleTarget } = getSnap();

            runningRef.current = false;
            setIsBattleRunning(false);

            if (!getNextBattleRound(battleCount, BATTLE_ROUNDS)) {
                resetBattleTarget();
                setIsPostBattleScreen(false);
                return;
            }

            setIsPostBattleScreen(true);
        };

        const snap = getSnap();
        const pAtk = selectTotalAttack(snap);
        const hasDaggers = selectHasDaggers(snap);
        const crossbowCount = selectCrossbowCount(snap);
        const axeActive = selectAxeActive(snap);
        const bellCount = selectBellCount(snap);
        const e1AtkVal = snap.enemy1.atk;
        const e2AtkVal = snap.enemy2.atk;
        const e1Type = snap.enemy1.type;
        const e2Type = snap.enemy2.type;
        const { applyBattleDamage, setEnemyVisibility, incrementEnemyDebuff } = snap;

        if (snap.playerHp === 0) {
            runningRef.current = false;
            setIsBattleRunning(false);
            return;
        }

        // Handle enemies already killed (e.g. by conjure magic lightning-trio)
        if (snap.enemy1.hp === 0 && snap.enemy2.hp === 0) {
            await delay(100);
            if (snap.enemy1.isVisible) setEnemyVisibility('enemy1', false);
            if (snap.enemy2.isVisible) setEnemyVisibility('enemy2', false);
            await finishClearedBattle(300);
            return;
        }

        // Fade out any individually pre-killed enemies before battle starts
        if (snap.enemy1.hp === 0 && snap.enemy1.isVisible) {
            setEnemyVisibility('enemy1', false);
            await delay(150);
        }
        if (snap.enemy2.hp === 0 && snap.enemy2.isVisible) {
            setEnemyVisibility('enemy2', false);
            await delay(150);
        }

        let isFirstAttack = true;
        const hp = () => {
            const s = getSnap();
            return { player: s.playerHp, e1: s.enemy1.hp, e2: s.enemy2.hp };
        };

        while (hp().player > 0 && (hp().e1 > 0 || hp().e2 > 0)) {
            const attackLoops = (isFirstAttack && hasDaggers) ? 3 : (axeActive ? 2 : 1);
            isFirstAttack = false;

            for (let i = 0; i < attackLoops; i++) {
                const h = hp();
                if (h.e1 === 0 && h.e2 === 0) break;

                setPlayerAnim('attack');
                await delay(150);
                setPlayerAnim('idle');

                const target = hp().e1 > 0 ? 1 : 2;
                if (target === 1) {
                    const bonusAtk = e1Type.includes('flying') ? (crossbowCount * 10) : 0;
                    const totalAtk = pAtk + bonusAtk;
                    applyBattleDamage('enemy1', totalAtk);
                    if (bellCount > 0) incrementEnemyDebuff(bellCount);
                    setEnemy1Anim('hurt');
                    await delay(250);
                    setEnemy1Anim('idle');
                    if (hp().e1 === 0) {
                        await delay(20);
                        setEnemyVisibility('enemy1', false);
                    }
                } else {
                    const bonusAtk = e2Type.includes('flying') ? (crossbowCount * 10) : 0;
                    const totalAtk = pAtk + bonusAtk;
                    applyBattleDamage('enemy2', totalAtk);
                    if (bellCount > 0) incrementEnemyDebuff(bellCount);
                    setEnemy2Anim('hurt');
                    await delay(250);
                    setEnemy2Anim('idle');
                    if (hp().e2 === 0) {
                        await delay(20);
                        setEnemyVisibility('enemy2', false);
                    }
                }

                if (i < attackLoops - 1) await delay(150);
            }

            if (hp().e1 === 0 && hp().e2 === 0) break;

            await delay(150);

            if (hp().e1 > 0) {
                setEnemy1Anim('attack');
                await delay(150);
                setEnemy1Anim('idle');

                applyBattleDamage('player', e1AtkVal);
                setPlayerAnim('hurt');
                await delay(250);
                setPlayerAnim('idle');
            }

            if (hp().player === 0) break;
            await delay(150);

            if (hp().e2 > 0) {
                setEnemy2Anim('attack');
                await delay(150);
                setEnemy2Anim('idle');

                applyBattleDamage('player', e2AtkVal);
                setPlayerAnim('hurt');
                await delay(250);
                setPlayerAnim('idle');
            }

            if (hp().player === 0) break;
            await delay(150);
        }

        if (hp().e1 === 0 && hp().e2 === 0) {
            await finishClearedBattle(600);
            return;
        }

        runningRef.current = false;
        setIsBattleRunning(false);
    };

    const exitPostBattle = () => {
        if (runningRef.current || !isPostBattleScreen) return;
        const { resetBattleTarget } = getSnap();
        resetBattleTarget();
        setIsPostBattleScreen(false);
    };

    const resetBattleSequence = () => {
        runningRef.current = false;
        setIsBattleRunning(false);
        setIsPostBattleScreen(false);
        setPlayerAnim('idle');
        setEnemy1Anim('idle');
        setEnemy2Anim('idle');
    };

    return {
        playerAnim,
        enemy1Anim,
        enemy2Anim,
        isBattleRunning,
        isPostBattleScreen,
        runBattle,
        exitPostBattle,
        resetBattleSequence,
    };
}
