import LayerInterface from './LayerInterface';

export default interface SymbolArtInterface {
  /** アカウントID */
  authorId: number;
  /** シンボルアート名 */
  name: string;
  /** サイズ */
  size: {
    /** 高さ */
    height: number;
    /** 幅 */
    width: number;
  };
  /** レイヤー数 */
  layerCount: number;
  /** サウンド */
  sound: number;
  /** レイヤー */
  layers: LayerInterface[];
}
