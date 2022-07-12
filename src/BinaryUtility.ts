/** Binary Utility Class */
export default class BinaryUtility {
  private buffer: ArrayBuffer;
  private dataView: DataView;
  private position: number;
  private counter: number;
  private value: number;

  /**
   * Constructor
   * @param buffer - input data
   */
  constructor(buffer: ArrayBuffer = new ArrayBuffer(64)) {
    this.buffer = buffer;
    this.dataView = new DataView(this.buffer);
    this.position = 0;
    this.counter = 0;
    this.value = 0;
  }

  /** Get buffer */
  getBuffer(): ArrayBuffer {
    return this.buffer.slice(0, this.position);
  }

  /** Get Data length */
  get length(): number {
    return this.dataView.byteLength;
  }

  /**
   * set current cursor position
   * @param v - offset bytes.
   */
  set offset(v: number) {
    if (this.position + v > this.buffer.byteLength || this.position + v < 0) {
      throw new Error(
        `[BinaryUtility] invalid seek to ${this.position + v} (by ${v}) on buffer of length ${
          this.buffer.byteLength
        }`
      );
    }
    this.position += v;
  }

  /** Get current pointer position */
  get offset() {
    return this.position;
  }

  /** Get Bit */
  get bit(): boolean {
    if (this.counter === 0) {
      this.value = this.dataView.getUint8(this.position);
      this.offset = 1;
      this.counter = 8;
    }

    const bit = this.value & 1;
    this.counter -= 1;
    this.value = this.value >>> 1;
    return bit !== 0;
  }

  // --------------------------------------------------- //

  /** Get int8 value. */
  get int8(): number {
    const ret = this.dataView.getInt8(this.position);
    this.offset = 1;
    return ret;
  }

  /** set int8 value  */
  set int8(v: number) {
    this.addPadding(1);
    this.dataView.setInt8(this.position, v);
    this.offset = 1;
  }

  /** get unsigind int8 value */
  get uint8(): number {
    const ret = this.dataView.getUint8(this.position);
    this.offset = 1;
    return ret;
  }

  /** set unsigind int8 value */
  set uint8(v: number) {
    this.addPadding(1);
    this.dataView.setUint8(this.position, v);
    this.offset = 1;
  }

  // --------------------------------------------------- //

  /** get int16 value  */
  get uint16(): number {
    const ret = this.dataView.getUint16(this.position, false);
    this.offset = 2;
    return ret;
  }

  /** set unsigned int16 value  */
  set uint16(v: number) {
    this.addPadding(2);
    this.dataView.setUint16(this.position, v);
    this.offset = 2;
  }

  /** get int16 by little endian value  */
  get uint16L(): number {
    const ret = this.dataView.getUint16(this.position, true);
    this.offset = 2;
    return ret;
  }

  /** get int16 by little endian value  */
  set uint16L(v: number) {
    this.addPadding(2);
    this.dataView.setUint16(this.position, v, true);
    this.offset = 2;
  }

  // --------------------------------------------------- //

  /** get int32 value  */
  get int32(): number {
    const ret = this.dataView.getInt32(this.position, false);
    this.offset = 4;
    return ret;
  }

  /** set int32 value  */
  set int32(v: number) {
    this.addPadding(4);
    this.dataView.setInt32(this.position, v, false);
    this.offset = 4;
  }

  /** get int32 by little endian value */
  get int32L(): number {
    const ret = this.dataView.getInt32(this.position, true);
    this.offset = 4;
    return ret;
  }

  /** set int32 by little endian value  */
  set int32L(v: number) {
    this.addPadding(4);
    this.dataView.setInt32(this.position, v, true);
    this.offset = 4;
  }

  /** get unsigined int32 value  */
  get uint32(): number {
    const ret = this.dataView.getUint32(this.position, false);
    this.offset = 4;
    return ret;
  }

  /** set unsigined int32 value  */
  set uint32(v: number) {
    this.addPadding(4);
    this.dataView.setUint32(this.position, v, false);
    this.offset = 4;
  }

  /** get unsigined int32 by little endian value  */
  get uint32L(): number {
    const ret = this.dataView.getUint32(this.position, true);
    this.offset = 4;
    return ret;
  }

  /** set unsigined int32 by little endian value  */
  set uint32L(v: number) {
    this.addPadding(4);
    this.dataView.setUint32(this.position, v, true);
    this.offset = 4;
  }

  /** get float32 value  */
  get float32(): number {
    const ret = this.dataView.getFloat32(this.position, false);
    this.offset = 4;
    return ret;
  }

  /** set float32 value  */
  set float32(v: number) {
    this.addPadding(4);
    this.dataView.setUint32(this.position, v, false);
    this.offset = 4;
  }

  /** get float32 by little endian value  */
  get float32L(): number {
    const ret = this.dataView.getFloat32(this.position, true);
    this.offset = 4;
    return ret;
  }

  /** set float32 by little endian value  */
  set float32L(v: number) {
    this.addPadding(4);
    this.dataView.setFloat32(this.position, v, true);
    this.offset = 4;
  }

  // --------------------------------------------------- //

  /** get float64 value  */
  get float64(): number {
    const ret = this.dataView.getFloat64(this.position, false);
    this.offset = 8;
    return ret;
  }

  /** set float64 value  */
  set float64(v: number) {
    this.addPadding(8);
    this.dataView.setFloat64(this.position, v, false);
    this.offset = 8;
  }

  /** get float64 by little endian value  */
  get float64L(): number {
    const ret = this.dataView.getFloat64(this.position, true);
    this.offset = 8;
    return ret;
  }

  /** get float64 by little endian value  */
  set float64L(v: number) {
    this.addPadding(8);
    this.dataView.setFloat64(this.position, v, true);
    this.offset = 8;
  }

  // --------------------------------------------------- //

  /** Add padding when needed. */
  private addPadding(adding: number) {
    if (this.position + adding > this.buffer.byteLength) {
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
