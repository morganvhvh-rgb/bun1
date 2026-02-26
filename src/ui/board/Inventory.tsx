import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { ICON_THEME } from '@/lib/constants';
import type { KeptIcon } from '@/types/game';

const SECTIONS: { id: 0 | 1 | 2; slots: [number, number] }[] = [
    { id: 0, slots: [0, 1] },
    { id: 1, slots: [2, 3] },
    { id: 2, slots: [4, 5] },
];

function KeptIconDisplay({ icon, onClick }: { icon: KeptIcon; onClick: (e: React.MouseEvent) => void }) {
    return (
        <div className="shrink-0 flex items-center justify-center relative cursor-pointer opacity-80 active:opacity-50 transition-opacity" style={{ width: 'var(--cell-sm)', height: 'var(--cell-sm)' }} onClick={onClick}>
            <span className="absolute -top-1 -right-1 z-20 flex items-center justify-center w-4 h-4 bg-black border border-zinc-600 text-white font-mono font-bold" style={{ fontSize: '10px' }}>
                {icon.battleCount}
            </span>
            <div className="relative z-10">
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
        <div className="w-full shrink-0 mb-1 flex items-center justify-center min-h-[var(--cell-sm)]">
            <div className="flex items-center justify-center shrink-0" style={{ gap: 'var(--gap)' }}>
                {SECTIONS.map((section) => {
                    const [slotA, slotB] = section.slots;
                    const iconA = keptIcons[slotA];
                    const iconB = keptIcons[slotB];
                    const isUnlocked = unlockedSections[section.id];

                    if (!isUnlocked) {
                        const typeLabel = section.id === 0 ? 'Food / Item' : section.id === 1 ? 'Armor / Magic' : 'Weapon / Music';
                        return (
                            <div
                                key={`sec-${section.id}`}
                                className={cn('flex flex-col items-center justify-center border border-zinc-600', isUnlockingMode ? 'cursor-pointer bg-zinc-900' : 'bg-black')}
                                style={{ width: 'calc(var(--cell-sm) * 2 + var(--gap))', height: 'var(--cell-sm)', pointerEvents: isUnlockingMode ? 'auto' : 'none' }}
                                onClick={() => isUnlockingMode && !isUnlocked && unlockSection(section.id)}
                            >
                                <span className={cn("text-[8px] sm:text-[9px] uppercase tracking-wider font-bold mb-0.5", isUnlockingMode ? "text-zinc-400" : "text-zinc-600")}>
                                    {typeLabel}
                                </span>
                                <div className="flex items-center justify-center gap-1">
                                    {isUnlockingMode ? (
                                        <>
                                            <i className="ra ra-unlock text-white" style={{ fontSize: '12px' }} />
                                            <span className="font-bold text-white uppercase tracking-widest leading-none" style={{ fontSize: '9px' }}>UNLOCK</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="ra ra-padlock text-zinc-500" style={{ fontSize: '12px' }} />
                                            <span className="font-bold text-zinc-500 uppercase tracking-widest leading-none" style={{ fontSize: '9px' }}>LOCKED</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={`sec-${section.id}`} className="flex items-center" style={{ gap: 'var(--gap)' }}>
                            <div className="bg-black border border-zinc-600 flex items-center justify-center relative" style={{ width: 'var(--cell-sm)', height: 'var(--cell-sm)' }}>
                                {iconA && <KeptIconDisplay icon={iconA} onClick={(e) => onKeptIconClick(e, iconA)} />}
                            </div>
                            <div className="bg-black border border-zinc-600 flex items-center justify-center relative" style={{ width: 'var(--cell-sm)', height: 'var(--cell-sm)' }}>
                                {iconB && <KeptIconDisplay icon={iconB} onClick={(e) => onKeptIconClick(e, iconB)} />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
