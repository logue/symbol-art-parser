# Symbol Art Parser

[![jsdelivr CDN](https://data.jsdelivr.com/v1/package/npm/symbol-art-parser/badge)](https://www.jsdelivr.com/package/npm/symbol-art-parser)
[![NPM Downloads](https://img.shields.io/npm/dm/symbol-art-parser.svg?style=flat)](https://www.npmjs.com/package/symbol-art-parser)
[![Open in unpkg](https://img.shields.io/badge/Open%20in-unpkg-blue)](https://uiwjs.github.io/npm-unpkg/#/pkg/symbol-art-parser/file/README.md)
[![npm version](https://img.shields.io/npm/v/symbol-art-parser.svg)](https://www.npmjs.com/package/symbol-art-parser)
[![Open in Gitpod](https://shields.io/badge/Open%20in-Gitpod-green?logo=Gitpod)](https://gitpod.io/#https://github.com/logue/symbol-art-parser)

TypeScript Phantasy Star Online 2's Symbol Art Parser Libraly.

This library only implements parsing and reading / writing of sar files, and does not include drawing processing.

## Sample

- <https://logue.dev/symbol-art-parser/>

## Syntax

```js
import SymbolArt from 'symbol-art-parser';

const sar = new SymbolArt();

const reader = new FileReader();
reader.onload = () => {
  // Load SymbolArt
  sar.data = reader.result;
};
reader.readAsArrayBuffer('[*.sar file]');

// Dump to Symbol Art json
const json = sar.json;

// Set Symbol Art json
sar.json = json;

// Save SymbolArt as ArrayBuffer
const data = sar.data;
```

## Json Format

See [SymbolArtInterface](src/interfaces/SymbolArtInterface.ts) and [LayerInterface](src/interfaces/LayerInterface.ts).

## Reference

- [saredit](https://github.com/HybridEidolon/saredit)

## License

[MIT](LICENSE)
