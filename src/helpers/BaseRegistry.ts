import type RegistryInterface from '@/interfaces/RegistryInterface';
import type Cursor from '@/helpers/Cursor';

export default {
  u8: (cursor: Cursor) => cursor.readUint8(),
  u16: (cursor: Cursor) => cursor.readUint16(false),
  u32: (cursor: Cursor) => cursor.readUint32(false),
  u16le: (cursor: Cursor) => cursor.readUint16(true),
  u32le: (cursor: Cursor) => cursor.readUint32(true),
  i8: (cursor: Cursor) => cursor.readInt8(),
  i16: (cursor: Cursor) => cursor.readInt16(false),
  i32: (cursor: Cursor) => cursor.readInt32(false),
  i16le: (cursor: Cursor) => cursor.readInt16(true),
  i32le: (cursor: Cursor) => cursor.readInt32(true),
  f32: (cursor: Cursor) => cursor.readFloat32(false),
  f64: (cursor: Cursor) => cursor.readFloat64(false),
  f32le: (cursor: Cursor) => cursor.readFloat32(true),
  f64le: (cursor: Cursor) => cursor.readFloat64(true),
} satisfies RegistryInterface;
