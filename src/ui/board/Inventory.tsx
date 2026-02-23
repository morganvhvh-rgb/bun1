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
        <div className="shrink-0 flex items-center justify-center relative cursor-pointer" style={{ width: 'var(--cell-sm)', height: 'var(--cell-sm)' }} onClick={onClick}>
            <span className="absolute top-0.5 left-1 text-white font-mono font-bold leading-none pointer-events-none z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" style={{ fontSize: 'var(--text-base)' }}>
                {icon.battleCount}
            </span>
            <Icon name={icon.name} scale={3} tintColor={ICON_THEME[icon.name]} />
        </div>
    );
}

interface InventoryProps {
    onKeptIconClick: (e: React.MouseEvent, icon: KeptIcon) => void;
}

export function Inventory({ onKeptIconClick }: InventoryProps) {
    const { keptIcons, unlockedSections, isUnlockingMode, unlockSection } = useGameStore();

    return (
        <div className="w-full flex justify-center items-center shrink-0" style={{ marginBottom: 'var(--gap)' }}>
            <div className="flex items-center justify-center" style={{ gap: 'var(--gap)' }}>
                {SECTIONS.map((section, i) => {
                    const [slotA, slotB] = section.slots;
                    const iconA = keptIcons[slotA];
                    const iconB = keptIcons[slotB];
                    const isUnlocked = unlockedSections[section.id];

                    return (
                        <div key={section.id} className="contents">
                            {i > 0 && <div className="bg-zinc-800 shrink-0" style={{ width: 1, height: 'var(--cell-sm)', margin: '0 2px' }} />}
                            <div
                                className="flex items-center justify-start relative"
                                style={{ width: 'calc(var(--cell-sm) * 2 + var(--gap))', height: 'var(--cell-sm)', gap: 'calc(var(--gap) * 0.5)' }}
                                onClick={() => isUnlockingMode && !isUnlocked && unlockSection(section.id)}
                            >
                                {!isUnlocked ? (
                                    <div
                                        className={cn('absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded transition-colors', isUnlockingMode && 'cursor-pointer hover:bg-zinc-800/50')}
                                        style={{ pointerEvents: isUnlockingMode ? 'auto' : 'none' }}
                                    >
                                        <span className="font-bold text-zinc-600 uppercase tracking-widest whitespace-nowrap leading-none" style={{ fontSize: 'var(--text-xs)' }}>{section.label}</span>
                                        {isUnlockingMode ? (
                                            <span className="font-bold text-green-500 uppercase tracking-widest whitespace-nowrap leading-none animate-pulse" style={{ fontSize: 'var(--text-xs)' }}>UNLOCK?</span>
                                        ) : (
                                            <span className="font-bold text-red-900/80 uppercase tracking-widest whitespace-nowrap leading-none" style={{ fontSize: 'var(--text-xs)' }}>LOCKED</span>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {!iconA && !iconB && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-0.5">
                                                <span className="font-bold text-zinc-700/50 uppercase tracking-widest whitespace-nowrap leading-none" style={{ fontSize: 'var(--text-xs)' }}>{section.label}</span>
                                            </div>
                                        )}
                                        {iconA && <KeptIconDisplay icon={iconA} onClick={(e) => onKeptIconClick(e, iconA)} />}
                                        {iconB && <KeptIconDisplay icon={iconB} onClick={(e) => onKeptIconClick(e, iconB)} />}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
