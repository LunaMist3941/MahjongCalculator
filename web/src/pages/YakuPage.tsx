import { useState } from "react";
import { isYakuAvailable, YAKU_CATALOG, type LocalYakuDefinition, type YakuDefinition } from "@core/yaku";
import { RuleMode } from "@core/rules";
import { getTileById } from "@core/tiles";
import { SCORE_LIMIT_LABELS, type ScoreLimit, type Tile } from "@core/types";
import RuleSelector from "../components/RuleSelector";

interface YakuPageProps {
  localYaku: LocalYakuDefinition[];
  onAddLocalYaku: (yaku: LocalYakuDefinition) => void;
  onBack: () => void;
  onRemoveLocalYaku: (id: string) => void;
}

const categories = ["すべて", ...new Set([
  ...YAKU_CATALOG.map((yaku) => yaku.category),
  "満貫" as const,
  "跳満" as const,
  "倍満" as const,
  "三倍満" as const,
  "数え役満" as const,
  "2倍役満" as const,
])];
type LocalCategory = LocalYakuDefinition["category"];
const localLimitByCategory: Partial<Record<LocalCategory, ScoreLimit>> = {
  "満貫": "mangan",
  "跳満": "haneman",
  "倍満": "baiman",
  "三倍満": "sanbaiman",
  "数え役満": "counted-yakuman",
};

function valueLabel(yaku: YakuDefinition): string {
  if (yaku.yakuman) {
    return yaku.yakuman === 1 ? "役満" : `${yaku.yakuman}倍役満`;
  }
  if (yaku.closedHan && yaku.openHan && yaku.closedHan !== yaku.openHan) {
    return `${yaku.closedHan}翻／鳴き${yaku.openHan}翻`;
  }
  if (yaku.closedHan) {
    return `${yaku.closedHan}翻`;
  }
  return "役ではなく加算";
}

function exampleTiles(yaku: YakuDefinition): Tile[] {
  return (yaku.exampleTiles ?? [])
    .map((id) => getTileById(id))
    .filter((tile): tile is Tile => Boolean(tile));
}

function localExampleTiles(yaku: LocalYakuDefinition): Tile[] {
  return (yaku.exampleTiles ?? [])
    .map((id) => getTileById(id))
    .filter((tile): tile is Tile => Boolean(tile));
}

function localValueLabel(yaku: LocalYakuDefinition): string {
  if (yaku.limit) {
    return `${SCORE_LIMIT_LABELS[yaku.limit]}（手動）`;
  }
  if (yaku.yakuman) {
    return yaku.yakuman === 1 ? "役満（手動）" : `${yaku.yakuman}倍役満（手動）`;
  }
  return `${yaku.han}翻（手動）`;
}

function YakuPage({ localYaku, onAddLocalYaku, onBack, onRemoveLocalYaku }: YakuPageProps) {
  const [rule, setRule] = useState<RuleMode>(RuleMode.JANTAMA_4);
  const [category, setCategory] = useState("すべて");
  const [localName, setLocalName] = useState("");
  const [localCategory, setLocalCategory] = useState<LocalCategory>("通常役");
  const [localHan, setLocalHan] = useState(1);
  const [localCondition, setLocalCondition] = useState("");
  const [localFormError, setLocalFormError] = useState("");
  const unavailableYaku = YAKU_CATALOG.filter((yaku) => !isYakuAvailable(rule, yaku));
  const visibleYaku = YAKU_CATALOG.filter((yaku) => {
    const matchesCategory = category === "すべて" || yaku.category === category;
    return matchesCategory && isYakuAvailable(rule, yaku);
  });
  const visibleLocalYaku = localYaku.filter((yaku) => {
    const matchesCategory = category === "すべて" || yaku.category === category;
    return matchesCategory && yaku.rules.includes(rule);
  });

  const addLocalYaku = () => {
    const name = localName.trim();
    const condition = localCondition.trim();
    if (!name) {
      setLocalFormError("役名を入力してください。");
      return;
    }
    if (localYaku.some((yaku) => yaku.rules.includes(rule) && yaku.name === name)) {
      setLocalFormError("同じルールに同名のローカル役があります。");
      return;
    }
    if (localCategory === "通常役" && (!Number.isInteger(localHan) || localHan < 1 || localHan > 13)) {
      setLocalFormError("通常役の翻数は1〜13翻で指定してください。");
      return;
    }
    const localLimit = localLimitByCategory[localCategory];
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `local-${Date.now()}`;
    onAddLocalYaku({
      category: localCategory,
      condition: condition || "この役を採用する場合の成立条件を手動で確認します。",
      han: localCategory === "通常役" ? localHan : 0,
      id: `local-${id}`,
      ...(localLimit ? { limit: localLimit } : {}),
      name,
      rules: [rule],
      ...(localCategory === "役満" ? { yakuman: 1 } : {}),
      ...(localCategory === "2倍役満" ? { yakuman: 2 } : {}),
    });
    setLocalName("");
    setLocalCondition("");
    setLocalFormError("");
  };

  return (
    <main className="app-shell yaku-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">REFERENCE</p>
          <h1>役一覧</h1>
          <p className="subtitle">採用ルールに合わせて、表示する役と翻数を確認できます。</p>
        </div>
        <button className="back-button" onClick={onBack} type="button">計算画面へ</button>
      </header>

      <section className="panel yaku-controls" aria-label="役一覧の条件">
        <RuleSelector onChange={setRule} value={rule} />
        <label className="field">
          <span>分類</span>
          <select onChange={(event) => setCategory(event.target.value)} value={category}>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </section>

      <section className="panel yaku-results" aria-live="polite" aria-labelledby="yaku-results-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YAKU CATALOG</p>
            <h2 id="yaku-results-title">{rule === RuleMode.JANTAMA_3 || rule === RuleMode.STANDARD_3 ? "三麻" : "四麻"}の役</h2>
          </div>
          <span className="counter">{visibleYaku.length + visibleLocalYaku.length} 件</span>
        </div>

        {unavailableYaku.length > 0 && (
          <p className="yaku-note">
            {unavailableYaku.map((yaku) => yaku.name).join("、")}は、このルールでは原則表示対象外です。
          </p>
        )}

        <div className="yaku-catalog-grid">
          {visibleYaku.map((yaku) => (
            <article className={`yaku-catalog-card ${yaku.yakuman ? "is-yakuman" : ""}`} key={yaku.id}>
              <div className="yaku-card-heading">
                <h3>{yaku.name}</h3>
                <span>{yaku.category}</span>
              </div>
              <p className="yaku-value">{valueLabel(yaku)}</p>
              <p className="yaku-condition"><strong>成立条件：</strong>{yaku.condition}</p>
              {exampleTiles(yaku).length > 0 && (
                <div className="yaku-example" aria-label={`${yaku.name}の代表牌姿`}>
                  <span>代表牌姿</span>
                  <div className="yaku-example-tiles">
                    {exampleTiles(yaku).map((tile, index) => <img alt={tile.name} key={`${tile.id}-${index}`} src={tile.image} />)}
                  </div>
                </div>
              )}
              {yaku.note && <p className="yaku-card-note">{yaku.note}</p>}
              {yaku.aliases && <p className="yaku-card-note">別名：{yaku.aliases.join("、")}</p>}
            </article>
          ))}
          {visibleLocalYaku.map((yaku) => (
            <article className={`yaku-catalog-card is-local ${yaku.yakuman ? "is-yakuman" : ""} ${yaku.limit ? "is-limit" : ""}`} key={yaku.id}>
              <div className="yaku-card-heading">
                <h3>{yaku.name}</h3>
                <span>{yaku.source === "initial" ? "初期役" : yaku.source === "standard-local" ? "標準ローカル" : yaku.builtIn ? "標準ローカル" : "ローカル役"}</span>
              </div>
              <p className="yaku-value">{localValueLabel(yaku)}</p>
              <p className="yaku-condition"><strong>成立条件：</strong>{yaku.condition}</p>
              {localExampleTiles(yaku).length > 0 && (
                <div className="yaku-example" aria-label={`${yaku.name}の代表牌姿`}>
                  <span>代表牌姿</span>
                  <div className="yaku-example-tiles">
                    {localExampleTiles(yaku).map((tile, index) => <img alt={tile.name} key={`${tile.id}-${index}`} src={tile.image} />)}
                  </div>
                </div>
              )}
              {!yaku.builtIn && <button className="local-yaku-remove" onClick={() => onRemoveLocalYaku(yaku.id)} type="button">この役を削除</button>}
            </article>
          ))}
        </div>
      </section>

      <section className="panel local-yaku-panel" aria-labelledby="local-yaku-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CUSTOM RULE</p>
            <h2 id="local-yaku-title">ローカル役を手動登録</h2>
          </div>
          <span className="counter">対象：{rule === RuleMode.JANTAMA_3 || rule === RuleMode.STANDARD_3 ? "三麻" : "四麻"}</span>
        </div>
        <p className="local-yaku-help">登録した役は選択中のルールだけに保存され、計算画面の「計算条件」で成立したものを選択できます。</p>
        <div className="local-yaku-form">
          <label className="field">
            <span>役名</span>
            <input onChange={(event) => setLocalName(event.target.value)} placeholder="例：オリジナル役" value={localName} />
          </label>
          <label className="field">
            <span>分類</span>
            <select onChange={(event) => setLocalCategory(event.target.value as LocalCategory)} value={localCategory}>
              <option value="通常役">通常役</option>
              <option value="満貫">満貫</option>
              <option value="跳満">跳満</option>
              <option value="倍満">倍満</option>
              <option value="三倍満">三倍満</option>
              <option value="数え役満">数え役満</option>
              <option value="役満">役満</option>
              <option value="2倍役満">2倍役満</option>
            </select>
          </label>
          {localCategory === "通常役" && (
            <label className="field">
              <span>翻数</span>
              <input min="1" max="13" onChange={(event) => setLocalHan(Number(event.target.value))} type="number" value={localHan} />
            </label>
          )}
          <label className="field local-condition-field">
            <span>成立条件（任意）</span>
            <input onChange={(event) => setLocalCondition(event.target.value)} placeholder="役の条件をメモ" value={localCondition} />
          </label>
          <button className="local-yaku-add" onClick={addLocalYaku} type="button">このルールに追加</button>
        </div>
        {localFormError && <p className="local-yaku-error" role="alert">{localFormError}</p>}
      </section>

      <p className="yaku-footer">標準役はCoreの判定結果を表示し、ローカル役は登録後に計算条件から手動選択して加算します。</p>
    </main>
  );
}

export default YakuPage;
