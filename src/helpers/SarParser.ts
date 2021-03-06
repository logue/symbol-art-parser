import AbstractParser from './AbstractParser';
import Cursor from './Cursor';
import type LayerInterface from '../interfaces/LayerInterface';
import type RegistryInterface from '../interfaces/RegistryInterface';
import type SymbolArtInterface from '../interfaces/SymbolArtInterface';

/**
 * Sar Parser
 *
 * TypeScript version by Logue.
 * Original version written by HybridEidolon's saredit
 * @see https://github.com/HybridEidolon/saredit
 */
export default class SarParser extends AbstractParser {
  private pointSchema = {
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

      const visibility = !(val1 >> 31);
      const id = (val1 >> 21) & 1023;
      const colorA = (val1 >> 18) & 7;
      const colorR = (val1 >> 0) & 63;
      const colorG = (val1 >> 6) & 63;
      const colorB = (val1 >> 12) & 63;

      const colorX = (val2 >> 0) & 63;
      const colorY = (val2 >> 6) & 63;
      const colorZ = (val2 >> 12) & 63;

      return {
        visibility,
        id,
        colorA,
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
        symbol: layer.props.id,
        isVisible: layer.props.visibility,
        position: layer.points,
        r: layer.props.colorR,
        g: layer.props.colorG,
        b: layer.props.colorB,
        a: layer.props.colorA,
        x: layer.props.colorX,
        y: layer.props.colorY,
        z: layer.props.colorZ,
      });
    }

    const name: number[] = [];
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
        console.warn('[SymbolArt.SarParser] Unable parse charactor.');
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
      layers,
    };
  }
}
