import type { Position } from '@/types/PositionType';

/** Symbol Art Layer Interface */
export default interface LayerInterface {
  /** Symbol ID */
  symbol: number;
  /** Visibility */
  isVisible: boolean;
  /** Symbol Position */
  position: Position;
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
