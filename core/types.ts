import type { RuleMode } from "./rules.ts";

export const TileSuits = {
  MAN: "萬子",
  PIN: "筒子",
  SOU: "索子",
  HONOR: "字牌",
} as const;

export type TileSuit = (typeof TileSuits)[keyof typeof TileSuits];

export interface Tile {
  id: string;
  suit: TileSuit;
  value: number;
  name: string;
  image?: string;
  isRed?: boolean;
}

export const Winds = {
  EAST: "東",
  SOUTH: "南",
  WEST: "西",
  NORTH: "北",
} as const;

export type Wind = (typeof Winds)[keyof typeof Winds];

export const WinMethods = {
  RON: "ron",
  TSUMO: "tsumo",
} as const;

export type WinMethod = (typeof WinMethods)[keyof typeof WinMethods];

export type MeldKind = "sequence" | "triplet" | "kan";

export interface MeldInput {
  kind: MeldKind;
  tiles: Tile[];
  open: boolean;
}

export interface CalculationContext {
  rule: RuleMode;
  winMethod: WinMethod;
  isDealer: boolean;
  seatWind: Wind;
  roundWind: Wind;
  riichi: boolean;
  doubleRiichi: boolean;
  ippatsu: boolean;
  haitei: boolean;
  houtei: boolean;
  rinshan: boolean;
  chankan: boolean;
  tenhou: boolean;
  chiihou: boolean;
  kitaNuki: number;
  dora: number;
  uraDora: number;
  akaDora: number;
}

export interface CalculationInput {
  tiles: Tile[];
  winningTileId?: string;
  melds?: MeldInput[];
  localYaku?: ManualYakuInput[];
  context: CalculationContext;
}

export type ScoreLimit = "mangan" | "haneman" | "baiman" | "sanbaiman" | "counted-yakuman";

export const SCORE_LIMIT_LABELS: Record<ScoreLimit, string> = {
  mangan: "満貫",
  haneman: "跳満",
  baiman: "倍満",
  sanbaiman: "三倍満",
  "counted-yakuman": "数え役満",
};

export interface ManualYakuInput {
  exclusive?: boolean;
  han: number;
  id: string;
  limit?: ScoreLimit;
  name: string;
  yakuman?: number;
}

export interface YakuResult {
  exclusive?: boolean;
  id: string;
  name: string;
  han: number;
  limit?: ScoreLimit;
  yakuman?: number;
}

export interface ScoreResult {
  limitName: string;
  basePoints: number;
  ronPoints: number;
  tsumo: {
    dealerPays: number;
    otherPays: number;
    otherPlayerCount: number;
    winnerIsDealer: boolean;
  } | null;
  totalPoints: number;
}

export interface CalculationResult {
  valid: boolean;
  errors: string[];
  shape: "standard" | "chiitoitsu" | "kokushi" | null;
  yaku: YakuResult[];
  han: number;
  fu: number | null;
  bonusHan: number;
  kitaNuki: number;
  score: ScoreResult | null;
}
