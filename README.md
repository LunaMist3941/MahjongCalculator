# MahjongCalculator

麻雀の点数計算補助ツール。

## 開発目的・提供形態

ネット麻雀経験者が実卓でも利用できる、PC・スマホ両対応の
麻雀点数計算Webアプリを提供する。

本プロジェクトはWeb版を完成版として開発し、ブラウザから利用する。ネイティブアプリ版（Windows・Android・iOS）は現方針の対象外とする。

## 技術構成

- TypeScript
- React + Vite
- レスポンシブCSS（PC・スマホ対応）
- GitHub Actions + GitHub Pages（Web版の公開）

## Web版の構成

- `core/`: 牌姿解析、役判定、符翻・点数計算。UIに依存しないTypeScript実装。
- `web/`: React + Viteの入力・結果表示、ヘルプ、役一覧。
- `scripts/verify-core.mjs`: Coreのスモークテスト。
- `docs/scoring-references.md`: 点数計算と三麻ルールの参照元・現在の対応範囲。

`web/` はViteとTypeScriptのパスエイリアスを通じて `core/` を直接利用する。計算・役判定などの内部処理はCoreに集約し、Web側は手牌入力、条件設定、結果表示を担当する。

Webは最後に入力された14枚目を和了牌としてCoreへ渡します。チー・ポン・カン（順子・刻子・槓子）、三麻の二〜八萬制限、北抜き枚数にも対応しています。ローカル役は通常役・満貫・跳満・倍満・三倍満・数え役満・役満・2倍役満に分類でき、流し満貫は通常役の5翻として計算条件から選択します。選択時は流し満貫を優先して他の役・ドラを加算せず、大七星は標準ローカルとして登録されています。

## 起動

```powershell
Set-Location web
npm install
npm run dev
```

検査は `npm run lint`、`npm run test:core`、`npm run build` で実行できます。

## GitHub Pages公開

`.github/workflows/deploy-pages.yml` が `master` へのpush時にWeb版をビルドし、GitHub Pagesへ公開します。GitHubリポジトリ側でPagesの公開元を「GitHub Actions」に設定してください。公開用のビルドはリポジトリ名を自動的にベースパスへ反映し、牌画像もリポジトリ配下URLから読み込みます。

手動確認時は `web` で `npm ci` の後に `npm run build` を実行し、生成された `web/dist` を静的ホスティングの公開ディレクトリに指定します。

## 開発状況

Web版はPC・スマホ向けの計算画面、用語ヘルプ、ルール切替付き役一覧、ローカル役の手動登録を実装済みです。北抜き直後の局面自動判定と局全体の精算管理は次の拡張対象です。ネイティブアプリ化は行わず、Web版の機能改善と対応ルールの拡充を優先します。
