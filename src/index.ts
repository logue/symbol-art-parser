import Blowfish from './helpers/Blowfish';
import SymbolArtInterface from './interfaces/SymbolArtInterface';
// import LayerPositionInterface from './interfaces/LayerPositionInterface';
import Cursor from './helpers/Cursor';
import SarParser from './helpers/SarParser';

/** SymbolArt Class */
export default class SymbolArt {
  /** Decrypt Key */
  static readonly BLOWFISH_KEY = Uint8Array.of(0x09, 0x07, 0xc1, 0x2b).buffer;
  /** Compressed Flag */
  static readonly FLAG_COMPRESSED = 0x84;
  /** Uncompressed Flag */
  static readonly FLAG_NOT_COMPRESSED = 0x04;

  /** Cryptor */
  private browfish: Blowfish;
  /** Decrypted Data */
  private data: ArrayBuffer;
  /** Parsed Json Data */
  // private packedData: SymbolArtInterface;

  /**
   * Constructor
   */
  constructor() {
    this.browfish = new Blowfish(SymbolArt.BLOWFISH_KEY);
    /*
    this.packedData = {
      authorId: 0,
      name: '',
      size: {
        height: 0,
        width: 0,
      },
      layerCount: 0,
      sound: 0,
      layers: [],
    };
    */
    this.data = new Uint8Array();
  }

  /**
   * Output SymbolArt Data
   * @param buffer - Synbolart(*.sar) File array buffer.
   */
  load(buffer: ArrayBuffer) {
    /** binary */
    const u8a = new Uint8Array(buffer);

    // Header Check
    if (u8a[0] !== 0x73 || u8a[1] !== 0x61 || u8a[2] !== 0x72) {
      // sar
      throw new Error('[SymbolArt] not a SAR file');
    }
    const flag = u8a[3];
    if (
      flag !== SymbolArt.FLAG_COMPRESSED &&
      flag !== SymbolArt.FLAG_NOT_COMPRESSED
    ) {
      throw new Error(`[SymbolArt] invalid flag ${flag}`);
    }

    /** Remove file header */
    const source: Uint8Array = u8a.slice(4, buffer.byteLength);

    // Decrypt Blowfish
    this.data = this.browfish.decrypt(source.buffer);

    if (flag === SymbolArt.FLAG_COMPRESSED) {
      // Byte wise XOR by 0x95 of input from after flag bit
      // to the maximum multiple of 8 bytes on input
      this.data = this.decompress(source.map(v => v ^ 0x95).buffer);
    }
  }

  /** Sar to JSON */
  get json(): SymbolArtInterface {
    const sar = new SarParser();
    const registry = [sar.baseRegistry]
      .concat([])
      .reduce((a, v) => Object.assign(a, v), {});
    return sar.parseSar(new Cursor(this.data), registry);
  }

  /** Read from JSON */
  set json(data: SymbolArtInterface) {
    const uint8arr = new Uint8Array(
      8 + 16 * data.layerCount + 2 * data.name.length // In Bytes
    );

    let pos = 0;
    uint8arr[pos++] = data.authorId & 0xff;
    uint8arr[pos++] = (data.authorId >> 8) & 0xff;
    uint8arr[pos++] = (data.authorId >> 16) & 0xff;
    uint8arr[pos++] = (data.authorId >> 24) & 0xff;
    uint8arr[pos++] = data.layerCount & 0xff;
    uint8arr[pos++] = data.size.height & 0xff;
    uint8arr[pos++] = data.size.width & 0xff;
    uint8arr[pos++] = data.sound & 0xff;
    for (let i = 0; i < data.layers.length; i++) {
      const layer = data.layers[i];
      uint8arr[pos++] = layer.position.topLeft.x & 0xff;
      uint8arr[pos++] = layer.position.topLeft.y & 0xff;
      uint8arr[pos++] = layer.position.bottomLeft.x & 0xff;
      uint8arr[pos++] = layer.position.bottomLeft.y & 0xff;
      uint8arr[pos++] = layer.position.topRight.x & 0xff;
      uint8arr[pos++] = layer.position.topRight.y & 0xff;
      uint8arr[pos++] = layer.position.bottomRight.x & 0xff;
      uint8arr[pos++] = layer.position.bottomRight.y & 0xff;
      // Write condensed 32 bit layer properties
      uint8arr[pos++] = ((layer.color.g & 0x3) << 6) | layer.color.r;
      uint8arr[pos++] =
        ((layer.color.b & 0xf) << 4) | ((layer.color.g >> 2) & 0xf);
      uint8arr[pos++] =
        ((layer.symbol & 0x7) << 5) |
        (layer.opacity << 2) |
        ((layer.color.b >> 4) & 0x3);
      uint8arr[pos++] =
        ((layer.visibility ? 0 : 1) << 7) | ((layer.symbol >> 3) & 0x7f);
      // Write condensed 32 bit color X, Y, Z
      uint8arr[pos++] = ((layer.color.x & 0x3) << 6) | layer.color.y;
      uint8arr[pos++] =
        ((layer.color.z & 0xf) << 4) | ((layer.color.y >> 2) & 0xf);
      uint8arr[pos++] = (layer.color.z >> 4) & 0x3;
      uint8arr[pos++] = 0;
    }
    // Write Symbol Art name using UTF-16
    for (let i = 0; i < data.name.length; i++) {
      const charCode = data.name.charCodeAt(i);
      // Write lowerByte
      uint8arr[pos++] = charCode & 0xff;
      // Write upperByte
      uint8arr[pos++] = (charCode >> 8) & 0xff;
    }
    this.data = uint8arr;
  }

  /**
   * @param buffer - buffer to decompress
   */
  private decompress(buffer: ArrayBuffer): ArrayBuffer {
    const readCursor = new Cursor(buffer);
    const writeCursor = new Cursor();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let flag = readCursor.readBit();

      if (flag) {
        // literal byte
        writeCursor.writeUint8(readCursor.readUint8());
        continue;
      }

      let offset = 0;
      let size = 0;
      let isLongCopy = false;

      flag = readCursor.readBit();
      if (flag) {
        isLongCopy = true;
        // long copy or eof
        offset = readCursor.readUint16(true);
        if (offset === 0) {
          break;
        }
        size = offset & 7;
        offset = (offset >> 3) | -0x2000;
        if (size === 0) {
          const num3 = readCursor.readUint8();
          size = num3 + 10;
        } else {
          size += 2;
        }
      } else {
        // short copy
        flag = readCursor.readBit() ? 1 : 0;
        size = readCursor.readBit() ? 1 : 0;
        size = (size | (flag << 1)) + 2;

        offset = readCursor.readInt8() | -0x100;
      }

      // do the actual copy
      for (let i = 0; i < size; i++) {
        if (offset > 0) {
          throw new Error(
            `[SymbolArtParser] offset > 0 (${offset}) (isLongCopy === ${isLongCopy})`
          );
        }
        writeCursor.seek(offset);
        const newByte = writeCursor.readUint8();
        writeCursor.seek(-1);
        writeCursor.seek(-offset);
        writeCursor.writeUint8(newByte);
      }
    }

    return writeCursor.getBuffer().slice(0, writeCursor.getPosition());
  }
}
