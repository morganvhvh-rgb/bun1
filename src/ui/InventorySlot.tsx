import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { ICON_THEME } from '@/lib/constants';
import type { KeptIcon } from '@/types/game';

interface InventorySlotProps {
    label: string;
    slotIndices: [number, number];
    keptIcons: (KeptIcon | null)[];
    isUnlocked: boolean;
    isUnlockingMode: boolean;
    onUnlock: () => void;
    onKeptIconClick: (e: React.MouseEvent, icon: KeptIcon) => void;
}

function KeptIconDisplay({ icon, onClick }: { icon: KeptIcon; onClick: (e: React.MouseEvent) => void }) {
    return (
        <div
            className="shrink-0 flex items-center justify-center relative cursor-pointer"
            style={{ width: 'var(--cell-sm)', height: 'var(--cell-sm)' }}
            onClick={onClick}
        >
            <span
                className="absolute top-0.5 left-1 text-white font-mono font-bold leading-none pointer-events-none z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                style={{ fontSize: 'clamp(11px, 2.8vw, 14px)' }}
            >
                {icon.battleCount}
            </span>
            <Icon name={icon.name} scale={3} tintColor={ICON_THEME[icon.name]} />
        </div>
    );
}

export function InventorySlot({
    label,
    slotIndices,
    keptIcons,
    isUnlocked,
    isUnlockingMode,
    onUnlock,
    onKeptIconClick,
}: InventorySlotProps) {
    const [slotA, slotB] = slotIndices;
    const iconA = keptIcons[slotA];
    const iconB = keptIcons[slotB];

    return (
        <div
            className="flex items-center justify-start relative"
            style={{
                width: 'calc(var(--cell-sm) * 2 + var(--gap))',
                height: 'var(--cell-sm)',
                gap: 'calc(var(--gap) * 0.5)',
            }}
            onClick={onUnlock}
        >
            {!isUnlocked ? (
                <div
                    className={cn(
                        "absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded transition-colors",
                        isUnlockingMode && "cursor-pointer hover:bg-zinc-800/50"
                    )}
                    style={{ pointerEvents: isUnlockingMode ? 'auto' : 'none' }}
                >
                    <span
                        className="font-bold text-zinc-600 uppercase tracking-widest whitespace-nowrap leading-none"
                        style={{ fontSize: 'clamp(8px, 2.2vw, 11px)' }}
                    >
                        {label}
                    </span>
                    {isUnlockingMode ? (
                        <span className="font-bold text-green-500 uppercase tracking-widest whitespace-nowrap leading-none animate-pulse"
                            style={{ fontSize: 'clamp(7px, 2vw, 10px)' }}
                        >
                            UNLOCK?
                        </span>
                    ) : (
                        <span className="font-bold text-red-900/80 uppercase tracking-widest whitespace-nowrap leading-none"
                            style={{ fontSize: 'clamp(7px, 2vw, 10px)' }}
                        >
                            LOCKED
                        </span>
                    )}
                </div>
            ) : (
                <>
                    {!iconA && !iconB && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-0.5">
                            <span
                                className="font-bold text-zinc-700/50 uppercase tracking-widest whitespace-nowrap leading-none"
                                style={{ fontSize: 'clamp(8px, 2.2vw, 11px)' }}
                            >
                                {label}
                            </span>
                        </div>
                    )}
                    {iconA && <KeptIconDisplay icon={iconA} onClick={(e) => onKeptIconClick(e, iconA)} />}
                    {iconB && <KeptIconDisplay icon={iconB} onClick={(e) => onKeptIconClick(e, iconB)} />}
                </>
            )}
        </div>
    );
}
