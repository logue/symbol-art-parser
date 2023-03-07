import type LayerInterface from '@/interfaces/LayerInterface';
import type { SoundType } from '@/interfaces/SoundType';

export default interface SymbolArtInterface {
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
  sound: SoundType;
  /** Layers */
  layers: LayerInterface[];
}
