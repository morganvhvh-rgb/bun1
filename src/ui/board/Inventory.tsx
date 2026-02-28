import { useGameStore } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { ICON_THEME } from '@/lib/constants';
import type { KeptIcon } from '@/types/game';

const SLOTS = [0, 1, 2, 3, 4, 5];

function KeptIconDisplay({ icon, onClick }: { icon: KeptIcon; onClick: (e: React.MouseEvent) => void }) {
    return (
        <div className="shrink-0 flex items-center justify-center relative cursor-pointer opacity-80 active:opacity-50 transition-opacity" style={{ width: 'var(--cell-sm)', height: 'var(--cell-sm)' }} onClick={onClick}>
            <span className="absolute bottom-0.5 right-1 z-20 text-white font-mono font-bold leading-none" style={{ fontSize: '10px' }}>
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
    const { keptIcons, unlockedSlots } = useGameStore();

    return (
        <div className="w-full shrink-0 mb-1 flex items-center justify-center min-h-[var(--cell-sm)]">
            <div className="flex items-center justify-center shrink-0" style={{ gap: 'var(--gap)' }}>
                {SLOTS.map((slot) => {
                    const icon = keptIcons[slot];
                    const isUnlocked = slot < 3 || unlockedSlots[slot as 3 | 4 | 5];

                    if (!isUnlocked) {
                        return (
                            <div
                                key={`slot-${slot}`}
                                className="flex flex-col items-center justify-center border border-zinc-800 bg-black"
                                style={{ width: 'var(--cell-sm)', height: 'var(--cell-sm)' }}
                            >
                                <Icon name="key" scale={1.2} tintColor="#71717a" />
                            </div>
                        );
                    }

                    return (
                        <div key={`slot-${slot}`} className="bg-black border border-zinc-800 flex items-center justify-center relative" style={{ width: 'var(--cell-sm)', height: 'var(--cell-sm)' }}>
                            {icon && <KeptIconDisplay icon={icon} onClick={(e) => onKeptIconClick(e, icon)} />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
