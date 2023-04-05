/** Symbol Art Layer Interface */
export default interface LayerInterface {
  /** Symbol ID */
  symbol: number;
  /** Visibility */
  isVisible: boolean;
  /** Symbol Position */
  position: {
    topLeft: PositionType;
    bottomLeft: PositionType;
    topRight: PositionType;
    bottomRight: PositionType;
  };
  /** Alpha */
  a: number;
  /** Red */
  r: number;
  /** Green */
  g: number;
  /** Blue */
  b: number;
  /** X */
  x: number;
  /** Y */
  y: number;
  /** Z */
  z: number;
}

interface PositionType {
  x: number;
  y: number;
}
