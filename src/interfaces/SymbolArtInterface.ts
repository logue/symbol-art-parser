import LayerInterface from './LayerInterface';
import { SoundType } from './SoundType';

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
