import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

interface HeroStatsPanelProps {
    playerAnim: 'idle' | 'attack' | 'hurt';
    playerHp: number;
    playerMaxHp: number;
    playerBaseAtk: number;
    playerMagic: number;
    playerGear: number;
    gold: number;
    moves: number;
    isBattleRunning: boolean;
    onCharacterClick: () => void;
}

const playerIconVariants: Variants = {
    idle: { scale: 1, x: 0, y: 0 },
    attack: { scale: 1.3, x: 20, y: -10, transition: { duration: 0.2, ease: "easeOut" } },
    hurt: { x: [-5, 5, -5, 5, 0], scale: [1, 0.9, 1], filter: ["brightness(1)", "brightness(2)", "brightness(1)"], transition: { duration: 0.4 } }
};

const hpVariants: Variants = {
    idle: { color: '#d4d4d8', scale: 1 },
    hurt: { color: '#ef4444', scale: [1, 1.5, 1], transition: { duration: 0.4 } }
};

export function HeroStatsPanel({
    playerAnim,
    playerHp,
    playerMaxHp,
    playerBaseAtk,
    playerMagic,
    playerGear,
    gold,
    moves,
    isBattleRunning,
    onCharacterClick
}: HeroStatsPanelProps) {
    const [showGoldCost, setShowGoldCost] = useState(false);
    const [goldKey, setGoldKey] = useState(0);
    const prevGoldRef = useRef(gold);

    useEffect(() => {
        if (gold < prevGoldRef.current) {
            setShowGoldCost(true);
            setGoldKey(k => k + 1);

            const timer = setTimeout(() => {
                setShowGoldCost(false);
            }, 800);
            return () => clearTimeout(timer);
        }
        prevGoldRef.current = gold;
    }, [gold]);

    return (
        <div className="w-[7.5rem] sm:w-[8.5rem] md:w-[30%] border-r border-zinc-800 flex flex-col items-center justify-start gap-2 pt-4 shrink-0">
            <div className="relative flex">
                <motion.div animate={playerAnim} variants={playerIconVariants} initial="idle" className="z-10 relative">
                    <Icon
                        name="hood"
                        scale={4}
                        tintColor="#7e22ce"
                        className={cn("cursor-pointer hover:brightness-110 transition-all active:scale-95", isBattleRunning && "pointer-events-none")}
                        onClick={onCharacterClick}
                    />
                </motion.div>
                {moves >= 10 && (
                    <div className="absolute bottom-0 -right-2 text-red-500 font-black text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] pointer-events-none z-20 leading-none flex items-center justify-center">
                        <i className="ra ra-muscle-up" />
                    </div>
                )}
            </div>
            <div className="flex flex-col w-full px-1.5 sm:px-2 text-xs tracking-wide sm:tracking-widest text-zinc-500 uppercase font-medium gap-1.5">
                <div className="flex justify-between items-center">
                    <span>HP</span>
                    <motion.span
                        animate={playerAnim === 'hurt' ? "hurt" : "idle"}
                        variants={hpVariants}
                        className="text-zinc-300 inline-block origin-right"
                    >
                        {playerHp}/{playerMaxHp}
                    </motion.span>
                </div>
                <div className="flex justify-between items-center whitespace-nowrap"><span>Attack</span> <span className="text-zinc-300">{playerBaseAtk}</span></div>
                <div className="flex justify-between items-center"><span>Magic</span> <span className="text-zinc-300">{playerMagic}</span></div>
                <div className="flex justify-between items-center"><span>Gear</span> <span className="text-zinc-300">{playerGear}</span></div>
                <div className="flex justify-between items-center"><span>Experience</span> <span className="text-zinc-300">{moves}</span></div>
                <div className="flex justify-between items-center relative text-yellow-500">
                    <span>Gold</span>
                    <AnimatePresence>
                        {showGoldCost && (
                            <motion.span
                                key={goldKey}
                                initial={{ opacity: 1, y: 0 }}
                                animate={{ opacity: 0, y: -10 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="absolute left-1/2 -translate-x-1/2 text-red-500 pointer-events-none z-50"
                            >
                                -2
                            </motion.span>
                        )}
                    </AnimatePresence>
                    <span>{gold}</span>
                </div>
            </div>
        </div>
    );
}
