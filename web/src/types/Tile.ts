export type TileSuit =
  | "man"
  | "pin"
  | "sou"
  | "honor";

export interface Tile {
  suit: TileSuit;
  value: number;
  red?: boolean;
}