import { EnvironmentID } from '../../../Types';
import HypixelPacket from '../../HypixelPacket';

export default class ClientboundHelloPacket extends HypixelPacket<ClientboundHello> {
  public readonly name = 'hello';

  public write(data: ClientboundHello): Buffer {
    this.buf.writeVarInt(data.environmentID);

    return this.buf.finish();
  }

  public read(): ClientboundHello {
    return {
      environmentID: this.buf.readVarInt(),
    };
  }
}

export interface ClientboundHello {
  environmentID: EnvironmentID;
}
