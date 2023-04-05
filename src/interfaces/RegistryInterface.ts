import type Cursor from '@/helpers/Cursor';

/** RegistryInterface */
export default interface RegistryInterface {
  /** unsigned int8 */
  u8?: (cursor: Cursor) => number;
  /** unsigned int16 */
  u16?: (cursor: Cursor) => number;
  /** unsigned int32 */
  u32?: (cursor: Cursor) => number;
  /** unsigned int16 little endian */
  u16le?: (cursor: Cursor) => number;
  /** unsigned int32 little endian */
  u32le?: (cursor: Cursor) => number;
  /** int8 */
  i8?: (cursor: Cursor) => number;
  /** int16 */
  i16?: (cursor: Cursor) => number;
  /** int32 */
  i32?: (cursor: Cursor) => number;
  /** int16 little endian */
  i16le?: (cursor: Cursor) => number;
  /** int32 little endian */
  i32le?: (cursor: Cursor) => number;
  /** float32 */
  f32?: (cursor: Cursor) => number;
  /** float64 */
  f64?: (cursor: Cursor) => number;
  /** float32 little endian */
  f32le?: (cursor: Cursor) => number;
  /** float64 little endian */
  f64le?: (cursor: Cursor) => number;
}

export type SchemaType =
  | 'u8'
  | 'u16'
  | 'u32'
  | 'u16le'
  | 'u32le'
  | 'i8'
  | 'i16'
  | 'i32'
  | 'i16le'
  | 'i32le'
  | 'f32'
  | 'f64'
  | 'f32le'
  | 'f64le';
