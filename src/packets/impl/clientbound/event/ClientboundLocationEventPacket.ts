import { Events, ServerType } from '../../../../Types';
import HypixelPacket from '../../../HypixelPacket';

export default class ClientboundLocationEventPacket extends HypixelPacket<ClientboundLocationEvent> {
  public readonly name = Events.LOCATION;
  public static readonly version = 1;

  public write(data: ClientboundLocationEvent): Buffer {
    this.buf.writeVarInt(ClientboundLocationEventPacket.version);

    this.buf.writeString(data.serverName);
    this.buf.writeOptional(!!data.serverType?.name, buf => buf.writeString(data.serverType!.name));
    this.buf.writeOptional(!!data.lobbyName, buf => buf.writeString(data.lobbyName!));
    this.buf.writeOptional(!!data.mode, buf => buf.writeString(data.mode!));
    this.buf.writeOptional(!!data.map, buf => buf.writeString(data.map!));

    return this.buf.finish();
  }

  public read(): ClientboundLocationEvent | null {
    if (this.buf.readVarInt() !== ClientboundLocationEventPacket.version) return null;

    return {
      serverName: this.buf.readString(),
      serverType: this.buf.readOptional(buf => ({ name: buf.readString() })),
      lobbyName: this.buf.readOptional(buf => buf.readString()),
      mode: this.buf.readOptional(buf => buf.readString()),
      map: this.buf.readOptional(buf => buf.readString()),
    };
  }
}

export interface ClientboundLocationEvent {
  serverName: string;
  serverType?: ServerType | null;
  lobbyName?: string | null;
  mode?: string | null;
  map?: string | null;
}
