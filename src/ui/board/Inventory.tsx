import { useGameStore } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { SYMBOL_THEME } from '@/lib/constants';
import type { KeptSymbol } from '@/types/game';

const SLOTS = [0, 1, 2, 3, 4, 5];

function KeptSymbolDisplay({ symbol, onClick }: { symbol: KeptSymbol; onClick: (e: React.MouseEvent) => void }) {
    return (
        <div className="shrink-0 flex items-center justify-center relative cursor-pointer opacity-80 active:opacity-50 transition-opacity" style={{ width: 'var(--cell-sm)', height: 'var(--cell-sm)' }} onClick={onClick}>
            <span className="absolute bottom-0 right-0.5 z-20 text-white font-mono font-bold leading-none select-none" style={{ fontSize: '13px', textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>
                {symbol.battleCount}
            </span>
            <div className="relative z-10">
                <Icon name={symbol.name} scale={2.7} tintColor={SYMBOL_THEME[symbol.name]} />
            </div>
        </div>
    );
}

interface InventoryProps {
    onKeptSymbolClick: (e: React.MouseEvent, symbol: KeptSymbol) => void;
}

export function Inventory({ onKeptSymbolClick }: InventoryProps) {
    const { keptSymbols, unlockedSlots } = useGameStore();

    return (
        <div className="w-full shrink-0 mb-1 flex items-center justify-center min-h-[var(--cell-sm)]">
            <div className="flex items-center justify-center shrink-0" style={{ gap: 'var(--gap)' }}>
                {SLOTS.map((slot) => {
                    const symbol = keptSymbols[slot];
                    const isUnlocked = slot < 3 || unlockedSlots[slot as 3 | 4 | 5];

                    if (!isUnlocked) {
                        return (
                            <div
                                key={`slot-${slot}`}
                                className="flex flex-col items-center justify-center surface-panel opacity-60 rounded-md"
                                style={{ width: 'var(--cell-sm)', height: 'var(--cell-sm)' }}
                            >
                                <Icon name="key" scale={1.2} tintColor="#71717a" />
                            </div>
                        );
                    }

                    return (
                        <div key={`slot-${slot}`} className="surface-panel flex items-center justify-center relative rounded-md shadow-sm" style={{ width: 'var(--cell-sm)', height: 'var(--cell-sm)' }}>
                            {symbol && <KeptSymbolDisplay symbol={symbol} onClick={(e) => onKeptSymbolClick(e, symbol)} />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
