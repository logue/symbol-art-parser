import Cursor from '@/helpers/Cursor';
import type RegistryInterface from '@/interfaces/RegistryInterface';

/**
 * Abstract Parser.
 *
 * TypeScript version by Logue.
 * Original version written by HybridEidolon's saredit
 * @see https://github.com/HybridEidolon/saredit
 */
export default abstract class AbstractParser {
  readonly baseRegistry: RegistryInterface = {
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
  };

  /**
   * Get parsed struct
   * @param buffer - buffer to parse
   * @param schema - schema to parse with
   * @param registries - registries of schemas or parsers to use (including base registry)
   */
  parse(
    buffer: ArrayBuffer,
    schema: Object,
    registries: Object[] = []
  ): Object {
    const cursor = new Cursor(buffer);
    const registry = [this.baseRegistry]
      .concat(registries)
      .reduce((a, v) => Object.assign(a, v), {});

    return this.parseAttribute({ cursor, schema, registry });
  }

  /**
   * Goes through a schema object and fill its data in order based on cursor and registry
   * @param payload - attributes to parse
   */
  parseAttribute({
    cursor,
    schema,
    registry,
  }: {
    cursor: Cursor;
    schema: any;
    registry: RegistryInterface;
  }): any {
    switch (typeof schema) {
      case 'string': {
        // For positions, name, and other properties
        // References a schema/parser in the registry
        return this.parseAttribute({
          cursor: cursor,
          // @ts-ignore
          schema: registry[schema],
          registry: registry,
        });
      }
      case 'function': {
        // For color
        // Cursor parse function
        return schema(cursor, registry);
      }
      case 'object': {
        // For the object itself and position 2D vectors
        // Schema object. Parse every attribute.
        const parsedObject: Record<string, Function> = {};
        for (const k of Object.keys(schema)) {
          const v = schema[k];
          const value = this.parseAttribute({
            cursor: cursor,
            schema: v,
            registry: registry,
          });
          parsedObject[k] = value;
        }
        return parsedObject;
      }
    }
  }
}
