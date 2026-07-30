import type { Layer } from '@/types/Layer';
import type { Sound } from '@/types/Sound';

/** Symbol Art JSON data */
export type SymbolArtData = {
  /** Account ID */
  authorId: number;
  /** Symbol art name */
  name: string;
  /** Symbol art size */
  size: {
    /** Height */
    height: number;
    /** Width */
    width: number;
  };
  /** Effect Sound ID */
  sound: Sound;
  /** Layers */
  layers: Layer[];
};
