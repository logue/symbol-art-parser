import type { ParsedValue, SchemaNode } from '@/types/Parser';
import type { Registry } from '@/types/Registry';
import BaseRegistry from './BaseRegistry';
import Cursor from './Cursor';

/**
 * Abstract Parser.
 *
 * TypeScript version by Logue.
 * Original version written by HybridEidolon's saredit
 * @see https://github.com/HybridEidolon/saredit
 */
export default abstract class AbstractParser {
  protected readonly decoder = new TextDecoder('utf-16le');

  /**
   * Get parsed struct
   * @param buffer - buffer to parse
   * @param schema - schema to parse with
   * @param registries - registries of schemas or parsers to use (including base registry)
   */
  parse(
    buffer: ArrayBuffer,
    schema: SchemaNode,
    registries: Partial<Registry>[] = [],
  ): ParsedValue {
    const cursor = new Cursor(buffer);

    const registry = [BaseRegistry, ...registries].reduce<Registry>(
      (accumulator, value) => Object.assign(accumulator, value),
      {} as Registry,
    );

    return this.parseAttribute({ cursor, schema, registry });
  }

  /**
   * Goes through a schema object and fill its data in order based on cursor and registry
   * @param payload - attributes to parse
   */
  public parseAttribute({
    cursor,
    schema,
    registry,
  }: {
    cursor: Cursor;
    schema: SchemaNode;
    registry: Partial<Registry>;
  }): ParsedValue {
    switch (typeof schema) {
      case 'string': {
        const registryValue =
          registry[schema as keyof Registry] ??
          BaseRegistry[schema as keyof Registry];

        if (typeof registryValue !== 'function') {
          throw new TypeError(`[SymbolArtParser] Unknown schema: ${schema}`);
        }

        return this.parseAttribute({
          cursor,
          schema: registryValue,
          registry,
        }) as ParsedValue;
      }
      case 'function': {
        return schema(cursor, registry) as ParsedValue;
      }
      case 'object': {
        if (schema === null) {
          throw new TypeError('[SymbolArtParser] Invalid schema: null');
        }

        const parsedObject: Record<string, ParsedValue> = {};
        const schemaObject = schema as Record<string, SchemaNode>;

        Object.entries(schemaObject).forEach(([key, value]) => {
          parsedObject[key] = this.parseAttribute({
            cursor,
            schema: value,
            registry,
          });
        });
        return parsedObject;
      }
      default: {
        throw new TypeError(
          `[SymbolArtParser] Unsupported schema type: ${typeof schema}`,
        );
      }
    }
  }
}
