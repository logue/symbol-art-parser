import { test, describe, expect, beforeEach } from 'vitest';

import BaseRegistry from '../BaseRegistry';
import Cursor from '../Cursor';

describe('BaseRegistry', () => {
  let cursor: Cursor;

  beforeEach(() => {
    cursor = new Cursor();
  });

  describe('unsigned integers', () => {
    test('should read u8', () => {
      cursor.writeUint8(255);
      cursor.seek(-1); // Reset position
      expect(BaseRegistry.u8?.(cursor)).toBe(255);
    });

    test('should read u16 big endian', () => {
      cursor.writeUint16(0x1234, false);
      cursor.seek(-2); // Reset position
      expect(BaseRegistry.u16?.(cursor)).toBe(0x1234);
    });

    test('should read u16 little endian', () => {
      cursor.writeUint16(0x1234, true);
      cursor.seek(-2); // Reset position
      expect(BaseRegistry.u16le?.(cursor)).toBe(0x1234);
    });

    test('should read u32 big endian', () => {
      cursor.writeUint32(0x12345678, false);
      cursor.seek(-4); // Reset position
      expect(BaseRegistry.u32?.(cursor)).toBe(0x12345678);
    });

    test('should read u32 little endian', () => {
      cursor.writeUint32(0x12345678, true);
      cursor.seek(-4); // Reset position
      expect(BaseRegistry.u32le?.(cursor)).toBe(0x12345678);
    });
  });

  describe('signed integers', () => {
    test('should read i8', () => {
      cursor.writeInt8(-128);
      cursor.seek(-1); // Reset position
      expect(BaseRegistry.i8?.(cursor)).toBe(-128);
    });

    test('should read i16 big endian', () => {
      cursor.writeInt16(-32768, false);
      cursor.seek(-2); // Reset position
      expect(BaseRegistry.i16?.(cursor)).toBe(-32768);
    });

    test('should read i16 little endian', () => {
      cursor.writeInt16(-32768, true);
      cursor.seek(-2); // Reset position
      expect(BaseRegistry.i16le?.(cursor)).toBe(-32768);
    });

    test('should read i32 big endian', () => {
      cursor.writeInt32(-2147483648, false);
      cursor.seek(-4); // Reset position
      expect(BaseRegistry.i32?.(cursor)).toBe(-2147483648);
    });

    test('should read i32 little endian', () => {
      cursor.writeInt32(-2147483648, true);
      cursor.seek(-4); // Reset position
      expect(BaseRegistry.i32le?.(cursor)).toBe(-2147483648);
    });
  });

  describe('floating point numbers', () => {
    test('should read f32 big endian', () => {
      cursor.writeFloat32(3.14159, false);
      cursor.seek(-4); // Reset position
      expect(BaseRegistry.f32?.(cursor)).toBeCloseTo(3.14159);
    });

    test('should read f32 little endian', () => {
      cursor.writeFloat32(3.14159, true);
      cursor.seek(-4); // Reset position
      expect(BaseRegistry.f32le?.(cursor)).toBeCloseTo(3.14159);
    });

    test('should read f64 big endian', () => {
      cursor.writeFloat64(3.141592653589793, false);
      cursor.seek(-8); // Reset position
      expect(BaseRegistry.f64?.(cursor)).toBeCloseTo(3.141592653589793);
    });

    test('should read f64 little endian', () => {
      cursor.writeFloat64(3.141592653589793, true);
      cursor.seek(-8); // Reset position
      expect(BaseRegistry.f64le?.(cursor)).toBeCloseTo(3.141592653589793);
    });
  });

  describe('edge cases', () => {
    test('should handle zero values', () => {
      cursor.writeUint8(0);
      cursor.seek(-1);
      expect(BaseRegistry.u8?.(cursor)).toBe(0);
    });

    test('should handle maximum values', () => {
      cursor.writeUint8(255);
      cursor.seek(-1);
      expect(BaseRegistry.u8?.(cursor)).toBe(255);
    });
  });
});
