import HypixelPacket from '../../HypixelPacket';

export default class ClientboundPingPacket extends HypixelPacket<ClientboundPing> {
  public readonly name = 'ping';
  public static readonly version = 1;

  public write(data: ClientboundPing): Buffer {
    this.buf.writeVarInt(ClientboundPingPacket.version);

    this.buf.writeString(data.response);

    return this.buf.finish();
  }

  public read(): ClientboundPing | null {
    if (this.buf.readVarInt() !== ClientboundPingPacket.version) return null;

    return {
      response: this.buf.readString(),
    };
  }
}

export interface ClientboundPing {
  response: string;
}
