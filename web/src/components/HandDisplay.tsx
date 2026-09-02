import type { Tile } from "@core/types";

interface HandDisplayProps {
  tiles: Tile[];
  winningIndex: number | null;
  onRemove: (index: number) => void;
}

function HandDisplay({
  tiles,
  winningIndex,
  onRemove,
}: HandDisplayProps) {
  const slots = Array.from({ length: 14 }, (_, index) => tiles[index]);

  return (
    <section className="panel hand-panel" aria-labelledby="hand-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">HAND</p>
          <h2 id="hand-title">手牌</h2>
        </div>
        <span className="counter">{tiles.length} / 14</span>
      </div>
      <div className="hand-grid" role="list" aria-label="入力済みの手牌">
        {slots.map((tile, index) => (
          <div className={`tile-slot ${tile ? "has-tile" : "is-empty"}`} key={index} role="listitem">
            <div
              aria-label={tile ? `${tile.name}${winningIndex === index ? "（和了牌）" : ""}` : `${index + 1}番目の空き枠`}
              className={`tile-card ${winningIndex === index ? "is-winning" : ""}`}
              role="img"
            >
              {tile ? (
                <img alt={tile.name} src={tile.image} />
              ) : (
                <span className="empty-slot">{index + 1}</span>
              )}
            </div>
            {tile && (
              <button
                aria-label={`${tile.name}を削除`}
                className="remove-tile"
                onClick={() => onRemove(index)}
                type="button"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <p className="helper-text">牌は追加順に並び、入力手牌の最後の牌を和了牌として計算します。赤枠が和了牌です。</p>
    </section>
  );
}

export default HandDisplay;
