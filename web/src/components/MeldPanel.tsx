import { TileSuits, type MeldInput, type MeldKind, type Tile } from "@core/types";

type InputTarget = "hand" | "meld";

interface MeldPanelProps {
  draftKind: MeldKind;
  draftOpen: boolean;
  draftTiles: Tile[];
  inputTarget: InputTarget;
  melds: MeldInput[];
  onCancelDraft: () => void;
  onCommitDraft: () => void;
  onDraftKindChange: (kind: MeldKind) => void;
  onDraftOpenChange: (open: boolean) => void;
  onInputTargetChange: (target: InputTarget) => void;
  onRemoveMeld: (index: number) => void;
}

const meldKindLabels: Record<MeldKind, string> = {
  sequence: "チー",
  triplet: "ポン",
  kan: "カン",
};

const requiredTileCount = (kind: MeldKind) => kind === "kan" ? 4 : 3;

function MeldTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="meld-tile-list">
      {tiles.map((tile, index) => (
        <img alt={tile.name} key={`${tile.id}-${index}`} src={tile.image} />
      ))}
    </div>
  );
}

function MeldPanel({
  draftKind,
  draftOpen,
  draftTiles,
  inputTarget,
  melds,
  onCancelDraft,
  onCommitDraft,
  onDraftKindChange,
  onDraftOpenChange,
  onInputTargetChange,
  onRemoveMeld,
}: MeldPanelProps) {
  const draftLimit = requiredTileCount(draftKind);

  return (
    <section className="panel meld-panel" aria-labelledby="meld-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">OPTIONAL</p>
          <h2 id="meld-title">鳴き面子</h2>
        </div>
        <span className="counter">{melds.length} / 4 面子</span>
      </div>

      <div className="input-target-toggle" role="tablist" aria-label="牌の入力先">
        <button
          aria-selected={inputTarget === "hand"}
          className={inputTarget === "hand" ? "is-active" : ""}
          onClick={() => onInputTargetChange("hand")}
          role="tab"
          type="button"
        >
          手牌
        </button>
        <button
          aria-selected={inputTarget === "meld"}
          className={inputTarget === "meld" ? "is-active" : ""}
          disabled={melds.length >= 4}
          onClick={() => onInputTargetChange("meld")}
          role="tab"
          type="button"
        >
          面子を追加
        </button>
      </div>

      {melds.length > 0 && (
        <div className="meld-list">
          {melds.map((meld, index) => (
            <div className="meld-row" key={`${meld.kind}-${index}`}>
              <span>{meld.open ? "副露" : "暗"}{meldKindLabels[meld.kind]}</span>
              <MeldTiles tiles={meld.tiles} />
              <button aria-label={`${index + 1}番目の面子を削除`} className="remove-meld" onClick={() => onRemoveMeld(index)} type="button">×</button>
            </div>
          ))}
        </div>
      )}

      {inputTarget === "meld" && (
        <div className="meld-draft">
          <div className="meld-draft-fields">
            <label className="field">
              <span>面子の種類</span>
              <select onChange={(event) => onDraftKindChange(event.target.value as MeldKind)} value={draftKind}>
                {Object.entries(meldKindLabels).map(([kind, label]) => <option key={kind} value={kind}>{label}</option>)}
              </select>
            </label>
            <label className="check-field"><input checked={draftOpen} onChange={(event) => onDraftOpenChange(event.target.checked)} type="checkbox" /> 鳴き（副露）</label>
          </div>
          <p className="meld-draft-count">{meldKindLabels[draftKind]}：{draftTiles.length} / {draftLimit} 枚。牌選択欄から追加します。</p>
          <div className="meld-draft-preview"><MeldTiles tiles={draftTiles} /></div>
          <div className="meld-draft-actions">
            <button className="ghost-button" onClick={onCancelDraft} type="button">取消</button>
            <button className="meld-commit-button" disabled={draftTiles.length !== draftLimit} onClick={onCommitDraft} type="button">面子を登録</button>
          </div>
        </div>
      )}

      {melds.length === 0 && inputTarget === "hand" && (
        <p className="meld-helper">鳴きがある場合は「面子を追加」を選び、チー・ポン・カンを登録します。</p>
      )}
      <span className="sr-only">牌種は{Object.values(TileSuits).join("、")}から選べます。</span>
    </section>
  );
}

export default MeldPanel;
