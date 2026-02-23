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
            className="shrink-0 w-12 h-12 flex items-center justify-center relative cursor-pointer"
            onClick={onClick}
        >
            <span className="absolute top-1 left-1.5 text-white text-base font-mono font-bold leading-none pointer-events-none z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
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
            className="flex gap-2 items-center justify-start w-[6.5rem] h-12 relative"
            onClick={onUnlock}
        >
            {!isUnlocked ? (
                <div
                    className={cn(
                        "absolute inset-0 flex flex-col items-center justify-center gap-0.5 mt-0.5 rounded transition-colors",
                        isUnlockingMode && "cursor-pointer hover:bg-zinc-800/50"
                    )}
                    style={{ pointerEvents: isUnlockingMode ? 'auto' : 'none' }}
                >
                    <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest whitespace-nowrap leading-none">
                        {label}
                    </span>
                    {isUnlockingMode ? (
                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest whitespace-nowrap leading-none animate-pulse">
                            UNLOCK?
                        </span>
                    ) : (
                        <span className="text-[10px] font-bold text-red-900/80 uppercase tracking-widest whitespace-nowrap leading-none">
                            LOCKED
                        </span>
                    )}
                </div>
            ) : (
                <>
                    {!iconA && !iconB && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-0.5 mt-0.5">
                            <span className="text-xs font-bold text-zinc-700/50 uppercase tracking-widest whitespace-nowrap leading-none">
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
