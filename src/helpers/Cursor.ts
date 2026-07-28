/**
 * Cursor Class
 *
 * TypeScript version by Logue.
 * Original version written by HybridEidolon's saredit
 * @see https://github.com/HybridEidolon/saredit
 */
export default class Cursor {
  private buffer: ArrayBufferLike;
  private dataView: DataView;
  private pos: number;
  private bitCounter: number;
  private bitValue: number;

  /**
   * Constructor
   * @param buffer - data
   */
  constructor(buffer: ArrayBufferLike = new ArrayBuffer(64)) {
    this.buffer = buffer;
    this.dataView = new DataView(this.buffer);
    this.pos = 0;
    this.bitCounter = 0;
    this.bitValue = 0;
  }

  /** Get Buffer */
  public getBuffer(): ArrayBufferLike {
    return this.buffer;
  }

  /** Get DataView */
  public getDataView(): DataView {
    return this.dataView;
  }

  /** Get current cursor position. */
  public getPosition(): number {
    return this.pos;
  }

  /** Get bit */
  public readBit(): number {
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
  public readUint8(): number {
    const ret = this.dataView.getUint8(this.pos);
    this.seek(1);
    return ret;
  }

  /**
   * Get unsinged int16
   * @param le - litte endian
   */
  public readUint16(le: boolean): number {
    const ret = this.dataView.getUint16(this.pos, !!le);
    this.seek(2);
    return ret;
  }

  /**
   * Get unsinged int32
   * @param le - litte endian
   */
  public readUint32(le: boolean): number {
    const ret = this.dataView.getUint32(this.pos, !!le);
    this.seek(4);
    return ret;
  }

  /**
   * Get int8
   */
  public readInt8(): number {
    const ret = this.dataView.getInt8(this.pos);
    this.seek(1);
    return ret;
  }

  /**
   * Get int16
   * @param le - litte endian
   */
  public readInt16(le: boolean): number {
    const ret = this.dataView.getInt16(this.pos, !!le);
    this.seek(2);
    return ret;
  }

  /**
   * Get int32
   * @param le - litte endian
   */
  public readInt32(le: boolean): number {
    const ret = this.dataView.getInt32(this.pos, !!le);
    this.seek(4);
    return ret;
  }

  /**
   * Get Float 32
   * @param le - litte endian
   */
  public readFloat32(le: boolean): number {
    const ret = this.dataView.getFloat32(this.pos, !!le);
    this.seek(4);
    return ret;
  }

  /**
   * Get Float 64
   * @param le - litte endian
   */
  public readFloat64(le: boolean): number {
    const ret = this.dataView.getFloat64(this.pos, !!le);
    this.seek(8);
    return ret;
  }

  /**
   * Set unsigind int8
   * @param v - value
   */
  public writeUint8(v: number): void {
    this.extendIfNeeded(1);
    this.dataView.setUint8(this.pos, v);
    this.seek(1);
  }

  /**
   * Set unsigind int16
   * @param v - value
   * @param le - little endian
   */
  public writeUint16(v: number, le: boolean): void {
    this.extendIfNeeded(2);
    this.dataView.setUint16(this.pos, v, !!le);
    this.seek(2);
  }

  /**
   * Set unsigind int16
   * @param v - value
   * @param le - little endian
   */
  public writeUint32(v: number, le: boolean): void {
    this.extendIfNeeded(4);
    this.dataView.setUint32(this.pos, v, !!le);
    this.seek(4);
  }

  /**
   * Set int8
   * @param v - value
   */
  public writeInt8(v: number): void {
    this.extendIfNeeded(1);
    this.dataView.setInt8(this.pos, v);
    this.seek(1);
  }

  /**
   * Set int16
   * @param v - value
   * @param le - little endian
   */
  public writeInt16(v: number, le: boolean): void {
    this.extendIfNeeded(2);
    this.dataView.setInt16(this.pos, v, !!le);
    this.seek(2);
  }

  /**
   * Set int32
   * @param v - value
   * @param le - little endian
   */
  public writeInt32(v: number, le: boolean): void {
    this.extendIfNeeded(4);
    this.dataView.setInt32(this.pos, v, !!le);
    this.seek(4);
  }

  /**
   * Set float32
   * @param v - value
   * @param le - little endian
   */
  public writeFloat32(v: number, le: boolean): void {
    this.extendIfNeeded(4);
    this.dataView.setFloat32(this.pos, v, !!le);
    this.seek(4);
  }

  /**
   * Set float64
   * @param v - value
   * @param le - little endian
   */
  public writeFloat64(v: number, le: boolean): void {
    this.extendIfNeeded(8);
    this.dataView.setFloat64(this.pos, v, !!le);
    this.seek(8);
  }

  /**
   * Seek pointer
   * @param offset - offset bytes
   */
  private seek(offset: number): void {
    if (this.pos + offset > this.buffer.byteLength || this.pos + offset < 0) {
      throw new Error(
        `invalid seek to ${
          this.pos + offset
        } (by ${offset}) on buffer of length ${this.buffer.byteLength}`,
      );
    }
    this.pos += offset;
  }

  /** Add Padding */
  private extendIfNeeded(adding: number): void {
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
