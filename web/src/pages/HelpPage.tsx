import { useState } from "react";
import { mahjongTerms } from "../data/mahjongTerms";

interface HelpPageProps {
  onBack: () => void;
}

const categories = ["すべて", ...new Set(mahjongTerms.map((term) => term.category))];
const pageSize = 6;

function HelpPage({ onBack }: HelpPageProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("すべて");
  const [page, setPage] = useState(0);
  const normalizedQuery = query.trim().toLocaleLowerCase("ja-JP");
  const filteredTerms = mahjongTerms.filter((term) => {
    const matchesCategory = category === "すべて" || term.category === category;
    const searchable = [term.name, term.reading, term.category, ...(term.aliases ?? []), term.description]
      .join(" ")
      .toLocaleLowerCase("ja-JP");
    return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
  const pageCount = Math.max(1, Math.ceil(filteredTerms.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleTerms = filteredTerms.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(0);
  };

  const updateCategory = (value: string) => {
    setCategory(value);
    setPage(0);
  };

  return (
    <main className="app-shell help-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">GUIDE</p>
          <h1>用語ヘルプ</h1>
          <p className="subtitle">麻雀の用語を検索して、意味と計算上のポイントを確認できます。</p>
        </div>
        <button className="back-button" onClick={onBack} type="button">計算画面へ</button>
      </header>

      <section className="panel help-search" aria-label="用語検索">
        <label className="field help-query-field">
          <span>キーワード検索</span>
          <input
            aria-label="用語を検索"
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="例：リーチ、符、待ち"
            type="search"
            value={query}
          />
        </label>
        <label className="field help-category-field">
          <span>カテゴリ</span>
          <select onChange={(event) => updateCategory(event.target.value)} value={category}>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <button className="ghost-button help-clear" disabled={!query} onClick={() => updateQuery("")} type="button">検索をクリア</button>
      </section>

      <section className="panel help-results" aria-live="polite" aria-labelledby="help-results-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">GLOSSARY</p>
            <h2 id="help-results-title">用語一覧</h2>
          </div>
          <span className="counter">{filteredTerms.length} 件</span>
        </div>

        {visibleTerms.length > 0 ? (
          <div className="term-grid">
            {visibleTerms.map((term) => (
              <article className="term-card" key={term.name}>
                <div className="term-card-heading">
                  <h3>{term.name}</h3>
                  <span>{term.category}</span>
                </div>
                <p className="term-reading">{term.reading}</p>
                <p>{term.description}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-help">一致する用語がありません。別のキーワードを試してください。</p>
        )}

        <nav className="help-pager" aria-label="用語一覧のページ切り替え">
          <button disabled={currentPage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))} type="button">前へ</button>
          <span>{filteredTerms.length === 0 ? "0 / 0" : `${currentPage + 1} / ${pageCount}`}</span>
          <button disabled={currentPage >= pageCount - 1} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} type="button">次へ</button>
        </nav>
      </section>
      <p className="help-note">用語の説明は一般的なリーチ麻雀を基準にしています。採用ルールによって扱いが異なる場合があります。</p>
    </main>
  );
}

export default HelpPage;
