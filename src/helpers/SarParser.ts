import LayerInterface from '../interfaces/LayerInterface';
import RegistryInterface, {
  SchemaType,
} from '../interfaces/RegistoryInterface';
import SymbolArtInterface from '../interfaces/SymbolArtInterface';
import AbstractParser from './AbstractParser';
import Cursor from './Cursor';

/**
 * Sar Parser
 *
 * TypeScript version by Logue.
 * Original version written by HybridEidolon's saredit
 * @see https://github.com/HybridEidolon/saredit
 */
export default class SarParser extends AbstractParser {
  private pointSchema: Record<string, SchemaType> = {
    x: 'u8',
    y: 'u8',
  };

  private layerSchema = {
    points: {
      topLeft: this.pointSchema,
      bottomLeft: this.pointSchema,
      topRight: this.pointSchema,
      bottomRight: this.pointSchema,
    },
    props: (cursor: Cursor, registry: RegistryInterface) => {
      const val1 = this.parseAttribute({
        cursor: cursor,
        schema: 'u32le',
        registry: registry,
      });
      const val2 = this.parseAttribute({
        cursor: cursor,
        schema: 'u32le',
        registry: registry,
      });

      const visible = !(val1 >> 31);
      const textureIndex = (val1 >> 21) & 1023;
      const transparency = (val1 >> 18) & 7;
      const colorR = (val1 >> 0) & 63;
      const colorG = (val1 >> 6) & 63;
      const colorB = (val1 >> 12) & 63;

      const colorX = (val2 >> 0) & 63;
      const colorY = (val2 >> 6) & 63;
      const colorZ = (val2 >> 12) & 63;

      return {
        visible,
        textureIndex,
        transparency,
        colorR,
        colorG,
        colorB,
        colorX,
        colorY,
        colorZ,
      };
    },
  };

  /** Sar file Schema. */
  parseSar(cursor: Cursor, registry: RegistryInterface): SymbolArtInterface {
    const authorId = this.parseAttribute({
      cursor: cursor,
      schema: 'u32le',
      registry: registry,
    });
    const layerCount = this.parseAttribute({
      cursor: cursor,
      schema: 'u8',
      registry: registry,
    });
    const sizeHeight = this.parseAttribute({
      cursor: cursor,
      schema: 'u8',
      registry: registry,
    });
    const sizeWidth = this.parseAttribute({
      cursor: cursor,
      schema: 'u8',
      registry: registry,
    });
    const soundEffect = this.parseAttribute({
      cursor: cursor,
      schema: 'u8',
      registry: registry,
    });
    const layers: LayerInterface[] = [];

    for (let i = 0; i < layerCount; i++) {
      const layer = this.parseAttribute({
        cursor: cursor,
        schema: this.layerSchema,
        registry: registry,
      });
      layers.push({
        symbol: layer.props.textureIndex,
        visibility: layer.props.visible,
        position: layer.points,
        opacity: layer.props.transparency,
        rgb: this.rgb2Hex(
          layer.props.colorR,
          layer.props.colorG,
          layer.props.colorB
        ),
        color: {
          r: layer.props.colorR,
          g: layer.props.colorG,
          b: layer.props.colorB,
          x: layer.props.colorX,
          y: layer.props.colorY,
          z: layer.props.colorZ,
        },
      });
    }

    const name = [];
    // Read rest of buffer into Symbol Art name
    const startPos = cursor.getPosition();
    for (let i = 0; i < (cursor.getDataView().byteLength - startPos) / 2; i++) {
      try {
        const c = this.parseAttribute({
          cursor: cursor,
          schema: 'u16le',
          registry: registry,
        });
        name.push(c);
      } catch (e) {
        break;
      }
    }

    const decoder = new TextDecoder('utf-16');
    const dataView = new DataView(Uint16Array.from(name).buffer);

    return {
      authorId,
      name: decoder.decode(dataView),
      sound: soundEffect,
      size: {
        height: sizeHeight,
        width: sizeWidth,
      },
      layerCount,
      layers,
    };
  }

  /**
   * Get RGB Hex
   * @param red - Red
   * @param green - Green
   * @param blue - Blue
   * @returns
   */
  private rgb2Hex(red: number, green: number, blue: number): string {
    return `${this.numberToHex(red * 4)}${this.numberToHex(
      green * 4
    )}${this.numberToHex(blue * 4)}`;
  }

  /**
   * Number to Hex
   * @param color - number
   * @returns
   */
  private numberToHex(color: number) {
    const hexadecimal = color.toString(16);
    return hexadecimal.length === 1 ? '0' + hexadecimal : hexadecimal;
  }
}
