import assert from "node:assert/strict";
import { calculateHand } from "../core/calculator.ts";
import { tiles } from "../core/tiles.ts";

const tileById = new Map(tiles.map((tile) => [tile.id, tile]));
const context = (overrides = {}) => ({
  rule: "jantama-4",
  winMethod: "ron",
  isDealer: false,
  seatWind: "東",
  roundWind: "東",
  riichi: false,
  doubleRiichi: false,
  ippatsu: false,
  haitei: false,
  houtei: false,
  rinshan: false,
  chankan: false,
  tenhou: false,
  chiihou: false,
  kitaNuki: 0,
  dora: 0,
  uraDora: 0,
  akaDora: 0,
  ...overrides,
});
const hand = (ids) => ids.map((id) => tileById.get(id));
const calculate = (ids, winningTileId, overrides = {}, localYaku = []) => calculateHand({
  tiles: hand(ids),
  localYaku,
  winningTileId,
  context: context(overrides),
});
const meld = (kind, ids, open = true) => ({ kind, tiles: hand(ids), open });
const calculateMelded = (ids, melds, overrides = {}) => calculateHand({
  tiles: hand(ids),
  melds,
  context: context(overrides),
});

const pinfu = calculate([
  "man-2", "man-3", "man-4", "man-3", "man-5",
  "pin-2", "pin-3", "pin-4", "sou-6", "sou-7", "sou-8", "pin-5", "pin-5", "man-4",
], "man-4", { riichi: true });
assert.equal(pinfu.valid, true);
assert.deepEqual(pinfu.yaku.map((item) => item.name), ["立直", "断么九", "平和"]);
assert.equal(pinfu.han, 3);
assert.equal(pinfu.fu, 30);
assert.equal(pinfu.score?.ronPoints, 3900);

const manualLocalYaku = calculate([
  "man-2", "man-3", "man-4", "man-3", "man-5",
  "pin-2", "pin-3", "pin-4", "sou-6", "sou-7", "sou-8", "pin-5", "pin-5", "man-4",
], "man-4", {}, [{ id: "local-test", name: "ローカル一翻", han: 1 }]);
assert.equal(manualLocalYaku.valid, true);
assert.equal(manualLocalYaku.yaku.some((item) => item.name === "ローカル一翻"), true);
assert.equal(manualLocalYaku.han, 3);

const manualLocalYakuman = calculate([
  "man-2", "man-3", "man-4", "man-3", "man-5",
  "pin-2", "pin-3", "pin-4", "sou-6", "sou-7", "sou-8", "pin-5", "pin-5", "man-4",
], "man-4", { riichi: true }, [{ id: "local-yakuman", name: "ローカル役満", han: 0, yakuman: 1 }]);
assert.deepEqual(manualLocalYakuman.yaku.map((item) => item.name), ["ローカル役満"]);
assert.equal(manualLocalYakuman.score?.limitName, "役満");

const pinfuTsumoSanma = calculate([
  "pin-2", "pin-3", "pin-4", "pin-3", "pin-5",
  "sou-2", "sou-3", "sou-4", "sou-6", "sou-7", "sou-8", "sou-5", "sou-5", "pin-4",
], "pin-4", { rule: "standard-3", winMethod: "tsumo", riichi: true });
assert.equal(pinfuTsumoSanma.valid, true);
assert.equal(pinfuTsumoSanma.score?.tsumo?.otherPlayerCount, 1);
assert.equal(pinfuTsumoSanma.score?.tsumo?.winnerIsDealer, false);

const kitaNukiSanma = calculate([
  "pin-2", "pin-3", "pin-4", "pin-3", "pin-5",
  "sou-2", "sou-3", "sou-4", "sou-6", "sou-7", "sou-8", "sou-5", "sou-5", "pin-4",
], "pin-4", { rule: "jantama-3", riichi: true, kitaNuki: 2 });
assert.equal(kitaNukiSanma.valid, true);
assert.equal(kitaNukiSanma.kitaNuki, 2);
assert.equal(kitaNukiSanma.bonusHan, 2);
assert.equal(kitaNukiSanma.han, 5);

const kitaNukiFourMahjong = calculate([
  "man-2", "man-3", "man-4", "man-3", "man-5",
  "pin-2", "pin-3", "pin-4", "sou-6", "sou-7", "sou-8", "pin-5", "pin-5", "man-4",
], "man-4", { kitaNuki: 1 });
assert.equal(kitaNukiFourMahjong.valid, false);
assert.match(kitaNukiFourMahjong.errors[0], /北抜きは三麻/);

const invalidSanmaMiddleManzu = calculate([
  "man-2", "man-3", "man-4", "man-3", "man-5",
  "pin-2", "pin-3", "pin-4", "sou-6", "sou-7", "sou-8", "pin-5", "pin-5", "man-4",
], "man-4", { rule: "jantama-3" });
assert.equal(invalidSanmaMiddleManzu.valid, false);
assert.match(invalidSanmaMiddleManzu.errors[0], /二〜八萬/);

const tenhou = calculate([
  "man-2", "man-3", "man-4", "man-3", "man-5",
  "pin-2", "pin-3", "pin-4", "sou-6", "sou-7", "sou-8", "pin-5", "pin-5", "man-4",
], "man-4", { winMethod: "tsumo", isDealer: true, tenhou: true });
assert.deepEqual(tenhou.yaku.map((item) => item.name), ["天和"]);
assert.equal(tenhou.score?.limitName, "役満");

const chiihou = calculate([
  "man-2", "man-3", "man-4", "man-3", "man-5",
  "pin-2", "pin-3", "pin-4", "sou-6", "sou-7", "sou-8", "pin-5", "pin-5", "man-4",
], "man-4", { winMethod: "tsumo", chiihou: true });
assert.deepEqual(chiihou.yaku.map((item) => item.name), ["地和"]);

const chiitoitsu = calculate([
  "man-1", "man-1", "man-2", "man-2", "man-3", "man-3",
  "pin-4", "pin-4", "pin-5", "pin-5", "sou-6", "sou-6", "sou-7", "sou-7",
], "sou-7", { riichi: true });
assert.equal(chiitoitsu.valid, true);
assert.equal(chiitoitsu.shape, "chiitoitsu");
assert.equal(chiitoitsu.fu, 25);
assert.equal(chiitoitsu.score?.ronPoints, 3200);

const chiitoitsuHonitsu = calculate([
  "man-1", "man-1", "man-2", "man-2", "man-3", "man-3", "east",
  "east", "south", "south", "white", "white", "red", "red",
], "red");
assert.deepEqual(chiitoitsuHonitsu.yaku.map((item) => item.name), ["七対子", "混一色"]);

const ryanpeikou = calculate([
  "man-1", "man-2", "man-3", "man-1", "man-2", "man-3", "pin-4",
  "pin-5", "pin-6", "pin-4", "pin-5", "pin-6", "sou-9", "sou-9",
], "sou-9");
assert.equal(ryanpeikou.yaku.some((item) => item.name === "二盃口"), true);

const junchan = calculate([
  "man-1", "man-2", "man-3", "man-7", "man-8", "man-9", "pin-1",
  "pin-2", "pin-3", "pin-7", "pin-8", "pin-9", "sou-1", "sou-1",
], "sou-1");
assert.equal(junchan.yaku.some((item) => item.name === "純全帯么九"), true);

const sanshoku = calculate([
  "man-1", "man-2", "man-3", "pin-1", "pin-2", "pin-3", "sou-1",
  "sou-2", "sou-3", "man-7", "man-8", "man-9", "pin-5", "pin-5",
], "pin-5");
assert.equal(sanshoku.yaku.some((item) => item.name === "三色同順"), true);

const sanshokuDoukou = calculate([
  "man-2", "man-2", "man-5", "man-5", "pin-5", "pin-5", "pin-5",
  "sou-5", "sou-5", "sou-5", "east", "east", "east", "man-5",
], "man-5");
assert.equal(sanshokuDoukou.yaku.some((item) => item.name === "三色同刻"), true);

const ittsu = calculate([
  "man-1", "man-2", "man-3", "man-4", "man-5", "man-6", "man-7",
  "man-8", "man-9", "pin-2", "pin-3", "pin-4", "sou-5", "sou-5",
], "sou-5");
assert.equal(ittsu.yaku.some((item) => item.name === "一気通貫"), true);

const shousangen = calculate([
  "white", "white", "white", "green", "green", "green", "red", "red",
  "man-1", "man-2", "man-3", "pin-7", "pin-8", "pin-9",
], "red");
assert.equal(shousangen.yaku.some((item) => item.name === "小三元"), true);

const kokushi = calculate([
  "man-1", "man-1", "man-9", "pin-1", "pin-9", "sou-1", "sou-9",
  "east", "south", "west", "north", "white", "green", "red",
], "man-1");
assert.equal(kokushi.valid, true);
assert.equal(kokushi.shape, "kokushi");
assert.equal(kokushi.yaku[0]?.yakuman, 1);
assert.equal(kokushi.score?.ronPoints, 32000);

const junseiChuuren = calculate([
  "man-1", "man-1", "man-1", "man-2", "man-3", "man-4", "man-5",
  "man-6", "man-7", "man-8", "man-9", "man-9", "man-9", "man-5",
], "man-5", { winMethod: "tsumo" });
assert.equal(junseiChuuren.valid, true);
assert.equal(junseiChuuren.yaku[0]?.name, "純正九蓮宝燈");
assert.equal(junseiChuuren.yaku[0]?.yakuman, 2);

const lastTileIsWinningTile = calculate([
  "man-1", "man-1", "man-1", "man-2", "man-2", "man-4", "man-5",
  "man-6", "man-7", "man-8", "man-9", "man-9", "man-9", "man-3",
], "man-5", { winMethod: "tsumo" });
assert.equal(lastTileIsWinningTile.yaku[0]?.name, "九蓮宝燈");

const suuankouTsumo = calculate([
  "man-1", "man-1", "man-1", "man-2", "man-2", "man-2", "man-3",
  "man-3", "man-3", "east", "east", "east", "man-5", "man-5",
], "man-5", { winMethod: "tsumo" });
assert.equal(suuankouTsumo.valid, true);
assert.equal(suuankouTsumo.yaku[0]?.name, "四暗刻");
assert.equal(suuankouTsumo.bonusHan, 0);
assert.equal(suuankouTsumo.yaku.some((item) => item.name === "門前清自摸和"), false);

const tsuuiisou = calculate([
  "east", "east", "east", "south", "south", "south", "west",
  "west", "west", "white", "white", "white", "red", "red",
], "red", { winMethod: "tsumo" });
assert.equal(tsuuiisou.valid, true);
assert.equal(tsuuiisou.yaku[0]?.name, "字一色");

const compositeYakuman = calculate([
  "white", "white", "white", "green", "green", "green", "red",
  "red", "red", "east", "east", "east", "north", "north",
], "north", { winMethod: "tsumo" });
assert.equal(compositeYakuman.valid, true);
assert.deepEqual(compositeYakuman.yaku.map((item) => item.name), ["大三元", "字一色", "四暗刻"]);
assert.equal(compositeYakuman.score?.limitName, "4倍役満");

const openChanta = calculateMelded([
  "pin-7", "pin-8", "pin-9", "sou-1", "sou-2", "sou-3",
  "sou-9", "sou-9", "sou-9", "east", "east",
], [meld("sequence", ["man-1", "man-2", "man-3"])], { winMethod: "ron" });
assert.equal(openChanta.valid, true);
assert.equal(openChanta.yaku.some((item) => item.name === "混全帯么九"), true);

const threeKan = calculateMelded([
  "man-5", "man-5", "man-5", "pin-5", "pin-5",
], [
  meld("kan", ["east", "east", "east", "east"]),
  meld("kan", ["white", "white", "white", "white"]),
  meld("kan", ["red", "red", "red", "red"]),
]);
assert.equal(threeKan.valid, true);
assert.equal(threeKan.yaku.some((item) => item.name === "三槓子"), true);

const fourKan = calculateMelded(
  ["man-5", "man-5"],
  [
    meld("kan", ["east", "east", "east", "east"]),
    meld("kan", ["south", "south", "south", "south"]),
    meld("kan", ["white", "white", "white", "white"]),
    meld("kan", ["red", "red", "red", "red"]),
  ],
);
assert.equal(fourKan.valid, true);
assert.deepEqual(fourKan.yaku.map((item) => item.name), ["四槓子"]);

const kokushiThirteenWait = calculate([
  "man-1", "man-9", "pin-1", "pin-9", "sou-1", "sou-9",
  "east", "south", "west", "north", "white", "green", "red", "man-1",
], "man-1", { winMethod: "tsumo" });
assert.equal(kokushiThirteenWait.valid, true);
assert.equal(kokushiThirteenWait.yaku[0]?.name, "国士無双十三面待ち");
assert.equal(kokushiThirteenWait.yaku[0]?.yakuman, 2);

const invalid = calculate(["man-1", "man-1", "man-1", "man-1", "man-1"]);
assert.equal(invalid.valid, false);
assert.match(invalid.errors[0], /4枚を超えています/);

console.log("Core smoke tests passed: standard, sanma, local yaku, yakuman, melds, validation");
