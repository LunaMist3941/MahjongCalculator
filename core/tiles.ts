import { TileSuits, type Tile, type TileSuit } from "./types.ts";

function createNumberTiles(
  suit: TileSuit,
  prefix: string,
  name: string,
): Tile[] {
  return Array.from({ length: 9 }, (_, index) => ({
    id: `${prefix}-${index + 1}`,
    suit,
    value: index + 1,
    name: `${index + 1}${name}`,
    image: `./tiles/${prefix}-${index + 1}.svg`,
  }));
}

export const tiles: Tile[] = [
  ...createNumberTiles(TileSuits.MAN, "man", "萬"),
  ...createNumberTiles(TileSuits.PIN, "pin", "筒"),
  ...createNumberTiles(TileSuits.SOU, "sou", "索"),
  { id: "east", suit: TileSuits.HONOR, value: 1, name: "東", image: "./tiles/east.svg" },
  { id: "south", suit: TileSuits.HONOR, value: 2, name: "南", image: "./tiles/south.svg" },
  { id: "west", suit: TileSuits.HONOR, value: 3, name: "西", image: "./tiles/west.svg" },
  { id: "north", suit: TileSuits.HONOR, value: 4, name: "北", image: "./tiles/north.svg" },
  { id: "white", suit: TileSuits.HONOR, value: 5, name: "白", image: "./tiles/white.svg" },
  { id: "green", suit: TileSuits.HONOR, value: 6, name: "發", image: "./tiles/green.svg" },
  { id: "red", suit: TileSuits.HONOR, value: 7, name: "中", image: "./tiles/red.svg" },
];

const tileById = new Map(tiles.map((tile) => [tile.id, tile]));

export function getTileById(id: string): Tile | undefined {
  return tileById.get(id);
}
