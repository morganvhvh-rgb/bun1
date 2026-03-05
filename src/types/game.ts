import { SYMBOL_MAP } from '@/lib/constants';

export type SymbolName = keyof typeof SYMBOL_MAP;

export interface GridSymbol {
    id: string;
    name: SymbolName;
    isBoosted?: boolean;
}

export interface KeptSymbol {
    name: SymbolName;
    battleCount: number;
    isBoosted?: boolean;
}


