# Symbol Art Parser

[English](README.md) | [日本語](README.ja.md)

[![npm version](https://img.shields.io/npm/v/symbol-art-parser.svg)](https://www.npmjs.com/package/symbol-art-parser)
[![NPM Downloads](https://img.shields.io/npm/dm/symbol-art-parser.svg?style=flat)](https://www.npmjs.com/package/symbol-art-parser)
[![jsdelivr CDN](https://data.jsdelivr.com/v1/package/npm/symbol-art-parser/badge)](https://www.jsdelivr.com/package/npm/symbol-art-parser)
[![Open in unpkg](https://img.shields.io/badge/Open%20in-unpkg-blue)](https://uiwjs.github.io/npm-unpkg/#/pkg/symbol-art-parser/file/README.md)
[![Open in Gitpod](https://shields.io/badge/Open%20in-Gitpod-green?logo=Gitpod)](https://gitpod.io/#https://github.com/logue/symbol-art-parser)
[![X Follow](https://img.shields.io/twitter/follow/logue256?style=plastic)](https://twitter.com/logue256)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/logue?label=Sponsor&logo=github&color=ea4aaa)](https://github.com/sponsors/logue)

PSO2: NGS のシンボルアートファイル（.sar）を解析・書き出しするための TypeScript 実装です。

このライブラリは SAR ファイルの解析とシリアライズのみを対象としており、描画・レンダリング機能は含まれません。

## デモ

- <https://logue.dev/symbol-art-parser/>

## インストール

```bash
pnpm add symbol-art-parser
```

## 使い方

```ts
import SymbolArt from "symbol-art-parser";

const sar = new SymbolArt();

const reader = new FileReader();
reader.onload = () => {
  sar.data = reader.result as ArrayBuffer;
};
reader.readAsArrayBuffer("[*.sar file]");

const json = sar.json;
sar.json = json;
const data = sar.data;
```

## データモデル

本ライブラリが公開する JSON 構造は以下の通りです。

- [src/types/SymbolArtData.ts](src/types/SymbolArtData.ts)
- [src/types/Layer.ts](src/types/Layer.ts)
- [schema.json](schema.json)

## 開発

```bash
pnpm install
pnpm run build
pnpm run test
pnpm run lint
```

このプロジェクトでは以下を使用しています。

- Rslib（ライブラリのビルド）
- Rsbuild（デモサイトのビルド）
- Rstest（テスト）
- Biome と Rslint（リンティング）

## 参考

- [saredit](https://github.com/HybridEidolon/saredit) - 本プログラムの処理はこちらを参考にしています。
- [PSO2NGSのシンボルアートをパースするライブラリ「Symbol Art Parser」の技術仕様書](https://qiita.com/logue/items/77b25ea2fdd713c64c2c)

## ライセンス

[MIT](LICENSE)

&copy; 2022-2026 By Logue.

["PSO2: NGS"](https://ngs.pso2.com/) にて使用されている著作物（画像・データ・音声・テキスト等）の権利は、[株式会社セガ](https://sega.com/)またはそのライセンサーに帰属します。
