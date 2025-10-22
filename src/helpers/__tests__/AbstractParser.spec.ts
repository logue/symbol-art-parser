import { test, describe, expect, beforeEach } from 'vitest';

import AbstractParser from '../AbstractParser';

// テスト用の具象クラス
class TestParser extends AbstractParser {
  // AbstractParserのテストのため、空の実装
}

describe('AbstractParser', () => {
  let parser: TestParser;

  beforeEach(() => {
    parser = new TestParser();
  });

  describe('primitive parsing', () => {
    test('should parse u8', () => {
      const buffer = new Uint8Array([255]).buffer;
      const result = parser.parse(buffer, 'u8');
      expect(result).toBe(255);
    });

    test('should parse u16', () => {
      const buffer = new Uint8Array([0x12, 0x34]).buffer;
      const result = parser.parse(buffer, 'u16');
      expect(result).toBe(0x1234);
    });

    test('should parse u32', () => {
      const buffer = new Uint8Array([0x12, 0x34, 0x56, 0x78]).buffer;
      const result = parser.parse(buffer, 'u32');
      expect(result).toBe(0x12345678);
    });

    test('should parse signed integers', () => {
      const buffer = new Uint8Array([0xff]).buffer;
      const result = parser.parse(buffer, 'i8');
      expect(result).toBe(-1);
    });

    test('should parse little endian', () => {
      const buffer = new Uint8Array([0x34, 0x12]).buffer;
      const result = parser.parse(buffer, 'u16le');
      expect(result).toBe(0x1234);
    });

    test('should parse floating point', () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setFloat32(0, 3.14159, false);

      const result = parser.parse(buffer, 'f32');
      expect(result).toBeCloseTo(3.14159);
    });
  });

  describe('error handling', () => {
    test('should throw on buffer underrun', () => {
      const buffer = new Uint8Array([1]).buffer;
      expect(() => parser.parse(buffer, 'u32')).toThrow();
    });

    test('should throw on empty buffer for required data', () => {
      const buffer = new ArrayBuffer(0);
      expect(() => parser.parse(buffer, 'u8')).toThrow();
    });
  });

  describe('edge cases', () => {
    test('should handle zero values', () => {
      const buffer = new Uint8Array([0]).buffer;
      const result = parser.parse(buffer, 'u8');
      expect(result).toBe(0);
    });

    test('should handle maximum values', () => {
      const buffer = new Uint8Array([255]).buffer;
      const result = parser.parse(buffer, 'u8');
      expect(result).toBe(255);
    });
  });
});
