import Blowfish from './helpers/Blowfish';
import BinaryUtility from './BinaryUtility';
import LayerInterface from './interfaces/LayerInterface';
import SymbolArtInterface from './interfaces/SymbolArtInterface';
import LayerPositionInterface from './interfaces/LayerPositionInterface';

/** SymbolArt Class */
export default class SymbolArt implements SymbolArtInterface {
  /** Decrypt Key */
  static readonly BLOWFISH_KEY = Uint8Array.of(0x09, 0x07, 0xc1, 0x2b).buffer;
  /** Compressed Flag */
  static readonly FLAG_COMPRESSED = 0x84;
  /** Uncompressed Flag */
  static readonly FLAG_NOT_COMPRESSED = 0x04;
  /** Layer offset */
  static readonly LAYER_POSITION_OFFSET: LayerPositionInterface = {
    x: -126,
    y: -317,
  };

  private flag: number;
  /** Data */
  private data: BinaryUtility;

  authorId = 0;
  name = '';
  size = {
    height: 0,
    width: 0,
  };
  layerCount = 0;
  sound = 0;
  layers: LayerInterface[] = [];

  /**
   * Constructor
   * @param buffer - Synbolart(*.sar) File array buffer.
   */
  constructor(buffer: ArrayBuffer) {
    /** Cryptor */
    const context = new Blowfish(SymbolArt.BLOWFISH_KEY);
    /** binary */
    const u8a = new Uint8Array(buffer);

    // Header Check
    if (u8a[0] !== 0x73 || u8a[1] !== 0x61 || u8a[2] !== 0x72) {
      // Iar
      throw new Error('[SymbolArt] not a SAR file');
    }
    this.flag = u8a[3];
    if (
      this.flag !== SymbolArt.FLAG_COMPRESSED &&
      this.flag !== SymbolArt.FLAG_NOT_COMPRESSED
    ) {
      throw new Error(`[SymbolArt] invalid flag ${this.flag}`);
    }

    /** Data without file header */
    const source: Uint8Array = u8a.slice(4, buffer.byteLength);

    /** Decrypt Blowfish*/
    let resultBuffer: ArrayBuffer = context.decrypt(source.buffer);

    if (this.flag === SymbolArt.FLAG_COMPRESSED) {
      resultBuffer = this.decompress(source.map(v => v ^ 0x95).buffer);
      console.log('uncomporess', resultBuffer);
    }
    this.data = new BinaryUtility(resultBuffer);

    this.parse();
  }

  /** Output SymbolArt Data */
  parse() {
    this.authorId = this.data.uint32L;
    this.layerCount = this.data.uint8;
    this.size.height = this.data.uint8;
    this.size.width = this.data.uint8;
    this.sound = this.data.uint8;
    const layers: LayerInterface[] = [];

    for (let i = 0; i < this.layerCount; i++) {
      const val1 = this.data.uint32L;
      const val2 = this.data.uint32L;

      const position = {
        topLeft: { x: this.data.uint8, y: this.data.uint8 },
        bottomLeft: { x: this.data.uint8, y: this.data.uint8 },
        topRight: { x: this.data.uint8, y: this.data.uint8 },
        bottomRight: { x: this.data.uint8, y: this.data.uint8 },
      };

      const visible = !(val1 >> 31);
      const textureIndex = (val1 >> 21) & 1023;
      const alpha = (val1 >> 18) & 7;
      const colorR = (val1 >> 0) & 63;
      const colorG = (val1 >> 6) & 63;
      const colorB = (val1 >> 12) & 63;

      const colorX = (val2 >> 0) & 63;
      const colorY = (val2 >> 6) & 63;
      const colorZ = (val2 >> 12) & 63;

      layers.push({
        position: {
          topLeft: {
            x: position.topLeft.x + SymbolArt.LAYER_POSITION_OFFSET.x,
            y: position.topLeft.y + SymbolArt.LAYER_POSITION_OFFSET.y,
          },
          bottomLeft: {
            x: position.bottomLeft.x + SymbolArt.LAYER_POSITION_OFFSET.x,
            y: position.bottomLeft.y + SymbolArt.LAYER_POSITION_OFFSET.y,
          },
          topRight: {
            x: position.topRight.x + SymbolArt.LAYER_POSITION_OFFSET.x,
            y: position.topRight.y + SymbolArt.LAYER_POSITION_OFFSET.y,
          },
          bottomRight: {
            x: position.bottomRight.x + SymbolArt.LAYER_POSITION_OFFSET.x,
            y: position.bottomRight.y + SymbolArt.LAYER_POSITION_OFFSET.y,
          },
        },
        visible: visible,
        symbolIndex: textureIndex,
        color: [
          // R
          colorR * 4,
          // G
          colorG * 4,
          // B
          colorB * 4,
          // A
          alpha / 7,
        ],

        colorX: colorX,
        colorY: colorY,
        colorZ: colorZ,
      });
    }
    this.layers = layers.reverse();

    /** Name */
    const name: number[] = [];
    // Read rest of buffer into Symbol Art name
    const startPos = this.data.offset;
    for (let i = 0; i < (this.data.length - startPos) / 2; i++) {
      name.push(this.data.uint16L);
    }

    const decoder = new TextDecoder('utf-16');
    const dataView = new DataView(Uint16Array.from(name).buffer);

    this.name = decoder.decode(dataView);
  }

  /** ダンプ */
  toString() {
    return JSON.stringify(
      {
        authorId: this.authorId,
        name: this.name,
        size: this.size,
        layerCount: this.layerCount,
        sound: this.sound,
        layers: this.layers,
      },
      null,
      2
    );
  }

  /**
   * @param buffer - buffer to decompress
   */
  private decompress(buffer: ArrayBuffer): ArrayBuffer {
    const input = new BinaryUtility(buffer);
    const output = new BinaryUtility();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let flag = input.bit;

      if (flag) {
        // literal byte
        output.uint8 = input.uint8;
        continue;
      }

      let offset = 0;
      let size = 0;
      let isLongCopy = false;

      flag = input.bit;
      if (flag) {
        isLongCopy = true;
        // long copy or eof
        offset = input.uint16L;
        if (offset === 0) {
          break;
        }
        size = offset & 7;
        offset = (offset >> 3) | -0x2000;
        if (size === 0) {
          const num3 = input.uint8;
          size = num3 + 10;
        } else {
          size += 2;
        }
      } else {
        // short copy
        flag = input.bit;
        size = input.bit ? 1 : 0;
        size = (size | (flag ? 1 : 0 << 1)) + 2;

        offset = input.int8 | -0x100;
      }

      // do the actual copy
      for (let i = 0; i < size; i++) {
        if (offset > 0) {
          throw new Error(
            `[SymbolArt] offset > 0 (${offset}) (isLongCopy === ${isLongCopy})`
          );
        }
        output.offset = offset;
        const newByte = output.uint8;
        output.offset = -1;
        output.offset = -offset;
        output.uint8 = newByte;
      }
    }

    return output.getBuffer();
  }
}
