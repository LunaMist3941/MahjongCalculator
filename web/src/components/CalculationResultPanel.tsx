import type { CalculationResult } from "@core/types";

interface CalculationResultPanelProps {
  onClose: () => void;
  result: CalculationResult | null;
}

function CalculationResultPanel({ onClose, result }: CalculationResultPanelProps) {
  if (!result) {
    return (
      <section className="panel result-panel empty-result" aria-labelledby="result-title">
        <p className="eyebrow">RESULT</p>
        <h2 id="result-title">計算結果</h2>
        <p>手牌と必要な面子を入力し、最後の牌を和了牌として計算します。</p>
      </section>
    );
  }

  if (!result.valid || !result.score) {
    return (
      <section className="panel result-panel has-result error-result" aria-labelledby="result-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CHECK</p>
            <h2 id="result-title">計算できません</h2>
          </div>
          <button aria-label="計算結果を閉じる" className="close-result" onClick={onClose} type="button">×</button>
        </div>
        <ul className="error-list">
          {result.errors.map((error) => <li key={error}>{error}</li>)}
        </ul>
      </section>
    );
  }

  const score = result.score;
  const payment = score.tsumo
    ? score.tsumo.winnerIsDealer
      ? `全員${score.tsumo.dealerPays.toLocaleString("ja-JP")}点`
      : `親${score.tsumo.dealerPays.toLocaleString("ja-JP")}点 / 子${score.tsumo.otherPays.toLocaleString("ja-JP")}点`
    : `${score.ronPoints.toLocaleString("ja-JP")}点`;

  return (
    <section className="panel result-panel has-result" aria-labelledby="result-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">RESULT</p>
          <h2 id="result-title">計算結果</h2>
        </div>
        <div className="result-actions">
          <span className="limit-badge">{score.limitName}</span>
          <button aria-label="計算結果を閉じる" className="close-result" onClick={onClose} type="button">×</button>
        </div>
      </div>

      <div className="score-hero">
        <span>{score.tsumo ? "ツモ支払い" : "ロン点数"}</span>
        <strong>{payment}</strong>
        <small>受け取り合計 {score.totalPoints.toLocaleString("ja-JP")}点</small>
      </div>

      <div className="score-summary">
        <div><span>翻</span><strong>{result.han}</strong></div>
        <div><span>符</span><strong>{result.fu ?? "—"}</strong></div>
        <div><span>加算</span><strong>{result.bonusHan}</strong></div>
      </div>

      <h3>成立役</h3>
      <ul className="yaku-list">
        {result.yaku.map((item) => (
          <li key={item.id}>
            <span>{item.name}</span>
            <b>{item.yakuman ? `${item.yakuman}役満` : `${item.han}翻`}</b>
          </li>
        ))}
        {result.bonusHan - result.kitaNuki > 0 && (
          <li><span>ドラ・裏ドラ・赤ドラ</span><b>{result.bonusHan - result.kitaNuki}翻</b></li>
        )}
        {result.bonusHan > 0 && result.kitaNuki > 0 && (
          <li><span>北抜き（抜きドラ）</span><b>{result.kitaNuki}翻</b></li>
        )}
      </ul>
    </section>
  );
}

export default CalculationResultPanel;
