import Cursor from '@/helpers/Cursor';

/**
 * @param buffer - buffer to decompress
 */
export default function decompress(buffer: ArrayBuffer): ArrayBuffer {
  const readCursor = new Cursor(buffer);
  const writeCursor = new Cursor();

  while (true) {
    const flag = readCursor.readBit();

    if (flag !== 0) {
      // インライン化: 単純な1バイト操作
      writeCursor.writeUint8(readCursor.readUint8());
      continue;
    }

    const copyInfo = handleCopyFlag(readCursor);
    if (copyInfo.offset === 0) break;

    performOptimizedCopy(writeCursor, copyInfo);
  }

  return writeCursor.getBuffer().slice(0, writeCursor.getPosition());
}

// より効率的な構造体を使用
interface CopyInfo {
  readonly offset: number;
  readonly size: number;
  readonly isLongCopy: boolean;
}

function handleCopyFlag(readCursor: Cursor): CopyInfo {
  const flag = readCursor.readBit();

  if (flag !== 0) {
    // ロングコピーの場合
    const offset = readCursor.readUint16(true);
    if (offset === 0) {
      return { offset: 0, size: 0, isLongCopy: true };
    }

    const size = offset & 7;
    const adjustedOffset = (offset >> 3) | -0x2000;
    const finalSize = size === 0 ? readCursor.readUint8() + 10 : size + 2;

    return {
      offset: adjustedOffset,
      size: finalSize,
      isLongCopy: true,
    };
  } else {
    // ショートコピーの場合 - ビット操作を最適化
    const flags = (readCursor.readBit() << 1) | readCursor.readBit();
    const size = flags + 2;
    const offset = readCursor.readInt8() | -0x100;

    return {
      offset,
      size,
      isLongCopy: false,
    };
  }
}

function performOptimizedCopy(
  writeCursor: Cursor,
  { offset, size, isLongCopy }: CopyInfo
): void {
  // エラーチェックを前に移動
  if (offset > 0) {
    throw new Error(
      `[SymbolArt.Decompress] offset > 0 (${offset}) (isLongCopy === ${isLongCopy})`
    );
  }

  const currentPos = writeCursor.getPosition();
  const sourcePos = currentPos + offset;
  // Cursor API経由で書き込むことで、内部バッファの自動拡張と
  // オーバーラップコピー（LZ展開）を正しく処理する。
  for (let i = 0; i < size; i++) {
    const readPos = sourcePos + i;
    const value = new Uint8Array(writeCursor.getBuffer())[readPos] ?? 0;
    writeCursor.writeUint8(value);
  }
}
