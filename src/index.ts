import type SymbolArtInterface from '@/interfaces/SymbolArtInterface';

import Meta from '@/Meta';
import BaseRegistry from '@/helpers/BaseRegistry';
import Blowfish from '@/helpers/Blowfish';
import Cursor from '@/helpers/Cursor';
import Decompress from '@/helpers/Decompress';
import SarParser from '@/helpers/SarParser';
import Sounds from '@/interfaces/SoundType';

/** SymbolArt Class */
export default class SymbolArt {
  /** Get Version */
  public static readonly version = Meta.version;
  /** Get Build Date */
  public static readonly build = Meta.date;

  /** Sar file Magic number */
  private static readonly FILE_MAGIC_NUMBER: number[] = Array.from('sar').map(
    c => c.charCodeAt(0)
  );

  /** Decrypt Key */
  private static readonly BLOWFISH_KEY = Uint8Array.of(0x09, 0x07, 0xc1, 0x2b)
    .buffer;

  /** Compressed Flag */
  private static readonly FLAG_COMPRESSED = 0x84;
  /** Uncompressed Flag */
  private static readonly FLAG_NOT_COMPRESSED = 0x04;

  /** Cryptor */
  private readonly browfish: Blowfish;
  /** Decrypted Data */
  private decrypted: ArrayBuffer;

  /**
   * Constructor
   */
  constructor() {
    this.browfish = new Blowfish(SymbolArt.BLOWFISH_KEY);
    this.decrypted = new ArrayBuffer();
  }

  /**
   * Get SymbolArt Data
   */
  get data(): ArrayBuffer {
    /** File Header */
    const header = new ArrayBuffer(4);
    const headerView = new Uint8Array(header);
    SymbolArt.FILE_MAGIC_NUMBER.forEach(
      (value, index) => (headerView[index] = value)
    );
    headerView[3] = SymbolArt.FLAG_NOT_COMPRESSED;
    /** Crypted Data */
    const data = this.browfish.encrypt(this.decrypted);
    // Prepend crypted data to file header
    return this.appendBuffer(header, data);
  }

  /**
   * Set SymbolArt Data
   *
   * @param buffer - Synbolart(*.sar) File array buffer.
   */
  set data(buffer: ArrayBuffer) {
    /** binary */
    const u8a = new Uint8Array(buffer);

    // Header Check
    if (
      u8a[0] !== SymbolArt.FILE_MAGIC_NUMBER[0] ||
      u8a[1] !== SymbolArt.FILE_MAGIC_NUMBER[1] ||
      u8a[2] !== SymbolArt.FILE_MAGIC_NUMBER[2]
    ) {
      // sar
      throw new Error('[SymbolArt.data] not a SAR file');
    }
    const flag = u8a[3];
    if (
      flag !== undefined &&
      flag !== SymbolArt.FLAG_COMPRESSED &&
      flag !== SymbolArt.FLAG_NOT_COMPRESSED
    ) {
      throw new Error(`[SymbolArt.data] invalid flag ${flag.toString()}`);
    }

    /** Remove file header */
    const source = u8a.slice(4, buffer.byteLength);

    // Decrypt Blowfish
    this.decrypted = this.browfish.decrypt(source.buffer);

    if (flag === SymbolArt.FLAG_COMPRESSED) {
      // Byte wise XOR by 0x95 of input from after flag bit
      // to the maximum multiple of 8 bytes on input
      const xorBuffer = source.map(v => v ^ 0x95);
      this.decrypted = Decompress(xorBuffer.buffer);
    }
  }

  /** Get JSON Parsed SymbolArt Data */
  get json(): SymbolArtInterface {
    const sar = new SarParser();
    const registry = { ...BaseRegistry };
    return sar.parseSar(new Cursor(this.decrypted), registry);
  }

  /**
   * Set Symbolart Data from JSON
   *
   * @param data - Symbol Art JSON data
   */
  set json(data: SymbolArtInterface) {
    const layerCount = data.layers.length;
    const buffer = new ArrayBuffer(
      8 + 16 * layerCount + 2 * data.name.length // In Bytes
    );
    const uint8arr = new Uint8Array(buffer);

    let pos = 0;
    uint8arr[pos++] = data.authorId & 0xff;
    uint8arr[pos++] = (data.authorId >> 8) & 0xff;
    uint8arr[pos++] = (data.authorId >> 16) & 0xff;
    uint8arr[pos++] = (data.authorId >> 24) & 0xff;
    uint8arr[pos++] = layerCount & 0xff;
    uint8arr[pos++] = data.size.height & 0xff;
    uint8arr[pos++] = data.size.width & 0xff;
    uint8arr[pos++] = (Sounds[data.sound] ?? 1) & 0xff;

    data.layers.forEach(layer => {
      uint8arr[pos++] = layer.position.topLeft.x & 0xff;
      uint8arr[pos++] = layer.position.topLeft.y & 0xff;
      uint8arr[pos++] = layer.position.bottomLeft.x & 0xff;
      uint8arr[pos++] = layer.position.bottomLeft.y & 0xff;
      uint8arr[pos++] = layer.position.topRight.x & 0xff;
      uint8arr[pos++] = layer.position.topRight.y & 0xff;
      uint8arr[pos++] = layer.position.bottomRight.x & 0xff;
      uint8arr[pos++] = layer.position.bottomRight.y & 0xff;
      // Write condensed 32 bit layer properties
      uint8arr[pos++] = ((layer.g & 0x3) << 6) | layer.r;
      uint8arr[pos++] = ((layer.b & 0xf) << 4) | ((layer.g >> 2) & 0xf);
      uint8arr[pos++] =
        ((layer.symbol & 0x7) << 5) | (layer.a << 2) | ((layer.b >> 4) & 0x3);
      uint8arr[pos++] =
        ((layer.isVisible ? 0 : 1) << 7) | ((layer.symbol >> 3) & 0x7f);
      // Write condensed 32 bit color X, Y, Z
      uint8arr[pos++] = ((layer.y & 0x3) << 6) | layer.x;
      uint8arr[pos++] = ((layer.z & 0xf) << 4) | ((layer.y >> 2) & 0xf);
      uint8arr[pos++] = (layer.z >> 4) & 0x3;
      uint8arr[pos++] = 0;
    });
    // Write Symbol Art name using UTF-16
    for (let i = 0; i < data.name.length; i++) {
      const charCode = data.name.charCodeAt(i);
      // Write lowerByte
      uint8arr[pos++] = charCode & 0xff;
      // Write upperByte
      uint8arr[pos++] = (charCode >> 8) & 0xff;
    }
    this.decrypted = buffer;
  }

  /**
   * Creates a new Uint8Array based on two different ArrayBuffers
   *
   * @param  buffer1 - The first buffer.
   * @param  buffer2 - The second buffer.
   */
  private appendBuffer(
    buffer1: ArrayBuffer,
    buffer2: ArrayBuffer
  ): ArrayBuffer {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
  }
}
