import { getRuleConfig, RULE_OPTIONS } from "./rules.ts";
import {
  TileSuits,
  Winds,
  type CalculationContext,
  type CalculationInput,
  type CalculationResult,
  type MeldInput,
  type ManualYakuInput,
  type ScoreLimit,
  SCORE_LIMIT_LABELS,
  type ScoreResult,
  type Tile,
  type Wind,
  type YakuResult,
} from "./types.ts";

const TILE_COUNT = 34;
const HONOR_START = 27;
const DRAGON_START = 31;
const SCORE_LIMIT_BASE_POINTS: Record<ScoreLimit, number> = {
  mangan: 2000,
  haneman: 3000,
  baiman: 4000,
  sanbaiman: 6000,
  "counted-yakuman": 8000,
};

interface Group {
  kind: "sequence" | "triplet" | "kan";
  tiles: number[];
  open: boolean;
}

interface Candidate {
  shape: "standard" | "chiitoitsu" | "kokushi";
  pair: number | null;
  groups: Group[];
}

interface EvaluatedCandidate {
  candidate: Candidate;
  yaku: YakuResult[];
  han: number;
  fu: number | null;
  bonusHan: number;
  score: ScoreResult | null;
}

function tileIndex(tile: Tile): number | null {
  if (tile.suit === TileSuits.MAN && tile.value >= 1 && tile.value <= 9) {
    return tile.value - 1;
  }
  if (tile.suit === TileSuits.PIN && tile.value >= 1 && tile.value <= 9) {
    return 9 + tile.value - 1;
  }
  if (tile.suit === TileSuits.SOU && tile.value >= 1 && tile.value <= 9) {
    return 18 + tile.value - 1;
  }
  if (tile.suit === TileSuits.HONOR && tile.value >= 1 && tile.value <= 7) {
    return HONOR_START + tile.value - 1;
  }
  return null;
}

function countsFor(tiles: Tile[]): { counts: number[]; errors: string[] } {
  const counts = Array.from({ length: TILE_COUNT }, () => 0);
  const errors: string[] = [];

  for (const tile of tiles) {
    const index = tileIndex(tile);
    if (index === null) {
      errors.push(`牌「${tile.name}」の定義が不正です。`);
      continue;
    }
    counts[index] += 1;
    if (counts[index] > 4) {
      errors.push(`牌「${tile.name}」が4枚を超えています。`);
    }
  }

  return { counts, errors };
}

function isHonor(index: number): boolean {
  return index >= HONOR_START;
}

function isTerminal(index: number): boolean {
  return !isHonor(index) && (index % 9 === 0 || index % 9 === 8);
}

function isTerminalOrHonor(index: number): boolean {
  return isHonor(index) || isTerminal(index);
}

function isSimple(index: number): boolean {
  return !isHonor(index) && index % 9 >= 1 && index % 9 <= 7;
}

function isDragon(index: number): boolean {
  return index >= DRAGON_START;
}

function isGreen(index: number): boolean {
  return index === 19 || index === 20 || index === 21 || index === 23 || index === 25 || index === 32;
}

function windIndex(wind: Wind): number {
  switch (wind) {
    case Winds.EAST:
      return 27;
    case Winds.SOUTH:
      return 28;
    case Winds.WEST:
      return 29;
    case Winds.NORTH:
      return 30;
  }
}

function hasOnly(counts: number[], predicate: (index: number) => boolean): boolean {
  return counts.every((count, index) => count === 0 || predicate(index));
}

function sequenceKey(group: Group): string {
  return `${Math.floor(group.tiles[0] / 9)}-${group.tiles[0] % 9}`;
}

function isSequenceTiles(group: number[]): boolean {
  return group.length === 3 &&
    group[0] < HONOR_START &&
    Math.floor(group[0] / 9) === Math.floor(group[1] / 9) &&
    group[1] === group[0] + 1 &&
    group[2] === group[0] + 2;
}

function isTripletGroup(group: Group): boolean {
  return group.kind === "triplet" || group.kind === "kan";
}

function normalizeMelds(melds: MeldInput[]): { groups: Group[]; errors: string[] } {
  const groups: Group[] = [];
  const errors: string[] = [];

  for (const meld of melds) {
    const expectedLength = meld.kind === "kan" ? 4 : 3;
    if (meld.tiles.length !== expectedLength) {
      errors.push(meld.kind === "kan"
        ? "槓子は同じ牌4枚で指定してください。"
        : "順子・刻子は3枚で指定してください。");
      continue;
    }
    const indexes = meld.tiles.map(tileIndex);
    if (indexes.some((index) => index === null)) {
      errors.push("鳴き面子に不正な牌が含まれています。");
      continue;
    }
    const normalized = indexes as number[];
    const ordered = meld.kind === "sequence"
      ? [...normalized].sort((left, right) => left - right)
      : normalized;
    if (meld.kind === "sequence" && !isSequenceTiles(ordered)) {
      errors.push("順子の牌が連続していません。");
      continue;
    }
    if ((meld.kind === "triplet" || meld.kind === "kan") && new Set(normalized).size !== 1) {
      errors.push(meld.kind === "kan" ? "槓子の牌が一致していません。" : "刻子の牌が一致していません。");
      continue;
    }
    groups.push({ kind: meld.kind, tiles: ordered, open: meld.open });
  }

  return { groups, errors };
}

function findStandardDecompositions(
  counts: number[],
  groupsNeeded: number,
): number[][][] {
  const decompositions: number[][][] = [];

  function search(remaining: number[], built: number[][]): void {
    if (built.length === groupsNeeded) {
      if (remaining.every((count) => count === 0)) {
        decompositions.push(built);
      }
      return;
    }

    const first = remaining.findIndex((count) => count > 0);
    if (first < 0) {
      return;
    }

    if (remaining[first] >= 3) {
      const next = [...remaining];
      next[first] -= 3;
      search(next, [...built, [first, first, first]]);
    }

    if (first < HONOR_START && first % 9 <= 6 &&
        remaining[first + 1] > 0 && remaining[first + 2] > 0) {
      const next = [...remaining];
      next[first] -= 1;
      next[first + 1] -= 1;
      next[first + 2] -= 1;
      search(next, [...built, [first, first + 1, first + 2]]);
    }
  }

  search(counts, []);
  return decompositions;
}

function createCandidates(concealedCounts: number[], meldGroups: Group[]): Candidate[] {
  const candidates: Candidate[] = [];

  if (meldGroups.length === 0) {
    const pairs = concealedCounts.filter((count) => count === 2).length;
    if (pairs === 7 && concealedCounts.every((count) => count === 0 || count === 2)) {
      candidates.push({ shape: "chiitoitsu", pair: null, groups: [] });
    }

    const kokushiIndexes = [
      0, 8, 9, 17, 18, 26,
      27, 28, 29, 30, 31, 32, 33,
    ];
    if (kokushiIndexes.every((index) => concealedCounts[index] >= 1) &&
        kokushiIndexes.some((index) => concealedCounts[index] >= 2)) {
      candidates.push({ shape: "kokushi", pair: null, groups: [] });
    }
  }

  const groupsNeeded = 4 - meldGroups.length;
  if (groupsNeeded < 0) {
    return candidates;
  }

  for (let pair = 0; pair < TILE_COUNT; pair += 1) {
    if (concealedCounts[pair] < 2) {
      continue;
    }
    const remaining = [...concealedCounts];
    remaining[pair] -= 2;
    for (const decomposition of findStandardDecompositions(remaining, groupsNeeded)) {
      candidates.push({
        shape: "standard",
        pair,
        groups: [
          ...meldGroups,
          ...decomposition.map((group) => ({
            kind: isSequenceTiles(group) ? "sequence" as const : "triplet" as const,
            tiles: group,
            open: false,
          })),
        ],
      });
    }
  }

  return candidates;
}

function isValueTile(index: number, context: CalculationContext): boolean {
  return isDragon(index) ||
    index === windIndex(context.seatWind) ||
    index === windIndex(context.roundWind);
}

function isRyanmen(candidate: Candidate, winningIndex: number | null): boolean {
  if (candidate.shape !== "standard" || winningIndex === null) {
    return false;
  }
  const winningGroup = candidate.groups.find((group) =>
    group.kind === "sequence" && group.tiles.includes(winningIndex));
  if (!winningGroup) {
    return false;
  }
  const rank = winningIndex % 9;
  const start = winningGroup.tiles[0] % 9;
  if (rank === start + 1 || start === 0 || start === 6) {
    return false;
  }
  return true;
}

function addYaku(yaku: YakuResult[], id: string, name: string, han: number): void {
  yaku.push({ id, name, han });
}

function addYakuman(yaku: YakuResult[], id: string, name: string, yakuman = 1): void {
  yaku.push({ id, name, han: 0, yakuman });
}

function isScoreLimit(value: unknown): value is ScoreLimit {
  return value === "mangan" || value === "haneman" || value === "baiman" ||
    value === "sanbaiman" || value === "counted-yakuman";
}

function keepHighestLimitOnly(yaku: YakuResult[]): YakuResult[] {
  const exclusiveYakuman = yaku.find((item) => item.yakuman && item.exclusive);
  if (exclusiveYakuman) {
    return [exclusiveYakuman];
  }
  const yakuman = yaku.filter((item) => item.yakuman);
  if (yakuman.length > 0) {
    return yakuman;
  }
  const fixedLimits = yaku.filter((item): item is YakuResult & { limit: ScoreLimit } => item.limit !== undefined);
  const highestLimit = fixedLimits.reduce<YakuResult & { limit: ScoreLimit } | undefined>((highest, item) =>
    !highest || SCORE_LIMIT_BASE_POINTS[item.limit] > SCORE_LIMIT_BASE_POINTS[highest.limit] ? item : highest, undefined);
  return highestLimit ? [highestLimit] : yaku;
}

function normalizeManualYaku(localYaku: ManualYakuInput[]): { yaku: YakuResult[]; errors: string[] } {
  const yaku: YakuResult[] = [];
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const item of localYaku) {
    if (!item.id || !item.name.trim()) {
      errors.push("手動追加役にはIDと名前が必要です。");
      continue;
    }
    if (item.exclusive !== undefined && typeof item.exclusive !== "boolean") {
      errors.push(`手動役「${item.name}」の排他設定が不正です。`);
      continue;
    }
    if (ids.has(item.id)) {
      errors.push(`手動追加役「${item.name}」が重複しています。`);
      continue;
    }
    ids.add(item.id);
    if (item.yakuman !== undefined) {
      if (item.limit !== undefined || !Number.isInteger(item.yakuman) || item.yakuman < 1 || item.yakuman > 4 || item.han !== 0) {
        errors.push(`手動役満「${item.name}」の値が不正です。`);
        continue;
      }
      yaku.push({ id: item.id, name: item.name.trim(), han: 0, yakuman: item.yakuman, ...(item.exclusive ? { exclusive: true } : {}) });
      continue;
    }
    if (item.limit !== undefined) {
      if (!isScoreLimit(item.limit) || item.han !== 0) {
        errors.push(`手動上限役「${item.name}」の値が不正です。`);
        continue;
      }
      yaku.push({ id: item.id, name: item.name.trim(), han: 0, limit: item.limit });
      continue;
    }
    if (!Number.isInteger(item.han) || item.han < 1 || item.han > 13) {
      errors.push(`手動役「${item.name}」の翻数は1〜13翻で指定してください。`);
      continue;
    }
    yaku.push({ id: item.id, name: item.name.trim(), han: item.han });
  }

  return { yaku, errors };
}

function addContextYaku(
  yaku: YakuResult[],
  context: CalculationContext,
  closed: boolean,
): void {
  if (context.doubleRiichi && closed) {
    addYaku(yaku, "double-riichi", "ダブル立直", 2);
  } else if (context.riichi && closed) {
    addYaku(yaku, "riichi", "立直", 1);
  }
  if (context.ippatsu && context.riichi && closed) {
    addYaku(yaku, "ippatsu", "一発", 1);
  }
  if (context.winMethod === "tsumo" && closed) {
    addYaku(yaku, "menzen-tsumo", "門前清自摸和", 1);
  }
  if (context.haitei && context.winMethod === "tsumo") {
    addYaku(yaku, "haitei", "海底摸月", 1);
  }
  if (context.houtei && context.winMethod === "ron") {
    addYaku(yaku, "houtei", "河底撈魚", 1);
  }
  if (context.rinshan && context.winMethod === "tsumo") {
    addYaku(yaku, "rinshan", "嶺上開花", 1);
  }
  if (context.chankan && context.winMethod === "ron") {
    addYaku(yaku, "chankan", "搶槓", 1);
  }
  if (context.tenhou && context.winMethod === "tsumo" && context.isDealer) {
    addYakuman(yaku, "tenhou", "天和");
  }
  if (context.chiihou && context.winMethod === "tsumo" && !context.isDealer) {
    addYakuman(yaku, "chiihou", "地和");
  }
}

function getChuurenYaku(
  counts: number[],
  winningIndex: number | null,
  closed: boolean,
): YakuResult | null {
  if (!closed) {
    return null;
  }

  const numberedSuit = new Set(
    counts
      .flatMap((count, index) => count > 0 && !isHonor(index) ? [Math.floor(index / 9)] : []),
  );
  if (numberedSuit.size !== 1 || counts.reduce((sum, count) => sum + count, 0) !== 14) {
    return null;
  }

  const suitStart = [...numberedSuit][0] * 9;
  const required = [3, 1, 1, 1, 1, 1, 1, 1, 3];
  if (!required.every((minimum, rank) => counts[suitStart + rank] >= minimum)) {
    return null;
  }

  const beforeWinningTile = [...counts];
  const winningTileIsInSuit = winningIndex !== null &&
    winningIndex >= suitStart && winningIndex < suitStart + 9;
  if (winningTileIsInSuit) {
    beforeWinningTile[winningIndex] -= 1;
  }
  const isPure = winningTileIsInSuit &&
    required.every((minimum, rank) => beforeWinningTile[suitStart + rank] === minimum);

  return isPure
    ? { id: "junsei-chuuren", name: "純正九蓮宝燈", han: 0, yakuman: 2 }
    : { id: "chuuren", name: "九蓮宝燈", han: 0, yakuman: 1 };
}

function isKokushiThirteenWait(counts: number[], winningIndex: number | null): boolean {
  const kokushiIndexes = [
    0, 8, 9, 17, 18, 26,
    27, 28, 29, 30, 31, 32, 33,
  ];
  if (winningIndex === null || !kokushiIndexes.includes(winningIndex)) {
    return false;
  }

  const beforeWinningTile = [...counts];
  beforeWinningTile[winningIndex] -= 1;
  return kokushiIndexes.every((index) => beforeWinningTile[index] === 1) &&
    beforeWinningTile.every((count, index) => kokushiIndexes.includes(index) || count === 0);
}

function evaluateYaku(
  candidate: Candidate,
  counts: number[],
  context: CalculationContext,
  winningIndex: number | null,
): YakuResult[] {
  const groups = candidate.groups;
  const sequences = groups.filter((group) => group.kind === "sequence");
  const triplets = groups.filter(isTripletGroup);
  const closed = groups.every((group) => !group.open);
  const allIndexes = counts.flatMap((count, index) =>
    Array.from({ length: count }, () => index));
  const yaku: YakuResult[] = [];
  addContextYaku(yaku, context, closed);

  if (candidate.shape === "kokushi") {
    if (isKokushiThirteenWait(counts, winningIndex)) {
      addYakuman(yaku, "kokushi-thirteen-wait", "国士無双十三面待ち", 2);
    } else {
      addYakuman(yaku, "kokushi", "国士無双");
    }
    return keepHighestLimitOnly(yaku);
  }

  if (candidate.shape === "chiitoitsu") {
    addYaku(yaku, "chiitoitsu", "七対子", 2);
  }

  if (hasOnly(counts, isSimple)) {
    addYaku(yaku, "tanyao", "断么九", 1);
  }

  const dragonNames = ["白", "發", "中"];
  for (let index = DRAGON_START; index < TILE_COUNT; index += 1) {
    if (triplets.some((group) => group.tiles[0] === index)) {
      addYaku(yaku, `yakuhai-dragon-${index}`, `役牌 ${dragonNames[index - DRAGON_START]}`, 1);
    }
  }
  for (const [id, name, index] of [
    ["seat-wind", "自風", windIndex(context.seatWind)],
    ["round-wind", "場風", windIndex(context.roundWind)],
  ] as const) {
    if (triplets.some((group) => group.tiles[0] === index)) {
      addYaku(yaku, id, name, 1);
    }
  }

  const isPinfu = closed && sequences.length === 4 &&
    candidate.pair !== null && !isValueTile(candidate.pair, context) &&
    isRyanmen(candidate, winningIndex);
  if (isPinfu) {
    addYaku(yaku, "pinfu", "平和", 1);
  }

  const sequenceCounts = new Map<string, number>();
  for (const group of sequences) {
    const key = sequenceKey(group);
    sequenceCounts.set(key, (sequenceCounts.get(key) ?? 0) + 1);
  }
  const repeatedSequencePairs = [...sequenceCounts.values()].filter((count) => count >= 2).length;
  if (closed && repeatedSequencePairs >= 2) {
    addYaku(yaku, "ryanpeikou", "二盃口", 3);
  } else if (closed && repeatedSequencePairs >= 1) {
    addYaku(yaku, "iipeikou", "一盃口", 1);
  }

  const hasSequence = sequences.length > 0;
  const hasHonor = allIndexes.some(isHonor);
  const everyGroupHasTerminalOrHonor = candidate.pair !== null &&
    isTerminalOrHonor(candidate.pair) &&
    groups.every((group) => group.tiles.some(isTerminalOrHonor));
  const everyGroupHasTerminal = candidate.pair !== null &&
    isTerminal(candidate.pair) &&
    groups.every((group) => group.tiles.some(isTerminal));
  if (hasSequence && everyGroupHasTerminal && !hasHonor) {
    addYaku(yaku, "junchan", "純全帯么九", closed ? 3 : 2);
  } else if (hasSequence && everyGroupHasTerminalOrHonor && hasHonor) {
    addYaku(yaku, "chanta", "混全帯么九", closed ? 2 : 1);
  }

  const suits = new Set(allIndexes
    .filter((index) => !isHonor(index))
    .map((index) => Math.floor(index / 9)));
  if (suits.size === 1 && !hasHonor) {
    addYaku(yaku, "chinitsu", "清一色", closed ? 6 : 5);
  } else if (suits.size === 1 && hasHonor) {
    addYaku(yaku, "honitsu", "混一色", closed ? 3 : 2);
  }

  if (triplets.length === 4) {
    addYaku(yaku, "toitoi", "対々和", 2);
  }
  const kanCount = groups.filter((group) => group.kind === "kan").length;
  if (kanCount >= 3) {
    addYaku(yaku, "sankantsu", "三槓子", 2);
  }
  const concealedTriplets = triplets.filter((group) =>
    !group.open && !(context.winMethod === "ron" && group.tiles.includes(winningIndex ?? -1)),
  );
  if (concealedTriplets.length >= 3) {
    addYaku(yaku, "sanankou", "三暗刻", 2);
  }
  if (allIndexes.every(isTerminalOrHonor)) {
    addYaku(yaku, "honroutou", "混老頭", 2);
  }

  const sanshoku = Array.from({ length: 7 }, (_, rank) =>
    [rank, rank + 9, rank + 18].every((start) =>
      sequences.some((group) => group.tiles[0] === start)),
  ).some(Boolean);
  if (sanshoku) {
    addYaku(yaku, "sanshoku", "三色同順", closed ? 2 : 1);
  }

  const sanshokuDoukou = Array.from({ length: 9 }, (_, rank) =>
    [rank, rank + 9, rank + 18].every((tile) =>
      triplets.some((group) => group.tiles[0] === tile)),
  ).some(Boolean);
  if (sanshokuDoukou) {
    addYaku(yaku, "sanshoku-doukou", "三色同刻", 2);
  }

  const ittsu = [0, 9, 18].some((suitStart) =>
    [0, 3, 6].every((rank) =>
      sequences.some((group) => group.tiles[0] === suitStart + rank)),
  );
  if (ittsu) {
    addYaku(yaku, "ittsu", "一気通貫", closed ? 2 : 1);
  }

  const dragonTriplets = triplets.filter((group) => isDragon(group.tiles[0])).length;
  if (dragonTriplets === 2 && candidate.pair !== null && isDragon(candidate.pair)) {
    addYaku(yaku, "shousangen", "小三元", 2);
  }

  const allWinds = triplets.filter((group) => group.tiles[0] >= 27 && group.tiles[0] <= 30).length;
  const yakuman: YakuResult[] = [];
  if (allWinds === 3 && candidate.pair !== null && candidate.pair >= 27 && candidate.pair <= 30) {
    addYakuman(yakuman, "shousuushi", "小四喜");
  }
  if (allWinds === 4) {
    addYakuman(yakuman, "daisuushi", "大四喜", 2);
  }
  if (dragonTriplets === 3) {
    addYakuman(yakuman, "daisangen", "大三元");
  }
  if (allIndexes.every(isHonor)) {
    addYakuman(yakuman, "tsuuiisou", "字一色");
  }
  if (allIndexes.every(isTerminal)) {
    addYakuman(yakuman, "chinroutou", "清老頭");
  }
  if (allIndexes.every(isGreen)) {
    addYakuman(yakuman, "ryuuiisou", "緑一色");
  }
  const chuuren = getChuurenYaku(counts, winningIndex, closed);
  if (chuuren) {
    yakuman.push(chuuren);
  }
  if (triplets.length === 4 && concealedTriplets.length === 4 &&
      (context.winMethod === "tsumo" || candidate.pair === winningIndex)) {
    addYakuman(yakuman, "suuankou", "四暗刻", candidate.pair === winningIndex ? 2 : 1);
  }
  if (groups.filter((group) => group.kind === "kan").length === 4) {
    addYakuman(yakuman, "suukantsu", "四槓子");
  }

  return keepHighestLimitOnly([...yaku, ...yakuman]);
}

function roundUp(value: number, unit: number): number {
  return Math.ceil(value / unit) * unit;
}

function calculateFu(
  candidate: Candidate,
  yaku: YakuResult[],
  context: CalculationContext,
  winningIndex: number | null,
): number {
  if (candidate.shape === "chiitoitsu") {
    return 25;
  }

  const hasPinfu = yaku.some((item) => item.id === "pinfu");
  if (hasPinfu && context.winMethod === "tsumo") {
    return 20;
  }

  let fu = 20;
  if (context.winMethod === "tsumo") {
    fu += 2;
  } else if (candidate.groups.every((group) => !group.open)) {
    fu += 10;
  }

  if (candidate.pair !== null) {
    if (isDragon(candidate.pair)) fu += 2;
    if (candidate.pair === windIndex(context.seatWind)) fu += 2;
    if (candidate.pair === windIndex(context.roundWind)) fu += 2;
  }

  for (const group of candidate.groups) {
    if (!isTripletGroup(group)) {
      continue;
    }
    const tile = group.tiles[0];
    const amount = group.kind === "kan"
      ? group.open ? 8 : 16
      : group.open ? 2 : 4;
    fu += isTerminalOrHonor(tile) ? amount * 2 : amount;
  }

  if (winningIndex !== null && !isRyanmen(candidate, winningIndex)) {
    fu += 2;
  }

  const roundedFu = roundUp(fu, 10);
  return context.winMethod === "ron" ? Math.max(30, roundedFu) : roundedFu;
}

function calculateScore(
  han: number,
  fu: number | null,
  yakuman: number,
  context: CalculationContext,
  fixedLimit?: ScoreLimit,
): ScoreResult {
  let basePoints: number;
  let limitName: string;

  if (yakuman > 0) {
    basePoints = 8000 * yakuman;
    limitName = yakuman === 1 ? "役満" : `${yakuman}倍役満`;
  } else if (fixedLimit) {
    basePoints = SCORE_LIMIT_BASE_POINTS[fixedLimit];
    limitName = SCORE_LIMIT_LABELS[fixedLimit];
  } else {
    const safeFu = fu ?? 0;
    const rawBase = safeFu * 2 ** (han + 2);
    if (han >= 13) {
      basePoints = 8000;
      limitName = "数え役満";
    } else if (han >= 11) {
      basePoints = 6000;
      limitName = "三倍満";
    } else if (han >= 8) {
      basePoints = 4000;
      limitName = "倍満";
    } else if (han >= 6) {
      basePoints = 3000;
      limitName = "跳満";
    } else if (han >= 5 || (han === 4 && safeFu >= 40) || (han === 3 && safeFu >= 70)) {
      basePoints = 2000;
      limitName = "満貫";
    } else {
      basePoints = Math.min(rawBase, 2000);
      limitName = `${han}翻 ${safeFu}符`;
    }
  }

  const ronPoints = roundUp(basePoints * (context.isDealer ? 6 : 4), 100);
  const dealerPays = roundUp(basePoints * 2, 100);
  const otherPays = roundUp(basePoints, 100);
  const playerCount = getRuleConfig(context.rule).playerCount;
  const otherPlayerCount = context.isDealer ? playerCount - 1 : playerCount - 2;
  const tsumo = context.winMethod === "tsumo"
    ? { dealerPays, otherPays, otherPlayerCount, winnerIsDealer: context.isDealer }
    : null;
  const totalPoints = context.winMethod === "ron"
    ? ronPoints
    : context.isDealer
      ? dealerPays * (playerCount - 1)
      : dealerPays + otherPays * otherPlayerCount;

  return { limitName, basePoints, ronPoints, tsumo, totalPoints };
}

function compareEvaluations(left: EvaluatedCandidate, right: EvaluatedCandidate): number {
  const leftYakuman = left.yaku.reduce((sum, item) => sum + (item.yakuman ?? 0), 0);
  const rightYakuman = right.yaku.reduce((sum, item) => sum + (item.yakuman ?? 0), 0);
  if (leftYakuman !== rightYakuman) {
    return leftYakuman - rightYakuman;
  }
  return (left.score?.totalPoints ?? 0) - (right.score?.totalPoints ?? 0);
}

function evaluateCandidate(
  candidate: Candidate,
  counts: number[],
  context: CalculationContext,
  winningIndex: number | null,
  localYaku: YakuResult[],
): EvaluatedCandidate {
  const yaku = keepHighestLimitOnly([
    ...evaluateYaku(candidate, counts, context, winningIndex),
    ...localYaku,
  ]);
  const hasYakuman = yaku.some((item) => item.yakuman);
  const fixedLimit = yaku.find((item) => item.limit !== undefined)?.limit;
  const bonusHan = hasYakuman || fixedLimit ? 0 :
    Math.max(0, context.dora) + Math.max(0, context.uraDora) + Math.max(0, context.akaDora) +
    (getRuleConfig(context.rule).supportsKitaNuki ? Math.max(0, context.kitaNuki) : 0);
  const yakuHan = yaku.reduce((sum, item) => sum + item.han, 0);
  const han = yakuHan + bonusHan;
  const yakuman = yaku.reduce((sum, item) => sum + (item.yakuman ?? 0), 0);
  const fu = hasYakuman || fixedLimit ? null : calculateFu(candidate, yaku, context, winningIndex);
  const score = hasYakuman || fixedLimit || han > 0
    ? calculateScore(han, fu, yakuman, context, fixedLimit)
    : null;
  return { candidate, yaku, han, fu, bonusHan, score };
}

export function calculateHand(input: CalculationInput): CalculationResult {
  const melds = input.melds ?? [];
  const normalizedLocalYaku = normalizeManualYaku(input.localYaku ?? []);
  const normalizedMelds = normalizeMelds(melds);
  const allTiles = [...input.tiles, ...melds.flatMap((meld) => meld.tiles)];
  const { counts, errors } = countsFor(allTiles);
  const ruleConfig = RULE_OPTIONS.find((option) => option.id === input.context.rule);
  errors.push(...normalizedLocalYaku.errors);
  errors.push(...normalizedMelds.errors);

  if (!ruleConfig) {
    errors.push("ルール設定が不正です。");
  }
  if (ruleConfig?.usesReducedManzu && allTiles.some((tile) =>
    tile.suit === TileSuits.MAN && tile.value >= 2 && tile.value <= 8)) {
    errors.push("この三麻ルールでは二〜八萬を使用できません。");
  }
  if (!Number.isInteger(input.context.kitaNuki) || input.context.kitaNuki < 0 || input.context.kitaNuki > 4) {
    errors.push("北抜きの枚数は0〜4枚の整数で指定してください。");
  } else if (input.context.kitaNuki > 0 && !ruleConfig?.supportsKitaNuki) {
    errors.push("北抜きは三麻ルールでのみ指定できます。");
  }
  const kanCount = melds.filter((meld) => meld.kind === "kan").length;
  const expectedTileCount = 14 + kanCount;
  if (allTiles.length !== expectedTileCount) {
    errors.push(`和了形は${expectedTileCount}枚で入力してください（現在${allTiles.length}枚）。`);
  }
  if (melds.length > 4) {
    errors.push("面子の数が不正です。");
  }

  const winningTile = (input.tiles.length > 0 ? input.tiles[input.tiles.length - 1] : undefined) ?? (input.winningTileId
    ? allTiles.find((tile) => tile.id === input.winningTileId)
    : undefined);
  const winningIndex = winningTile ? tileIndex(winningTile) : null;
  const concealedCounts = countsFor(input.tiles).counts;
  const candidates = errors.length === 0
    ? createCandidates(concealedCounts, normalizedMelds.groups)
    : [];

  if (candidates.length === 0) {
    const fixedLimit = normalizedLocalYaku.yaku.find((item): item is YakuResult & { limit: ScoreLimit } => item.limit !== undefined);
    const hasManualYakuman = normalizedLocalYaku.yaku.some((item) => item.yakuman);
    if (fixedLimit && !hasManualYakuman) {
      return {
        valid: true,
        errors: [],
        shape: null,
        yaku: [fixedLimit],
        han: 0,
        fu: null,
        bonusHan: 0,
        kitaNuki: input.context.kitaNuki,
        score: calculateScore(0, null, 0, input.context, fixedLimit.limit),
      };
    }
    return {
      valid: false,
      errors: errors.length > 0 ? errors : ["手牌を4面子1雀頭、七対子、国士無双のいずれかに分解できません。"],
      shape: null,
      yaku: [],
      han: 0,
      fu: null,
      bonusHan: 0,
      kitaNuki: 0,
      score: null,
    };
  }

  const evaluated = candidates
    .map((candidate) => evaluateCandidate(candidate, counts, input.context, winningIndex, normalizedLocalYaku.yaku))
    .filter((candidate) => candidate.yaku.length > 0);
  if (evaluated.length === 0) {
    return {
      valid: false,
      errors: ["役がありません。立直・自摸・役牌などの役を付けてください。"],
      shape: null,
      yaku: [],
      han: 0,
      fu: null,
      bonusHan: 0,
      kitaNuki: 0,
      score: null,
    };
  }

  const best = evaluated.reduce((left, right) =>
    compareEvaluations(left, right) >= 0 ? left : right);
  return {
    valid: true,
    errors: [],
    shape: best.candidate.shape,
    yaku: best.yaku,
    han: best.han,
    fu: best.fu,
    bonusHan: best.bonusHan,
    kitaNuki: input.context.kitaNuki,
    score: best.score,
  };
}
