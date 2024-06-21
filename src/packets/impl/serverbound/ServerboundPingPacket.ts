import HypixelPacket from '../../HypixelPacket';

export default class ServerboundPingPacket extends HypixelPacket<ServerboundPing> {
  public static readonly version = 1;

  public write(data: ServerboundPing): Buffer {
    this.buf.writeVarInt(ServerboundPingPacket.version);
    
    return this.buf.finish();
  }

  public read(): ServerboundPing | null {
    if (this.buf.readVarInt() !== ServerboundPingPacket.version) return null;

    return {};
  }
}

export interface ServerboundPing {}
