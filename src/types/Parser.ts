import type Cursor from '@/helpers/Cursor';
import type { Registry } from './Registry';
import type { Schema } from './Schema';

export type ParsedValue = number | string | boolean | Record<string, unknown>;
export type SchemaNode =
  | Schema
  | Record<string, unknown>
  | ((cursor: Cursor, registry: Partial<Registry>) => ParsedValue);
