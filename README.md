# MahjongCalculator

麻雀の点数計算補助ツール。

## 開発目的

ネット麻雀経験者が実卓で利用するための
高速点数計算補助アプリ。

## 対応予定

- Web版（開発中）
- Windowsアプリ版
- Androidアプリ版
- iOSアプリ版

## 技術構成

- TypeScript
- React
- Vite
- Electron（予定）
- Capacitor（予定）

## Web版の構成

- `core/`: 牌姿解析、役判定、符翻・点数計算。UIに依存しないTypeScript実装。
- `web/`: React + Viteの入力・結果表示、ヘルプ、役一覧。
- `scripts/verify-core.mjs`: Coreのスモークテスト。
- `docs/scoring-references.md`: 点数計算と三麻ルールの参照元・現在の対応範囲。

Webは最後に入力された14枚目を和了牌としてCoreへ渡します。チー・ポン・カン（順子・刻子・槓子）、三麻の二〜八萬制限、北抜き枚数にも対応しています。

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

Web版はPC・スマホ向けの計算画面、用語ヘルプ、ルール切替付き役一覧、ローカル役の手動登録を実装済みです。北抜き直後の局面自動判定と局全体の精算管理は次の拡張対象です。
