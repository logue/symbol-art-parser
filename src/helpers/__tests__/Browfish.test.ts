import { describe, expect, test } from '@rstest/core';
import Blowfish from '../Blowfish';

class BlowfishContext extends Blowfish {
  public getPTable(pointer: number) {
    return this.p[pointer];
  }
  public getSTable(bank: number, pointer: number) {
    return this.s[bank][pointer];
  }
  public getKey(pointer: number) {
    return this.key[pointer];
  }
}

describe('blowfish context', () => {
  test('create a proper p and s table', () => {
    const key = Uint8Array.of(9, 7, 193, 43);
    const b = new BlowfishContext(key.buffer);
    expect(b.getPTable(0)).toEqual(3684606895);
    expect(b.getPTable(1)).toEqual(403915684);

    expect(b.getSTable(0, 0)).toEqual(1437540708);
    expect(b.getSTable(0, 1)).toEqual(891499926);
  });

  test('parse a key', () => {
    const key = Uint8Array.of(0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00);
    const b = new BlowfishContext(key.buffer);
    expect(b.getKey(0)).toEqual(16777216);
    expect(b.getKey(1)).toEqual(16777216);
  });

  test('parse the pso2 sar key', () => {
    const key = Uint8Array.of(9, 7, 193, 43);
    const b = new BlowfishContext(key.buffer);
    expect(b.getKey(0)).toEqual(151503147);
  });

  test('decrypt a non-compressed sar', () => {
    const sar = Uint8Array.from([
      0x7d, 0xea, 0x89, 0x57, 0xa2, 0x0d, 0x28, 0x38, 0x69, 0xb0, 0x48, 0xcb,
      0xc8, 0x4a, 0x2a, 0x45, 0x16, 0x5f, 0xfc, 0xa2, 0x45, 0x4e, 0x63, 0x71,
      0x4a, 0x44, 0xe2, 0xba, 0x90, 0x74, 0x0c, 0x90, 0x4a, 0x44, 0xe2, 0xba,
      0x90, 0x74, 0x0c, 0x90, 0x4a, 0x44, 0xe2, 0xba, 0x90, 0x74, 0x0c, 0x90,
      0x41, 0x00,
    ]);
    const key = Uint8Array.of(9, 7, 193, 43);
    const b = new Blowfish(key.buffer);
    b.decrypt(sar.buffer);
    expect(sar).toEqual(
      Uint8Array.from([
        35, 242, 156, 0, 1, 128, 193, 0, 112, 112, 112, 144, 144, 112, 144, 144,
        0, 0, 28, 30, 0, 120, 0, 0, 65, 0, 65, 0, 65, 0, 65, 0, 65, 0, 65, 0,
        65, 0, 65, 0, 65, 0, 65, 0, 65, 0, 65, 0, 65, 0,
      ]),
    );
  });
});
