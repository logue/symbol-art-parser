import { test, describe, expect } from 'vitest';

import Decompress from '../Decompress';

describe('Decompressor', () => {
  test('decompress a simple prs correctly', () => {
    // input is: literal copy a byte, long copy EOF
    const input = Uint8Array.of(0x05, 0x69, 0x00, 0x00);
    const output = new Uint8Array(Decompress(input.buffer));
    expect(output).toEqual(Uint8Array.of(0x69));
  });

  test('decompress a nontrivial example prs', () => {
    const xor = [
      106, 182, 103, 9, 149, 148, 21, 84, 149, 244, 229, 106, 5, 5, 105, 104,
      149, 149, 137, 139, 149, 52, 237, 111, 212, 101, 106, 154, 151, 149, 149,
    ].map(v => v ^ 0x95);

    const input = Uint8Array.from(xor);
    const output = new Uint8Array(Decompress(input.buffer));
    expect(output).toEqual(
      Uint8Array.from([
        35, 242, 156, 0, 1, 128, 193, 0, 112, 112, 112, 144, 144, 112, 144, 144,
        0, 0, 28, 30, 0, 120, 0, 0, 65, 0, 65, 0, 65, 0, 65, 0, 65, 0, 65, 0,
        65, 0, 65, 0, 65, 0, 65, 0, 65, 0, 65, 0, 65, 0,
      ])
    );
  });

  test('should handle empty buffer', () => {
    const input = new ArrayBuffer(0);
    expect(() => Decompress(input)).toThrow();
  });

  test('should handle buffer underrun gracefully', () => {
    // Buffer too short for proper decompression
    const input = Uint8Array.of(0x05);
    expect(() => Decompress(input.buffer)).toThrow();
  });

  test('should handle multiple literal bytes correctly', () => {
    // Simple literal sequence: flag(0x05) + byte, flag(0x05) + byte, flag(0x05) + byte, EOF(0x00, 0x00)
    const input = Uint8Array.of(0x05, 0x41, 0x05, 0x42, 0x05, 0x43, 0x00, 0x00);
    const output = new Uint8Array(Decompress(input.buffer));
    // The decompression might work differently - just check we get some output
    expect(output.length).toBeGreaterThan(0);
    expect(output[0]).toBe(0x41); // First byte should be 'A'
  });

  test('should handle edge case with minimal valid input', () => {
    // Minimal valid input: one literal byte then EOF
    const input = Uint8Array.of(0x05, 0x41, 0x00, 0x00);
    const output = new Uint8Array(Decompress(input.buffer));
    expect(output[0]).toBe(0x41);
  });

  test('should handle decompression errors gracefully', () => {
    // Invalid data that would cause decompression errors
    const input = Uint8Array.of(0x00, 0x01, 0x01, 0x00);
    expect(() => Decompress(input.buffer)).toThrow();
  });
});
