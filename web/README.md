# 麻雀点数計算 Web版

PC・スマホのブラウザで利用する麻雀役確認・点数計算アプリです。Web版のみを提供し、GitHub Pagesで公開します。

## 起動

```powershell
npm install
npm run dev
```

## 検査とビルド

```powershell
npm run lint
npm run test:core
npm run build
```

`npm run test:core` は、Web UIから独立した `../core/` の役判定・点数計算を検証します。

## 構成

- `src/`: Reactによる手牌入力、条件設定、計算結果、ヘルプ、役一覧。
- `../core/`: 牌姿解析、役判定、符翻・点数計算を担当するUI非依存のTypeScript実装。
- `public/tiles/`: Web画面で使用する牌画像。
- `vite.config.ts` / `tsconfig.app.json`: `@core` エイリアスでCoreを参照する設定。

Web画面は入力と表示に専念し、計算・役一致確認などの内部処理はCoreへ委譲します。GitHub Pagesへの公開設定はリポジトリルートの `.github/workflows/deploy-pages.yml` で管理します。

ローカル役は通常役・満貫・跳満・倍満・三倍満・数え役満・役満・2倍役満に分類できます。通常の手牌は翻・符の条件で上限区分を判定し、流し満貫は通常役の5翻として計算条件から選択します。選択時は流し満貫を優先して他の役・ドラを加算せず、大七星は標準ローカルとして表示されます。どちらも成立条件の最終確認と計算画面での選択は手動で行います。
