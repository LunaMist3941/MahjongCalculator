import { useState } from "react";
import { calculateHand } from "@core/calculator";
import { getRuleConfig, RuleMode } from "@core/rules";
import type { LocalYakuDefinition } from "@core/yaku";
import {
  WinMethods,
  Winds,
  type CalculationContext,
  type CalculationResult,
  type MeldInput,
  type MeldKind,
  type Tile,
  type Wind,
} from "@core/types";
import CalculationResultPanel from "../components/CalculationResultPanel";
import HandDisplay from "../components/HandDisplay";
import MeldPanel from "../components/MeldPanel";
import RuleSelector from "../components/RuleSelector";
import TileSelector from "../components/TileSelector";

const initialContext: CalculationContext = {
  rule: RuleMode.JANTAMA_4,
  winMethod: WinMethods.RON,
  isDealer: false,
  seatWind: Winds.EAST,
  roundWind: Winds.EAST,
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
};

const windOptions = Object.values(Winds) as Wind[];
type InputTarget = "hand" | "meld";

const requiredMeldTileCount = (kind: MeldKind) => kind === "kan" ? 4 : 3;

interface CalculatorPageProps {
  localYaku: LocalYakuDefinition[];
  onOpenHelp: () => void;
  onOpenYaku: () => void;
}

function CalculatorPage({ localYaku, onOpenHelp, onOpenYaku }: CalculatorPageProps) {
  const [context, setContext] = useState<CalculationContext>(initialContext);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [melds, setMelds] = useState<MeldInput[]>([]);
  const [draftMeldTiles, setDraftMeldTiles] = useState<Tile[]>([]);
  const [draftMeldKind, setDraftMeldKind] = useState<MeldKind>("sequence");
  const [draftMeldOpen, setDraftMeldOpen] = useState(true);
  const [inputTarget, setInputTarget] = useState<InputTarget>("hand");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [selectedLocalYakuIds, setSelectedLocalYakuIds] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const concealedLimit = 14 - melds.length * 3;
  const draftMeldLimit = requiredMeldTileCount(draftMeldKind);
  const currentRule = getRuleConfig(context.rule);
  const applicableLocalYaku = localYaku.filter((yaku) => yaku.rules.includes(context.rule));
  const allSelectedTiles = [
    ...tiles,
    ...melds.flatMap((meld) => meld.tiles),
    ...draftMeldTiles,
  ];
  const isHandComplete = tiles.length === concealedLimit && draftMeldTiles.length === 0;
  const winningIndex = isHandComplete && tiles.length > 0 ? tiles.length - 1 : null;

  const updateContext = <Key extends keyof CalculationContext>(
    key: Key,
    value: CalculationContext[Key],
  ) => {
    setContext((current) => ({ ...current, [key]: value }));
  };

  const addTile = (tile: Tile) => {
    if (allSelectedTiles.filter((item) => item.id === tile.id).length >= 4) {
      return;
    }
    if (inputTarget === "hand") {
      if (tiles.length >= concealedLimit) return;
      setTiles((current) => [...current, tile]);
    } else {
      if (draftMeldTiles.length >= draftMeldLimit) return;
      setDraftMeldTiles((current) => [...current, tile]);
    }
    setResult(null);
  };

  const removeTile = (index: number) => {
    setTiles((current) => current.filter((_, tileIndex) => tileIndex !== index));
    setResult(null);
  };

  const removeMeld = (index: number) => {
    setMelds((current) => current.filter((_, meldIndex) => meldIndex !== index));
    setResult(null);
  };

  const changeInputTarget = (target: InputTarget) => {
    if (target === "hand") {
      setDraftMeldTiles([]);
    }
    setInputTarget(target);
  };

  const changeDraftKind = (kind: MeldKind) => {
    setDraftMeldKind(kind);
    setDraftMeldTiles([]);
  };

  const changeRule = (rule: RuleMode) => {
    setContext((current) => ({
      ...current,
      rule,
      kitaNuki: getRuleConfig(rule).supportsKitaNuki ? current.kitaNuki : 0,
    }));
    setResult(null);
  };

  const cancelDraft = () => {
    setDraftMeldTiles([]);
    setInputTarget("hand");
  };

  const commitDraft = () => {
    if (draftMeldTiles.length !== draftMeldLimit || melds.length >= 4) return;
    setMelds((current) => [...current, {
      kind: draftMeldKind,
      tiles: draftMeldTiles,
      open: draftMeldOpen,
    }]);
    setDraftMeldTiles([]);
    setInputTarget("hand");
    setResult(null);
  };

  const calculate = () => {
    const winningTile = isHandComplete && tiles.length > 0 ? tiles[tiles.length - 1] : undefined;
    setResult(calculateHand({
      tiles,
      melds,
      localYaku: applicableLocalYaku
        .filter((yaku) => selectedLocalYakuIds.includes(yaku.id))
        .map(({ exclusive, han, id, limit, name, yakuman }) => ({ exclusive, han, id, limit, name, yakuman })),
      winningTileId: winningTile?.id,
      context,
    }));
  };

  const reset = () => {
    setTiles([]);
    setMelds([]);
    setDraftMeldTiles([]);
    setInputTarget("hand");
    setResult(null);
    setSelectedLocalYakuIds([]);
    setSettingsOpen(false);
    setContext(initialContext);
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">RIICHI TOOL</p>
          <h1>麻雀点数計算</h1>
          <p className="subtitle">手牌を選ぶだけで、成立役・翻符・支払い点を確認できます。</p>
        </div>
        <div className="header-actions">
          <button className="help-button" onClick={onOpenHelp} type="button">ヘルプ</button>
          <button className="yaku-button" onClick={onOpenYaku} type="button">役一覧</button>
          <button className="ghost-button" onClick={reset} type="button">リセット</button>
        </div>
      </header>

      <section className={`panel settings-panel ${settingsOpen ? "is-open" : ""}`} aria-label="計算条件">
        <button
          aria-expanded={settingsOpen}
          className="settings-toggle"
          onClick={() => setSettingsOpen((current) => !current)}
          type="button"
        >
          <span>計算条件</span>
          <span>{settingsOpen ? "閉じる" : "設定を開く"}</span>
        </button>
        <div className="settings-fields">
        <RuleSelector
          onChange={changeRule}
          value={context.rule}
        />
        <label className="field">
          <span>和了方法</span>
          <select
            onChange={(event) => updateContext("winMethod", event.target.value as CalculationContext["winMethod"])}
            value={context.winMethod}
          >
            <option value={WinMethods.RON}>ロン</option>
            <option value={WinMethods.TSUMO}>ツモ</option>
          </select>
        </label>
        <label className="field">
          <span>自風</span>
          <select onChange={(event) => updateContext("seatWind", event.target.value as Wind)} value={context.seatWind}>
            {windOptions.map((wind) => <option key={wind} value={wind}>{wind}</option>)}
          </select>
        </label>
        <label className="field">
          <span>場風</span>
          <select onChange={(event) => updateContext("roundWind", event.target.value as Wind)} value={context.roundWind}>
            {windOptions.map((wind) => <option key={wind} value={wind}>{wind}</option>)}
          </select>
        </label>
        <label className="check-field"><input checked={context.isDealer} onChange={(event) => updateContext("isDealer", event.target.checked)} type="checkbox" /> 親</label>
        <label className="check-field"><input checked={context.riichi} onChange={(event) => updateContext("riichi", event.target.checked)} type="checkbox" /> 立直</label>
        <label className="check-field"><input checked={context.doubleRiichi} onChange={(event) => updateContext("doubleRiichi", event.target.checked)} type="checkbox" /> ダブル立直</label>
        <label className="check-field"><input checked={context.ippatsu} onChange={(event) => updateContext("ippatsu", event.target.checked)} type="checkbox" /> 一発</label>
        <label className="check-field"><input checked={context.haitei} onChange={(event) => updateContext("haitei", event.target.checked)} type="checkbox" /> 海底</label>
        <label className="check-field"><input checked={context.houtei} onChange={(event) => updateContext("houtei", event.target.checked)} type="checkbox" /> 河底</label>
        <label className="check-field"><input checked={context.rinshan} onChange={(event) => updateContext("rinshan", event.target.checked)} type="checkbox" /> 嶺上</label>
        <label className="check-field"><input checked={context.chankan} onChange={(event) => updateContext("chankan", event.target.checked)} type="checkbox" /> 搶槓</label>
        <label className="check-field"><input checked={context.tenhou} onChange={(event) => updateContext("tenhou", event.target.checked)} type="checkbox" /> 天和</label>
        <label className="check-field"><input checked={context.chiihou} onChange={(event) => updateContext("chiihou", event.target.checked)} type="checkbox" /> 地和</label>
        {currentRule.supportsKitaNuki && (
          <label className="field compact-field">
            <span>北抜き（枚）</span>
            <input min="0" max="4" onChange={(event) => updateContext("kitaNuki", Number(event.target.value))} type="number" value={context.kitaNuki} />
            <span className="field-note">1枚＝1翻・採用卓のみ</span>
          </label>
        )}
        {applicableLocalYaku.length > 0 && (
          <fieldset className="local-yaku-fields">
            <legend>ローカル役（手動選択）</legend>
            {applicableLocalYaku.map((yaku) => (
              <label className="check-field" key={yaku.id}>
                <input
                  checked={selectedLocalYakuIds.includes(yaku.id)}
                  onChange={(event) => setSelectedLocalYakuIds((current) => event.target.checked
                    ? [...current, yaku.id]
                    : current.filter((id) => id !== yaku.id))}
                  type="checkbox"
                />
                {yaku.name}
              </label>
            ))}
          </fieldset>
        )}
        <label className="field compact-field"><span>ドラ</span><input min="0" max="20" onChange={(event) => updateContext("dora", Number(event.target.value))} type="number" value={context.dora} /></label>
        <label className="field compact-field"><span>裏ドラ</span><input min="0" max="20" onChange={(event) => updateContext("uraDora", Number(event.target.value))} type="number" value={context.uraDora} /></label>
        <label className="field compact-field"><span>赤ドラ</span><input min="0" max="3" onChange={(event) => updateContext("akaDora", Number(event.target.value))} type="number" value={context.akaDora} /></label>
        </div>
      </section>

      <div className="content-grid">
        <div className="input-column">
          <HandDisplay
            onRemove={removeTile}
            tiles={tiles}
            winningIndex={winningIndex}
          />
          <MeldPanel
            draftKind={draftMeldKind}
            draftOpen={draftMeldOpen}
            draftTiles={draftMeldTiles}
            inputTarget={inputTarget}
            melds={melds}
            onCancelDraft={cancelDraft}
            onCommitDraft={commitDraft}
            onDraftKindChange={changeDraftKind}
            onDraftOpenChange={setDraftMeldOpen}
            onInputTargetChange={changeInputTarget}
            onRemoveMeld={removeMeld}
          />
          <TileSelector
            concealedCount={tiles.length}
            concealedLimit={concealedLimit}
            draftCount={draftMeldTiles.length}
            draftLimit={draftMeldLimit}
            inputTarget={inputTarget}
            onSelect={addTile}
            rule={context.rule}
            selected={allSelectedTiles}
          />
          <button className="calculate-button" disabled={!isHandComplete} onClick={calculate} type="button">
            この手牌を計算する
          </button>
        </div>
        <CalculationResultPanel onClose={() => setResult(null)} result={result} />
      </div>
      <footer className="app-footer">{currentRule.label}の基本点数計算を基準にしています。三麻の北抜き・ツモ支払いなどは採用ルールに合わせて確認してください。</footer>
    </main>
  );
}

export default CalculatorPage;
