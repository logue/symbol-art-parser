import { P_TABLE, S_TABLE } from './BlowfishConstants';

/**
 * Blowfish Cryptor class
 *
 * TypeScript version by Logue.
 * Original version written by HybridEidolon's saredit
 * @see https://github.com/HybridEidolon/saredit
 */
export default class Blowfish {
  /** P Table */
  private p: Uint32Array;
  /** S Table */
  private s: Uint32Array[];
  /** Crypt Key */
  private key: Uint32Array;

  /**
   * constructor
   * @param key - key as array of bytes. must be multiple of 4
   */
  constructor(key: ArrayBuffer) {
    const keyData = new DataView(key);
    const len = Math.floor(key.byteLength / Uint32Array.BYTES_PER_ELEMENT);
    const realKey = new Uint32Array(len);
    for (let i = 0; i < len; i++) {
      realKey[i] = keyData.getUint32(i * 4, false);
    }
    this.s = [
      S_TABLE[0].slice(),
      S_TABLE[1].slice(),
      S_TABLE[2].slice(),
      S_TABLE[3].slice(),
    ];
    this.p = P_TABLE.slice();
    this.key = realKey;

    let keyPos = 0;
    for (let i = 0; i < 18; i++) {
      this.p[i] ^= this.key[keyPos % this.key.length];
      keyPos++;
    }

    const lr = new ArrayBuffer(8);
    const lrView = new DataView(lr);
    for (let i = 0; i < 18; i += 2) {
      this.encrypt(lr);
      this.p[i] = lrView.getUint32(0, true);
      this.p[i + 1] = lrView.getUint32(4, true);
    }

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 256; j += 2) {
        this.encrypt(lr);
        this.s[i][j] = lrView.getUint32(0, true);
        this.s[i][j + 1] = lrView.getUint32(4, true);
      }
    }
  }
  /**
   * @param buffer - buffer to encrypt. must be multiple of 8
   */
  encrypt(buffer: ArrayBuffer): ArrayBuffer {
    const view = new DataView(buffer, 0, Math.floor(buffer.byteLength / 8) * 8);
    for (let i = 0; i < Math.floor(view.byteLength / 8); i++) {
      let l = view.getUint32(i * 8, true);
      let r = view.getUint32(i * 8 + 4, true);
      for (let ii = 0; ii < 16; ii += 2) {
        l ^= this.p[ii];
        r ^= this.round(this.s, l);
        r ^= this.p[ii + 1];
        l ^= this.round(this.s, r);
      }
      l ^= this.p[16];
      r ^= this.p[17];
      view.setUint32(i * 8, r, true);
      view.setUint32(i * 8 + 4, l, true);
    }
    return view.buffer;
  }

  /**
   * @param buffer - buffer to decrypt. must be multiple of 8
   */
  decrypt(buffer: ArrayBuffer): ArrayBuffer {
    const view = new DataView(buffer, 0, Math.floor(buffer.byteLength / 8) * 8);
    for (let i = 0; i < Math.floor(view.byteLength / 8); i++) {
      let l = view.getUint32(i * 8, true);
      let r = view.getUint32(i * 8 + 4, true);
      for (let ii = 16; ii > 0; ii -= 2) {
        l ^= this.p[ii + 1];
        r ^= this.round(this.s, l);
        r ^= this.p[ii];
        l ^= this.round(this.s, r);
      }
      l ^= this.p[1];
      r ^= this.p[0];
      view.setUint32(i * 8, r, true);
      view.setUint32(i * 8 + 4, l, true);
    }
    return view.buffer;
  }

  /**
   *
   * @param s - S Table
   * @param x - rounds
   * @returns
   */
  private round(s: Uint32Array[], x: number): number {
    const a = s[0][x >>> 24];
    const b = s[1][(x >>> 16) & 0xff];
    const c = s[2][(x >>> 8) & 0xff];
    const d = s[3][x & 0xff];
    const ret = ((a + b) ^ c) + d;
    return ret >>> 0;
  }
}
