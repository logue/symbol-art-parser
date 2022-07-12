import LayerPositionInterface from './LayerPositionInterface';

export default interface LayerInterface {
  symbolIndex: number;
  color: number[];
  visible: boolean;
  position: {
    topLeft: LayerPositionInterface;
    bottomLeft: LayerPositionInterface;
    topRight: LayerPositionInterface;
    bottomRight: LayerPositionInterface;
  };
  colorX: number;
  colorY: number;
  colorZ: number;
}
