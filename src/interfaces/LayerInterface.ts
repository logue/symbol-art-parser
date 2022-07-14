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
  /** Alpha Channel */
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
    r2: number;
    /** Additional Color bytes for green */
    g2: number;
    /** Additional Color bytes for blue */
    b2: number;
  };
}
