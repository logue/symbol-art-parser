import { test, describe, expect } from 'vitest';

import Cursor from '../Cursor';

describe('Cursor', () => {
  test('should initialize with default buffer', () => {
    const cursor = new Cursor();
    expect(cursor.getPosition()).toBe(0);
    expect(cursor.getBuffer().byteLength).toBe(64);
  });

  test('should initialize with provided buffer', () => {
    const buffer = new ArrayBuffer(128);
    const cursor = new Cursor(buffer);
    expect(cursor.getPosition()).toBe(0);
    expect(cursor.getBuffer().byteLength).toBe(128);
  });

  describe('bit operations', () => {
    test('should read bits correctly', () => {
      const buffer = new ArrayBuffer(1);
      const view = new DataView(buffer);
      view.setUint8(0, 0b10101010); // 170 in decimal

      const cursor = new Cursor(buffer);

      // Read bits from LSB to MSB
      expect(cursor.readBit()).toBe(0);
      expect(cursor.readBit()).toBe(1);
      expect(cursor.readBit()).toBe(0);
      expect(cursor.readBit()).toBe(1);
      expect(cursor.readBit()).toBe(0);
      expect(cursor.readBit()).toBe(1);
      expect(cursor.readBit()).toBe(0);
      expect(cursor.readBit()).toBe(1);
    });
  });

  describe('read operations', () => {
    test('should read uint8', () => {
      const buffer = new ArrayBuffer(1);
      const view = new DataView(buffer);
      view.setUint8(0, 255);

      const cursor = new Cursor(buffer);
      expect(cursor.readUint8()).toBe(255);
      expect(cursor.getPosition()).toBe(1);
    });

    test('should read uint16 big endian', () => {
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer);
      view.setUint16(0, 0x1234, false);

      const cursor = new Cursor(buffer);
      expect(cursor.readUint16(false)).toBe(0x1234);
      expect(cursor.getPosition()).toBe(2);
    });

    test('should read uint16 little endian', () => {
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer);
      view.setUint16(0, 0x1234, true);

      const cursor = new Cursor(buffer);
      expect(cursor.readUint16(true)).toBe(0x1234);
      expect(cursor.getPosition()).toBe(2);
    });

    test('should read int8', () => {
      const buffer = new ArrayBuffer(1);
      const view = new DataView(buffer);
      view.setInt8(0, -128);

      const cursor = new Cursor(buffer);
      expect(cursor.readInt8()).toBe(-128);
      expect(cursor.getPosition()).toBe(1);
    });

    test('should read float32', () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setFloat32(0, 3.14159, false);

      const cursor = new Cursor(buffer);
      expect(cursor.readFloat32(false)).toBeCloseTo(3.14159);
      expect(cursor.getPosition()).toBe(4);
    });
  });

  describe('write operations', () => {
    test('should write uint8', () => {
      const cursor = new Cursor();
      cursor.writeUint8(255);
      expect(cursor.getPosition()).toBe(1);

      const view = new DataView(cursor.getBuffer());
      expect(view.getUint8(0)).toBe(255);
    });

    test('should write uint16', () => {
      const cursor = new Cursor();
      cursor.writeUint16(0x1234, false);
      expect(cursor.getPosition()).toBe(2);

      const view = new DataView(cursor.getBuffer());
      expect(view.getUint16(0, false)).toBe(0x1234);
    });

    test('should extend buffer when needed', () => {
      const cursor = new Cursor(new ArrayBuffer(1));
      cursor.writeUint16(0x1234, false);
      expect(cursor.getBuffer().byteLength).toBeGreaterThan(1);
    });
  });

  describe('seek operations', () => {
    test('should seek forward', () => {
      const cursor = new Cursor();
      cursor.seek(10);
      expect(cursor.getPosition()).toBe(10);
    });

    test('should throw error on invalid seek', () => {
      const cursor = new Cursor(new ArrayBuffer(10));
      expect(() => cursor.seek(20)).toThrow();
      expect(() => cursor.seek(-5)).toThrow();
    });
  });

  describe('edge cases', () => {
    test('should handle buffer extension', () => {
      const cursor = new Cursor(new ArrayBuffer(1));
      const originalSize = cursor.getBuffer().byteLength;

      // Write more data than buffer can hold
      for (let i = 0; i < 10; i++) {
        cursor.writeUint8(i);
      }

      expect(cursor.getBuffer().byteLength).toBeGreaterThan(originalSize);
      expect(cursor.getPosition()).toBe(10);
    });
  });
});
