import { RuleMode } from "./rules.ts";

export interface YakuDefinition {
  aliases?: string[];
  category: "通常役" | "役満" | "加算要素";
  closedHan?: number;
  condition?: string;
  exampleTiles?: readonly string[];
  id: string;
  name: string;
  note?: string;
  openHan?: number;
  yakuman?: number;
}

export interface LocalYakuDefinition {
  category: "通常役" | "役満";
  condition: string;
  exampleTiles?: readonly string[];
  han: number;
  id: string;
  name: string;
  rules: readonly RuleMode[];
  yakuman?: number;
}

const YAKU_CATALOG_BASE: readonly YakuDefinition[] = [
  { id: "riichi", name: "立直", category: "通常役", closedHan: 1 },
  { id: "double-riichi", name: "ダブル立直", category: "通常役", closedHan: 2 },
  { id: "ippatsu", name: "一発", category: "通常役", closedHan: 1 },
  { id: "menzen-tsumo", name: "門前清自摸和", category: "通常役", closedHan: 1 },
  { id: "haitei", name: "海底摸月", category: "通常役", closedHan: 1 },
  { id: "houtei", name: "河底撈魚", category: "通常役", closedHan: 1, openHan: 1 },
  { id: "rinshan", name: "嶺上開花", category: "通常役", closedHan: 1, openHan: 1 },
  { id: "chankan", name: "搶槓", category: "通常役", closedHan: 1, openHan: 1 },
  { id: "tanyao", name: "断么九", category: "通常役", closedHan: 1, openHan: 1 },
  { id: "yakuhai", name: "役牌", category: "通常役", closedHan: 1, openHan: 1, note: "白・發・中、自風・場風ごとに加算" },
  { id: "pinfu", name: "平和", category: "通常役", closedHan: 1 },
  { id: "iipeikou", name: "一盃口", category: "通常役", closedHan: 1 },
  { id: "ryanpeikou", name: "二盃口", category: "通常役", closedHan: 3 },
  { id: "chanta", name: "混全帯么九", category: "通常役", closedHan: 2, openHan: 1 },
  { id: "junchan", name: "純全帯么九", category: "通常役", closedHan: 3, openHan: 2 },
  { id: "honroutou", name: "混老頭", category: "通常役", closedHan: 2, openHan: 2 },
  { id: "honitsu", name: "混一色", category: "通常役", closedHan: 3, openHan: 2 },
  { id: "chinitsu", name: "清一色", category: "通常役", closedHan: 6, openHan: 5 },
  { id: "toitoi", name: "対々和", category: "通常役", closedHan: 2, openHan: 2 },
  { id: "sanankou", name: "三暗刻", category: "通常役", closedHan: 2, openHan: 2 },
  { id: "sankantsu", name: "三槓子", category: "通常役", closedHan: 2, openHan: 2 },
  { id: "sanshoku", name: "三色同順", category: "通常役", closedHan: 2, openHan: 1, note: "三麻では萬子の中張牌を使えないため原則成立しません。" },
  { id: "sanshoku-doukou", name: "三色同刻", category: "通常役", closedHan: 2, openHan: 2 },
  { id: "ittsu", name: "一気通貫", category: "通常役", closedHan: 2, openHan: 1 },
  { id: "shousangen", name: "小三元", category: "通常役", closedHan: 2, openHan: 2 },
  { id: "chiitoitsu", name: "七対子", category: "通常役", closedHan: 2 },
  { id: "tenhou", name: "天和", category: "役満", yakuman: 1 },
  { id: "chiihou", name: "地和", category: "役満", yakuman: 1 },
  { id: "kokushi", name: "国士無双", category: "役満", yakuman: 1 },
  { id: "kokushi-thirteen-wait", name: "国士無双十三面待ち", category: "役満", yakuman: 2 },
  { id: "suuankou", name: "四暗刻", category: "役満", yakuman: 1, note: "単騎待ちの和了は倍役満" },
  { id: "shousuushi", name: "小四喜", category: "役満", yakuman: 1 },
  { id: "daisuushi", name: "大四喜", category: "役満", yakuman: 2 },
  { id: "daisangen", name: "大三元", category: "役満", yakuman: 1 },
  { id: "tsuuiisou", name: "字一色", category: "役満", yakuman: 1 },
  { id: "chinroutou", name: "清老頭", category: "役満", yakuman: 1 },
  { id: "ryuuiisou", name: "緑一色", category: "役満", yakuman: 1 },
  { id: "chuuren", name: "九蓮宝燈", category: "役満", yakuman: 1 },
  { id: "junsei-chuuren", name: "純正九蓮宝燈", category: "役満", yakuman: 2 },
  { id: "suukantsu", name: "四槓子", category: "役満", yakuman: 1 },
  { id: "kita-nuki", name: "北抜き（抜きドラ）", category: "加算要素", note: "三麻のみ。抜いた北1枚につき1翻" },
  { id: "dora", name: "ドラ・裏ドラ・赤ドラ", category: "加算要素", note: "成立役ではなく翻だけを加算" },
];

const YAKU_CONDITIONS: Record<string, string> = {
  riichi: "門前で聴牌し、立直を宣言して1000点を供託する。",
  "double-riichi": "第一巡で立直を宣言する（途中で副露や鳴きがないこと）。",
  ippatsu: "立直後、次の自分のツモ番までに鳴きがなく和了する。",
  "menzen-tsumo": "門前のまま自分のツモで和了する。",
  haitei: "最後の山牌をツモって和了する。",
  houtei: "最後のツモの直後に切られた牌でロン和了する。",
  rinshan: "槓をした後の嶺上牌で和了する。",
  chankan: "他家の加槓で補充される前の牌をロンする。",
  tanyao: "面子と雀頭のすべてを2〜8の数牌だけで構成する。",
  yakuhai: "三元牌、自風、場風の刻子または槓子を含める。該当する役牌ごとに1翻。",
  pinfu: "門前で、順子4組・役牌でない雀頭・両面待ちをそろえる。",
  iipeikou: "門前で、同じ順子を2組そろえる。",
  ryanpeikou: "門前で、同じ順子2組を2種類そろえる。",
  chanta: "すべての面子と雀頭に、数牌の1・9または字牌を含め、字牌も使う。",
  junchan: "すべての面子と雀頭に数牌の1または9を含め、字牌は使わない。",
  honroutou: "面子と雀頭を1・9の数牌と字牌だけで構成する。",
  honitsu: "一種類の数牌と字牌だけで構成する。",
  chinitsu: "一種類の数牌だけで構成し、字牌を使わない。",
  toitoi: "面子4組をすべて刻子または槓子で構成する。",
  sanankou: "暗刻または暗槓を3組そろえる。",
  sankantsu: "槓子を3組そろえる。",
  sanshoku: "同じ数字の順子を萬子・筒子・索子で1組ずつそろえる。",
  "sanshoku-doukou": "同じ数字の刻子または槓子を萬子・筒子・索子で1組ずつそろえる。",
  ittsu: "同じ種類で123・456・789の順子をそろえる。",
  shousangen: "三元牌の刻子または槓子を2組と、残り1種類の雀頭をそろえる。",
  chiitoitsu: "同じ牌2枚の対子を7組そろえる。4枚使いの重複対子は不可。",
  tenhou: "親が配牌時点の第一ツモで和了する。",
  chiihou: "子が第一ツモまでに他家の鳴きやロンがなく和了する。",
  kokushi: "13種類の么九牌（1・9・字牌）をすべて1枚ずつと、いずれか1枚の重複をそろえる。",
  "kokushi-thirteen-wait": "国士無双の13種類を1枚ずつ持ち、13種類すべてが待ちになる形で和了する。",
  suuankou: "暗刻または暗槓を4組そろえる。単騎待ちの和了は倍役満。",
  shousuushi: "風牌4種類のうち3種類を刻子または槓子、残り1種類を雀頭にする。",
  daisuushi: "東・南・西・北の風牌4種類をすべて刻子または槓子にする。",
  daisangen: "白・發・中の三元牌をすべて刻子または槓子にする。",
  tsuuiisou: "手牌のすべてを字牌（東南西北白發中）で構成する。",
  chinroutou: "手牌のすべてを数牌の1・9で構成する。",
  ryuuiisou: "索子の2・3・4・6・8と發だけで構成する。",
  chuuren: "門前の清一色で、同一種類の1112345678999を含み、1枚を加えて和了する。",
  "junsei-chuuren": "1112345678999をそのまま待ち、9面待ちの純正九蓮宝燈で和了する。",
  suukantsu: "槓子を4組そろえる。",
  "kita-nuki": "三麻で北を手牌から抜いて公開し、1枚につき1翻を加算する。抜いた後は補充牌を引く。",
  dora: "ドラ表示牌に対応する牌、裏ドラ、赤ドラを持つ。役ではなく翻のみを加算する。",
};

const YAKU_EXAMPLES: Record<string, readonly string[]> = {
  tanyao: ["man-2", "man-3", "man-4"],
  yakuhai: ["white", "white", "white"],
  pinfu: ["man-2", "man-3", "man-4", "man-3", "man-4", "man-5", "east", "east"],
  iipeikou: ["man-2", "man-3", "man-4", "man-2", "man-3", "man-4"],
  ryanpeikou: ["man-2", "man-3", "man-4", "man-2", "man-3", "man-4", "pin-6", "pin-7", "pin-8", "pin-6", "pin-7", "pin-8"],
  chanta: ["man-1", "man-2", "man-3", "pin-7", "pin-8", "pin-9", "east", "east", "east"],
  junchan: ["man-1", "man-2", "man-3", "pin-7", "pin-8", "pin-9", "sou-1", "sou-1", "sou-1"],
  honroutou: ["man-1", "man-1", "man-1", "pin-9", "pin-9", "pin-9", "east", "east", "east"],
  honitsu: ["man-1", "man-2", "man-3", "man-7", "man-8", "man-9", "east", "east", "east"],
  chinitsu: ["man-1", "man-2", "man-3", "man-7", "man-8", "man-9"],
  toitoi: ["man-2", "man-2", "man-2", "pin-5", "pin-5", "pin-5", "sou-8", "sou-8", "sou-8"],
  sanankou: ["man-2", "man-2", "man-2", "pin-5", "pin-5", "pin-5", "sou-8", "sou-8", "sou-8"],
  sankantsu: ["man-1", "man-1", "man-1", "man-1", "pin-5", "pin-5", "pin-5", "pin-5", "sou-9", "sou-9", "sou-9", "sou-9"],
  sanshoku: ["man-2", "man-3", "man-4", "pin-2", "pin-3", "pin-4", "sou-2", "sou-3", "sou-4"],
  "sanshoku-doukou": ["man-5", "man-5", "man-5", "pin-5", "pin-5", "pin-5", "sou-5", "sou-5", "sou-5"],
  ittsu: ["man-1", "man-2", "man-3", "man-4", "man-5", "man-6", "man-7", "man-8", "man-9"],
  shousangen: ["white", "white", "white", "green", "green", "green", "red", "red"],
  chiitoitsu: ["man-1", "man-1", "man-2", "man-2", "pin-3", "pin-3", "sou-4", "sou-4"],
  kokushi: ["man-1", "man-9", "pin-1", "pin-9", "sou-1", "sou-9", "east", "south", "west", "north", "white", "green", "red"],
  "kokushi-thirteen-wait": ["man-1", "man-9", "pin-1", "pin-9", "sou-1", "sou-9", "east", "south", "west", "north", "white", "green", "red"],
  suuankou: ["man-2", "man-2", "man-2", "pin-5", "pin-5", "pin-5", "sou-8", "sou-8", "sou-8", "east", "east", "east"],
  shousuushi: ["east", "east", "east", "south", "south", "south", "west", "west", "west", "north", "north"],
  daisuushi: ["east", "east", "east", "south", "south", "south", "west", "west", "west", "north", "north", "north"],
  daisangen: ["white", "white", "white", "green", "green", "green", "red", "red", "red"],
  tsuuiisou: ["east", "east", "east", "south", "south", "south", "white", "white", "white"],
  chinroutou: ["man-1", "man-1", "man-1", "pin-9", "pin-9", "pin-9", "sou-1", "sou-1", "sou-1"],
  ryuuiisou: ["sou-2", "sou-3", "sou-4", "sou-6", "sou-8", "green"],
  chuuren: ["man-1", "man-1", "man-1", "man-2", "man-3", "man-4", "man-5", "man-6", "man-7", "man-8", "man-9", "man-9", "man-9"],
  "junsei-chuuren": ["man-1", "man-1", "man-1", "man-2", "man-3", "man-4", "man-5", "man-6", "man-7", "man-8", "man-9", "man-9", "man-9"],
  suukantsu: ["man-1", "man-1", "man-1", "man-1", "pin-5", "pin-5", "pin-5", "pin-5", "sou-9", "sou-9", "sou-9", "sou-9"],
  "kita-nuki": ["north"],
};

export const YAKU_CATALOG: readonly YakuDefinition[] = YAKU_CATALOG_BASE.map((yaku) => ({
  ...yaku,
  condition: YAKU_CONDITIONS[yaku.id] ?? "採用ルールと手牌の形に応じて成立を確認する。",
  exampleTiles: YAKU_EXAMPLES[yaku.id],
}));

export function isYakuAvailable(rule: RuleMode, yaku: YakuDefinition): boolean {
  if (yaku.id === "kita-nuki") {
    return rule === RuleMode.JANTAMA_3 || rule === RuleMode.STANDARD_3;
  }
  if (yaku.id === "sanshoku" && (rule === RuleMode.JANTAMA_3 || rule === RuleMode.STANDARD_3)) {
    return false;
  }
  return true;
}
