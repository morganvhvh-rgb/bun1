import { ICON_MAP } from '@/lib/constants';

export type IconName = keyof typeof ICON_MAP;

export interface GridItem {
    id: string;
    name: IconName;
}

export interface KeptIcon {
    name: IconName;
    battleCount: number;
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
    name: IconName;
    hp: number;
    maxHp: number;
    atk: number;
    lvl: number;
    isVisible: boolean;
}
