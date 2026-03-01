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

export interface CharacterStats {
    hp: number;
    maxHp: number;
    atk: number;
    magic: number;
    gear: number;
}

export interface EnemyStats {
    id: string;
    name: SymbolName;
    hp: number;
    maxHp: number;
    atk: number;
    lvl: number;
    isVisible: boolean;
}
