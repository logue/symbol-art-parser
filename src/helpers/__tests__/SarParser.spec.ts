import { test, describe, expect } from 'vitest';

import Cursor from '../Cursor';
import SarParser from '../SarParser';

import type RegistryInterface from '../../interfaces/RegistryInterface';

const parser = new SarParser();
/**
 *
 * @param schema - Schema Type
 * @param array -
 * @param expected -
 * @param registries - Registry array
 */
function doTest(
  schema: any,
  array: any,
  expected: any,
  registries: RegistryInterface[] = []
): void {
  test(`schema ${schema} parses buffer to ${expected}`, () => {
    const buf = Uint8Array.from(array);
    const parsed = parser.parse(buf.buffer, schema, registries);
    if (typeof expected === 'number') {
      expect(parsed).toBeCloseTo(expected);
    } else {
      expect(parsed).toEqual(expected);
    }
  });
}

describe('struct parser', () => {
  describe('primitives', () => {
    doTest('u8', [4], 4);
    doTest('u16', [0, 4], 4);
    doTest('u32', [0, 0, 0, 4], 4);
    doTest('u16le', [4, 0], 4);
    doTest('u32le', [4, 0, 0, 0], 4);
    doTest('i8', [255], -1);
    doTest('i16', [255, 254], -2);
    doTest('i32', [255, 255, 255, 254], -2);
    doTest('i16le', [254, 255], -2);
    doTest('i32le', [254, 255, 255, 255], -2);

    doTest('f32', [64, 131, 51, 51], 4.1);
    doTest('f32le', [51, 51, 131, 64], 4.1);
    doTest('f64', [102, 102, 102, 102, 102, 102, 16, 64].reverse(), 4.1);
    doTest('f64le', [102, 102, 102, 102, 102, 102, 16, 64], 4.1);
  });

  // Actual schemas
  describe('object schemas', () => {
    doTest({ val: 'u8' }, [4], { val: 4 });
    doTest({ val: { val2: 'u8' } }, [4], { val: { val2: 4 } });
    doTest({ val: { val2: { val3: 'u8' } } }, [4], {
      val: { val2: { val3: 4 } },
    });
    doTest({ val: { val2: 'i8' }, val2: 'i8' }, [4, 255], {
      val: { val2: 4 },
      val2: -1,
    });
  });

  describe('complex schemas', () => {
    test('should handle nested structures', () => {
      const buffer = new Uint8Array([1, 2, 3]).buffer;
      const cursor = new Cursor(buffer);
      const schema = { nested: { x: 'u8', y: 'u8' }, z: 'u8' };
      const parsed = parser.parseAttribute({ cursor, schema, registry: {} });
      expect(parsed).toHaveProperty('nested');
      expect(parsed).toHaveProperty('z');
    });
  });

  describe('error handling', () => {
    test('should handle invalid buffer', () => {
      const buf = new ArrayBuffer(0);
      expect(() => parser.parse(buf, 'u8', [])).toThrow();
    });

    test('should handle buffer underrun', () => {
      const buf = Uint8Array.from([1]).buffer;
      expect(() => parser.parse(buf, 'u32', [])).toThrow();
    });
  });

  describe('edge cases', () => {
    doTest('u8', [0], 0);
    doTest('u8', [255], 255);
    doTest('i8', [128], -128);
    doTest('i8', [127], 127);
  });
});
