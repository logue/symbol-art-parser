import type Cursor from '@/helpers/Cursor';
import type RegistryInterface from '@/interfaces/RegistryInterface';
import type { SchemaType } from './SchemaType';

export type ParsedValue = number | string | boolean | Record<string, unknown>;
export type SchemaNode =
  | SchemaType
  | Record<string, unknown>
  | ((cursor: Cursor, registry: Partial<RegistryInterface>) => ParsedValue);
