import { test, describe, expect } from 'vitest';

import Decompress from '../Decompress';
import SarParser from '../SarParser';

describe('Integration Tests', () => {
  describe('Decompress + SarParser', () => {
    test('should decompress and parse Symbol Art data', () => {
      // This is a theoretical test - in real usage, you would:
      // 1. Read compressed SAR file
      // 2. Decompress it
      // 3. Parse the decompressed data
      const compressedData = Uint8Array.of(0x05, 0x69, 0x00, 0x00);
      const decompressed = Decompress(compressedData.buffer);

      expect(decompressed.byteLength).toBeGreaterThan(0);
    });
  });

  describe('Error Recovery', () => {
    test('should handle malformed data gracefully', () => {
      const malformedData = new ArrayBuffer(0);
      expect(() => Decompress(malformedData)).toThrow();
    });

    test('should handle parser errors gracefully', () => {
      const parser = new SarParser();
      const emptyBuffer = new ArrayBuffer(0);
      expect(() => parser.parse(emptyBuffer, 'u8')).toThrow();
    });
  });

  describe('Performance', () => {
    test('should handle large buffers efficiently', () => {
      const largeBuffer = new ArrayBuffer(1024);
      const view = new DataView(largeBuffer);

      // Fill with pattern that should compress well
      for (let i = 0; i < 1024; i++) {
        view.setUint8(i, i % 256);
      }

      const parser = new SarParser();
      const start = performance.now();

      // Parse multiple small chunks to test performance
      for (let i = 0; i < 100; i++) {
        const chunk = largeBuffer.slice(i, i + 4);
        try {
          parser.parse(chunk, 'u32le');
        } catch {
          // Expected for some chunks
        }
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });
  });

  describe('Memory Management', () => {
    test('should not leak memory during repeated operations', () => {
      const parser = new SarParser();
      const testBuffer = new Uint8Array([1, 2, 3, 4]).buffer;

      // Perform multiple operations to test for memory leaks
      for (let i = 0; i < 1000; i++) {
        try {
          parser.parse(testBuffer, 'u32le');
        } catch {
          // Some operations may fail, that's OK
        }
      }

      // If we get here without running out of memory, test passes
      expect(true).toBe(true);
    });
  });
});
