import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { ICON_THEME } from '@/lib/constants';
import type { KeptIcon } from '@/types/game';

const SECTIONS: { id: 0 | 1 | 2; label: string; slots: [number, number] }[] = [
    { id: 0, label: 'Food/Item', slots: [0, 1] },
    { id: 1, label: 'Armor/Magic', slots: [2, 3] },
    { id: 2, label: 'Weapon/Music', slots: [4, 5] },
];

function KeptIconDisplay({ icon, onClick }: { icon: KeptIcon; onClick: (e: React.MouseEvent) => void }) {
    return (
        <div className="shrink-0 flex items-center justify-center relative cursor-pointer hover:brightness-125 transition-all active:scale-95 group" style={{ width: 'var(--cell-sm)', height: 'var(--cell-sm)' }} onClick={onClick}>
            <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="absolute -top-1 -right-1 z-20 flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 border border-blue-400 text-white font-mono font-black shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ fontSize: '10px' }}>
                {icon.battleCount}
            </span>
            <div className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                <Icon name={icon.name} scale={3} tintColor={ICON_THEME[icon.name]} />
            </div>
        </div>
    );
}

interface InventoryProps {
    onKeptIconClick: (e: React.MouseEvent, icon: KeptIcon) => void;
}

export function Inventory({ onKeptIconClick }: InventoryProps) {
    const { keptIcons, unlockedSections, isUnlockingMode, unlockSection } = useGameStore();

    return (
        <div className="w-full shrink-0 mb-1 relative">
            {/* Scrollable container for smaller screens */}
            <div className="w-full overflow-x-auto touch-pan-x scrollbar-none snap-x snap-mandatory pb-2 pt-1 flex justify-start" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`
                    .scrollbar-none::-webkit-scrollbar { display: none; }
                `}</style>
                <div className="flex items-center justify-center p-1 md:p-1.5 bg-zinc-950/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-inner w-max mx-auto shrink-0 snap-center px-1" style={{ gap: 'var(--gap)' }}>
                    {SECTIONS.flatMap((section, i) => {
                        const [slotA, slotB] = section.slots;
                        const iconA = keptIcons[slotA];
                        const iconB = keptIcons[slotB];
                        const isUnlocked = unlockedSections[section.id];

                        const elements = [];
                        if (i > 0) {
                            elements.push(
                                <div key={`spacer-${section.id}`} className="w-px h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent shrink-0" />
                            );
                        }

                        elements.push(
                            <div
                                key={`sec-${section.id}`}
                                className="flex items-center justify-start relative rounded-xl transition-all duration-300 shrink-0"
                                style={{ width: 'calc(var(--cell-sm) * 2 + var(--gap))', minHeight: 'calc(var(--cell-sm) + 4px)', gap: 'calc(var(--gap) * 0.5)', padding: '2px' }}
                                onClick={() => isUnlockingMode && !isUnlocked && unlockSection(section.id)}
                            >
                                {!isUnlocked ? (
                                    <div
                                        className={cn('absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl transition-all border border-transparent', isUnlockingMode ? 'cursor-pointer hover:bg-zinc-800/80 bg-zinc-900/60 border-zinc-700/50 shadow-inner' : 'bg-black/40')}
                                        style={{ pointerEvents: isUnlockingMode ? 'auto' : 'none' }}
                                    >
                                        {isUnlockingMode ? (
                                            <>
                                                <i className="ra ra-unlock text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" style={{ fontSize: '14px' }} />
                                                <span className="font-bold text-green-400 uppercase tracking-widest leading-none drop-shadow-sm" style={{ fontSize: '9px' }}>UNLOCK</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="ra ra-padlock text-red-900/80" style={{ fontSize: '14px' }} />
                                                <span className="font-bold text-zinc-700 uppercase tracking-widest leading-none" style={{ fontSize: '9px' }}>LOCKED</span>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-zinc-900/40 border border-white/5 rounded-xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] pointer-events-none" />

                                        {!iconA && !iconB && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40 overflow-hidden px-1">
                                                <span className="font-bold text-zinc-500 uppercase tracking-widest leading-none text-center truncate w-full" style={{ fontSize: '9px' }}>
                                                    {section.label.replace('/', ' / ')}
                                                </span>
                                            </div>
                                        )}

                                        {/* Slot Backgrounds */}
                                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-between w-full px-1 pointer-events-none opacity-30">
                                            <div className="rounded-lg bg-black/50 border border-white/5" style={{ width: 'var(--cell-sm)', height: 'var(--cell-sm)' }} />
                                            <div className="rounded-lg bg-black/50 border border-white/5" style={{ width: 'var(--cell-sm)', height: 'var(--cell-sm)' }} />
                                        </div>

                                        {iconA && <KeptIconDisplay icon={iconA} onClick={(e) => onKeptIconClick(e, iconA)} />}
                                        {iconB && <KeptIconDisplay icon={iconB} onClick={(e) => onKeptIconClick(e, iconB)} />}
                                    </>
                                )}
                            </div>
                        );

                        return elements;
                    })}
                </div>
            </div>
        </div>
    );
}
