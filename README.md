# Symbol Art Parser

[![npm version](https://img.shields.io/npm/v/symbol-art-parser.svg)](https://www.npmjs.com/package/symbol-art-parser)
[![NPM Downloads](https://img.shields.io/npm/dm/symbol-art-parser.svg?style=flat)](https://www.npmjs.com/package/symbol-art-parser)
[![jsdelivr CDN](https://data.jsdelivr.com/v1/package/npm/symbol-art-parser/badge)](https://www.jsdelivr.com/package/npm/symbol-art-parser)
[![Open in unpkg](https://img.shields.io/badge/Open%20in-unpkg-blue)](https://uiwjs.github.io/npm-unpkg/#/pkg/symbol-art-parser/file/README.md)
[![Open in Gitpod](https://shields.io/badge/Open%20in-Gitpod-green?logo=Gitpod)](https://gitpod.io/#https://github.com/logue/symbol-art-parser)
[![X Follow](https://img.shields.io/twitter/follow/logue256?style=plastic)](https://twitter.com/logue256)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/logue?label=Sponsor&logo=github&color=ea4aaa)](https://github.com/sponsors/logue)

TypeScript implementation for parsing and serializing PSO2: NGS Symbol Art files (.sar).

This library focuses on SAR file parsing and serialization. It does not include rendering or drawing logic.

## Demo

- <https://logue.dev/symbol-art-parser/>

## Installation

```bash
pnpm add symbol-art-parser
```

## Usage

```ts
import SymbolArt from 'symbol-art-parser';

const sar = new SymbolArt();

const reader = new FileReader();
reader.onload = () => {
  sar.data = reader.result as ArrayBuffer;
};
reader.readAsArrayBuffer('[*.sar file]');

const json = sar.json;
sar.json = json;
const data = sar.data;
```

## Data model

The library exposes the following JSON structures:

- [src/interfaces/SymbolArtInterface.ts](src/interfaces/SymbolArtInterface.ts)
- [src/interfaces/LayerInterface.ts](src/interfaces/LayerInterface.ts)
- [schema.json](schema.json)

## Development

```bash
pnpm install
pnpm run build
pnpm run test
pnpm run lint
```

The project uses:

- Rslib for the library build
- Rsbuild for the demo site
- Rstest for tests
- Biome and Rslint for linting

## Reference

- [saredit](https://github.com/HybridEidolon/saredit) - The processing referred to this program.

## License

[MIT](LICENSE)

&copy; 2022-2026 By Logue.

All rights to the copyrighted works (images, data, audios, texts, etc.) used in ["PSO2: NGS"](https://ngs.pso2.com/) are owned by [SEGA Corporation](https://sega.com/) or its licensors.
