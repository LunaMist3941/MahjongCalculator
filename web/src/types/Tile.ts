export const TileSuit = {
  MAN: "萬子",
  PIN: "筒子",
  SOU: "索子",
  HONOR: "字牌",
} as const;

export type TileSuit =
  typeof TileSuit[keyof typeof TileSuit];


export interface Tile {
  id: string;
  suit: TileSuit;
  value: number;
  name: string;
  isRed?: boolean;
}