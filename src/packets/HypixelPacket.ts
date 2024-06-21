import BufUtil from '../serializer/BufUtil';

export default abstract class HypixelPacket<T> {
  public readonly buf: BufUtil;

  constructor(buf?: BufUtil | Buffer) {
    this.buf = buf instanceof BufUtil ? buf : new BufUtil(buf);
  }

  public abstract write(data: T): Buffer;

  public abstract read(): T | null;

  public getIdentifier(): string {
    return this.constructor.name;
  }
}
