import LayerInterface from './LayerInterface';

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
  /** Layer count */
  layerCount: number;
  /** Effect Sound ID */
  sound: number;
  /** Layers */
  layers: LayerInterface[];
}
