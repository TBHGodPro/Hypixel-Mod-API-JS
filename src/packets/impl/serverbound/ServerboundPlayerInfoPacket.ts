import HypixelPacket from '../../HypixelPacket';

export default class ServerboundPlayerInfoPacket extends HypixelPacket<ServerboundPlayerInfo> {
  public static readonly version = 1;

  public write(data: ServerboundPlayerInfo): Buffer {
    this.buf.writeVarInt(ServerboundPlayerInfoPacket.version);
    
    return this.buf.finish();
  }

  public read(): ServerboundPlayerInfo | null {
    if (this.buf.readVarInt() !== ServerboundPlayerInfoPacket.version) return null;

    return {};
  }
}

export interface ServerboundPlayerInfo {}
