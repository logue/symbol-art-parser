import LayerPositionInterface from './LayerPositionInterface';

/** Symbol Art Layer Interface */
export default interface LayerInterface {
  /** Symbol ID */
  symbol: number;
  /** Visibility */
  visibility: boolean;
  /** Symbol Position */
  position: {
    topLeft: LayerPositionInterface;
    bottomLeft: LayerPositionInterface;
    topRight: LayerPositionInterface;
    bottomRight: LayerPositionInterface;
  };
  /** Opacity */
  opacity: number;
  /** Symbol Color */
  color: {
    /** Red */
    r: number;
    /** Green */
    g: number;
    /** Blue */
    b: number;
    /** Additional Color bytes for red */
    x: number;
    /** Additional Color bytes for green */
    y: number;
    /** Additional Color bytes for blue */
    z: number;
  };
  /** Hex Color */
  rgb: string;
}
