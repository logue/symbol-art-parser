/**
 * Cursor Class
 *
 * TypeScript version by Logue.
 * Original version written by HybridEidolon's saredit
 * @see https://github.com/HybridEidolon/saredit
 */
export default class Cursor {
  private buffer: ArrayBuffer;
  private dataView: DataView;
  private pos: number;
  private bitCounter: number;
  private bitValue: number;

  /**
   * Constructor
   * @param buffer - data
   */
  constructor(buffer = new ArrayBuffer(64)) {
    this.buffer = buffer;
    this.dataView = new DataView(this.buffer);
    this.pos = 0;
    this.bitCounter = 0;
    this.bitValue = 0;
  }

  /** Get Buffer */
  getBuffer() {
    return this.buffer;
  }

  /** Get DataView */
  getDataView() {
    return this.dataView;
  }

  /** Get current cursor position. */
  getPosition(): number {
    return this.pos;
  }

  /** Get bit */
  readBit(): number {
    if (this.bitCounter === 0) {
      this.bitValue = this.dataView.getUint8(this.pos);
      this.seek(1);
      this.bitCounter = 8;
    }

    const bit = this.bitValue & 1;
    this.bitCounter -= 1;
    this.bitValue = this.bitValue >>> 1;
    return bit;
  }

  /** Get unsinged int8 */
  readUint8(): number {
    const ret = this.dataView.getUint8(this.pos);
    this.seek(1);
    return ret;
  }

  /**
   * Get unsinged int16
   * @param le - litte endian
   */
  readUint16(le: boolean): number {
    const ret = this.dataView.getUint16(this.pos, le === true ? true : false);
    this.seek(2);
    return ret;
  }

  /**
   * Get unsinged int32
   * @param le - litte endian
   */
  readUint32(le: boolean): number {
    const ret = this.dataView.getUint32(this.pos, le === true ? true : false);
    this.seek(4);
    return ret;
  }

  /**
   * Get int8
   */
  readInt8(): number {
    const ret = this.dataView.getInt8(this.pos);
    this.seek(1);
    return ret;
  }

  /**
   * Get int16
   * @param le - litte endian
   */
  readInt16(le: boolean): number {
    const ret = this.dataView.getInt16(this.pos, le === true ? true : false);
    this.seek(2);
    return ret;
  }

  /**
   * Get int32
   * @param le - litte endian
   */
  readInt32(le: boolean): number {
    const ret = this.dataView.getInt32(this.pos, le === true ? true : false);
    this.seek(4);
    return ret;
  }

  /**
   * Get Float 32
   * @param le - litte endian
   */
  readFloat32(le: boolean): number {
    const ret = this.dataView.getFloat32(this.pos, le === true ? true : false);
    this.seek(4);
    return ret;
  }

  /**
   * Get Float 64
   * @param le - litte endian
   */
  readFloat64(le: boolean): number {
    const ret = this.dataView.getFloat64(this.pos, le === true ? true : false);
    this.seek(8);
    return ret;
  }

  /**
   * Set unsigind int8
   * @param v - value
   */
  writeUint8(v: number) {
    this.extendIfNeeded(1);
    this.dataView.setUint8(this.pos, v);
    this.seek(1);
  }

  /**
   * Set unsigind int16
   * @param v - value
   * @param le - little endian
   */
  writeUint16(v: number, le: boolean) {
    this.extendIfNeeded(2);
    this.dataView.setUint16(this.pos, v, le === true ? true : false);
    this.seek(2);
  }

  /**
   * Set unsigind int16
   * @param v - value
   * @param le - little endian
   */
  writeUint32(v: number, le: boolean) {
    this.extendIfNeeded(4);
    this.dataView.setUint32(this.pos, v, le === true ? true : false);
    this.seek(4);
  }

  /**
   * Set int8
   * @param v - value
   */
  writeInt8(v: number) {
    this.extendIfNeeded(1);
    this.dataView.setInt8(this.pos, v);
    this.seek(1);
  }

  /**
   * Set int16
   * @param v - value
   * @param le - little endian
   */
  writeInt16(v: number, le: boolean) {
    this.extendIfNeeded(2);
    this.dataView.setInt16(this.pos, v, le === true ? true : false);
    this.seek(2);
  }

  /**
   * Set int32
   * @param v - value
   * @param le - little endian
   */
  writeInt32(v: number, le: boolean) {
    this.extendIfNeeded(4);
    this.dataView.setInt32(this.pos, v, le === true ? true : false);
    this.seek(4);
  }

  /**
   * Set float32
   * @param v - value
   * @param le - little endian
   */
  writeFloat32(v: number, le: boolean) {
    this.extendIfNeeded(4);
    this.dataView.setFloat32(this.pos, v, le === true ? true : false);
    this.seek(4);
  }

  /**
   * Set float64
   * @param v - value
   * @param le - little endian
   */
  writeFloat64(v: number, le: boolean) {
    this.extendIfNeeded(8);
    this.dataView.setFloat64(this.pos, v, le === true ? true : false);
    this.seek(8);
  }

  /**
   * Seek pointer
   * @param offset - offset bytes
   */
  seek(offset: number) {
    if (this.pos + offset > this.buffer.byteLength || this.pos + offset < 0) {
      throw new Error(
        `invalid seek to ${
          this.pos + offset
        } (by ${offset}) on buffer of length ${this.buffer.byteLength}`
      );
    }
    this.pos += offset;
  }

  /** Add Padding */
  private extendIfNeeded(adding: number) {
    if (this.pos + adding > this.buffer.byteLength) {
      const newBuffer = new ArrayBuffer(this.buffer.byteLength * 2);
      const newBufferDataView = new DataView(newBuffer);
      for (let i = 0; i < this.buffer.byteLength; i++) {
        newBufferDataView.setUint8(i, this.dataView.getUint8(i));
      }
      this.buffer = newBuffer;
      this.dataView = newBufferDataView;
    }
  }
}
