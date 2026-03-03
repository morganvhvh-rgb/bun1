import { useGameStore } from '@/store/gameStore';
import { Icon } from '../shared/Icon';
import { SYMBOL_THEME } from '@/lib/constants';
import type { KeptSymbol } from '@/types/game';

const SLOTS = [0, 1, 2, 3, 4, 5];

function KeptSymbolDisplay({ symbol, onClick }: { symbol: KeptSymbol; onClick: (e: React.MouseEvent) => void }) {
    return (
        <div
            className="w-full h-full flex items-center justify-center relative cursor-pointer opacity-80 active:opacity-50 transition-opacity"
            onClick={onClick}
        >
            <div className="relative z-10">
                <Icon name={symbol.name} scale={2.2} tintColor={SYMBOL_THEME[symbol.name]} />
            </div>
            <span
                className="absolute bottom-0.5 right-1 z-20 text-[#f0e8d8] font-mono font-bold leading-none select-none"
                style={{ fontSize: '11px', textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}
            >
                {symbol.battleCount}
            </span>
        </div>
    );
}

interface InventoryProps {
    onKeptSymbolClick: (e: React.MouseEvent, symbol: KeptSymbol) => void;
}

export function Inventory({ onKeptSymbolClick }: InventoryProps) {
    const { keptSymbols, unlockedSlots } = useGameStore();

    // Total width matches the old layout: 6 * cell-sm + 5 * gap
    return (
        <div
            className="shrink-0 mb-1 flex items-center justify-center"
            style={{ height: 'var(--cell-sm)' }}
        >
            <div
                className="flex items-stretch h-full rounded-xl overflow-hidden border border-white/10"
                style={{
                    width: 'calc(var(--cell-sm) * 6 + var(--gap) * 5)',
                    background: '#080808',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
            >
                {SLOTS.map((slot) => {
                    const symbol = keptSymbols[slot];
                    const isUnlocked = slot < 3 || unlockedSlots[slot as 3 | 4 | 5];
                    const isLast = slot === SLOTS.length - 1;

                    return (
                        <div
                            key={`slot-${slot}`}
                            className="flex-1 flex items-center justify-center relative min-w-0"
                            style={{
                                borderRight: isLast ? 'none' : '1px solid rgba(255,255,255,0.07)',
                            }}
                        >
                            {!isUnlocked ? (
                                <Icon name="key" scale={1.2} tintColor="#3f3f46" />
                            ) : symbol ? (
                                <KeptSymbolDisplay symbol={symbol} onClick={(e) => onKeptSymbolClick(e, symbol)} />
                            ) : (
                                // empty unlocked slot — subtle dot
                                <div className="w-1 h-1 rounded-full bg-white/10" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
