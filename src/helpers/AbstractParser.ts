import BaseRegistry from '@/helpers/BaseRegistry';
import Cursor from '@/helpers/Cursor';
import type { SchemaType } from '@/interfaces/RegistryInterface';
import type RegistryInterface from '@/interfaces/RegistryInterface';

/**
 * Abstract Parser.
 *
 * TypeScript version by Logue.
 * Original version written by HybridEidolon's saredit
 * @see https://github.com/HybridEidolon/saredit
 */
export default abstract class AbstractParser {
  protected readonly decoder = new TextDecoder('utf-16');

  /**
   * Get parsed struct
   * @param buffer - buffer to parse
   * @param schema - schema to parse with
   * @param registries - registries of schemas or parsers to use (including base registry)
   */
  parse(
    buffer: ArrayBuffer,
    schema: SchemaType,
    registries: RegistryInterface[] = []
  ) {
    const cursor = new Cursor(buffer);
    const registry = [BaseRegistry]
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
          schema: registry[schema as SchemaType],
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

        Object.keys(schema).forEach(k => {
          const v = schema[k];
          const value = this.parseAttribute({
            cursor: cursor,
            schema: v,
            registry: registry,
          });
          parsedObject[k] = value;
        });
        return parsedObject;
      }
    }
  }
}
