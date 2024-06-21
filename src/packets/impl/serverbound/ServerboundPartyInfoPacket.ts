import HypixelPacket from '../../HypixelPacket';

export default class ServerboundPartyInfoPacket extends HypixelPacket<ServerboundPartyInfo> {
  public static readonly version = 2;

  public write(data: ServerboundPartyInfo): Buffer {
    this.buf.writeVarInt(ServerboundPartyInfoPacket.version);
    
    return this.buf.finish();
  }

  public read(): ServerboundPartyInfo | null {
    if (this.buf.readVarInt() !== ServerboundPartyInfoPacket.version) return null;

    return {};
  }
}

export interface ServerboundPartyInfo {}
