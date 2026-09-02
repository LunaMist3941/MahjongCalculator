import { tiles } from "@core/tiles";
import { getRuleConfig } from "@core/rules";
import type { RuleMode } from "@core/rules";
import { TileSuits, type Tile, type TileSuit } from "@core/types";

type InputTarget = "hand" | "meld";

interface TileSelectorProps {
  concealedCount: number;
  concealedLimit: number;
  draftCount: number;
  draftLimit: number;
  inputTarget: InputTarget;
  selected: Tile[];
  rule: RuleMode;
  onSelect: (tile: Tile) => void;
}

const suitOrder = Object.values(TileSuits) as TileSuit[];

function TileSelector({
  concealedCount,
  concealedLimit,
  draftCount,
  draftLimit,
  inputTarget,
  selected,
  rule,
  onSelect,
}: TileSelectorProps) {
  const usesReducedManzu = getRuleConfig(rule).usesReducedManzu;

  return (
    <section className="panel tile-selector" aria-labelledby="tile-selector-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">INPUT</p>
          <h2 id="tile-selector-title">手牌を入力</h2>
        </div>
        <span className="counter">{inputTarget === "hand" ? `${concealedCount} / ${concealedLimit} 枚` : `面子 ${draftCount} / ${draftLimit} 枚`}</span>
      </div>

      <p className="helper-text">牌をタップして追加します。同じ牌は最大4枚まで選べます。</p>
      <div className="tile-groups">
        {suitOrder.map((suit) => (
          <div className="tile-group" key={suit}>
            <h3>{suit}</h3>
            <div className="tile-button-grid">
              {tiles.filter((tile) => tile.suit === suit).map((tile) => {
                const count = selected.filter((item) => item.id === tile.id).length;
                const unavailableInRule = usesReducedManzu && tile.suit === TileSuits.MAN && tile.value >= 2 && tile.value <= 8;
                const disabled = unavailableInRule || (inputTarget === "hand"
                  ? concealedCount >= concealedLimit || count >= 4
                  : draftCount >= draftLimit || count >= 4);
                return (
                  <button
                    aria-label={`${tile.name}を追加`}
                    className="tile-choice"
                    disabled={disabled}
                    key={tile.id}
                    onClick={() => onSelect(tile)}
                    title={unavailableInRule ? "この三麻ルールでは使用できません" : `${tile.name}を追加（${count}/4）`}
                    type="button"
                  >
                    <img alt={tile.name} src={tile.image} />
                    <span>{tile.name}</span>
                    {count > 0 && <b>{count}</b>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TileSelector;
