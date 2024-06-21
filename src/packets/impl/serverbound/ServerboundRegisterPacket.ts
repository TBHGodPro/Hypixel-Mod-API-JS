import HypixelPacket from '../../HypixelPacket';

export default class ServerboundRegisterPacket extends HypixelPacket<ServerboundRegister> {
  public static readonly version = 1;

  public write(data: ServerboundRegister): Buffer {
    this.buf.writeVarInt(ServerboundRegisterPacket.version);

    this.buf.writeVarInt(data.subscribedEvents.size);
    data.subscribedEvents.forEach((value, key) => {
      this.buf.writeString(key);
      this.buf.writeVarInt(value);
    });

    return this.buf.finish();
  }

  public read(): ServerboundRegister | null {
    if (this.buf.readVarInt() !== ServerboundRegisterPacket.version) return null;

    const length = this.buf.readVarInt();
    const subscribedEvents = new Map<string, number>();
    for (let i = 0; i < length; i++) {
      subscribedEvents.set(this.buf.readString(), this.buf.readVarInt());
    }

    return {
      subscribedEvents,
    };
  }
}

export interface ServerboundRegister {
  subscribedEvents: Map<string, number>;
}
