import { EventEmitter } from 'events';
import HypixelPacket from './HypixelPacket';
import ClientboundHelloPacket, { ClientboundHello } from './impl/clientbound/ClientboundHelloPacket';
import ClientboundPartyInfoPacket, { ClientboundPartyInfo } from './impl/clientbound/ClientboundPartyInfoPacket';
import ClientboundPingPacket, { ClientboundPing } from './impl/clientbound/ClientboundPingPacket';
import ClientboundPlayerInfoPacket, { ClientboundPlayerInfo } from './impl/clientbound/ClientboundPlayerInfoPacket';
import ClientboundLocationEventPacket from './impl/clientbound/event/ClientboundLocationEventPacket';
import ServerboundPartyInfoPacket from './impl/serverbound/ServerboundPartyInfoPacket';
import ServerboundPingPacket from './impl/serverbound/ServerboundPingPacket';
import ServerboundPlayerInfoPacket from './impl/serverbound/ServerboundPlayerInfoPacket';
import ServerboundRegisterPacket from './impl/serverbound/ServerboundRegisterPacket';
import TypedEventEmitter from 'typed-emitter';
import { Events } from '../Types';

export default class PacketHandler extends (EventEmitter as new () => TypedEventEmitter<PacketHandlerEvents>) {
  public static readonly packets = {
    'hypixel:hello': {
      clientbound: ClientboundHelloPacket,
      serverbound: null,
    },
    'hypixel:register': {
      clientbound: null,
      serverbound: ServerboundRegisterPacket,
    },
    'hypixel:ping': {
      clientbound: ClientboundPingPacket,
      serverbound: ServerboundPingPacket,
    },
    'hypixel:party_info': {
      clientbound: ClientboundPartyInfoPacket,
      serverbound: ServerboundPartyInfoPacket,
    },
    'hypixel:player_info': {
      clientbound: ClientboundPlayerInfoPacket,
      serverbound: ServerboundPlayerInfoPacket,
    },
  } as const;

  public static readonly events = {
    'hyevent:location': {
      clientbound: ClientboundLocationEventPacket,
      serverbound: null,
    },
  } as const;

  constructor() {
    super();
  }

  public handlePacket(channel: string, raw: Buffer): void {
    const success = !!raw[0];

    if (success) {
      if (channel.startsWith('hyevent:')) {
        const c = (PacketHandler.events as any)[channel]?.clientbound;

        if (!c) return;

        const packet = new c(raw.slice(1));

        const data = packet.read();

        this.emit('event', Events[packet.name] as any, data);
      } else {
        const c = (PacketHandler.packets as any)[channel]?.clientbound;

        if (!c) return;

        const packet = new c(raw.slice(1));

        const data = packet.read();

        this.emit(packet.name, data);
      }
    } else {
      // TODO: Errors
    }
  }
}

export type PacketHandlerEvents = {
  hello(data: ClientboundHello): void;
  ping(data: ClientboundPing): void;
  party_info(data: ClientboundPartyInfo): void;
  player_info(data: ClientboundPlayerInfo): void;

  event<T extends keyof typeof Events>(event: T, data: EventsMap[(typeof Events)[T]]): void;
};

export type EventsMap = {
  [Events.LOCATION]: getType<ClientboundLocationEventPacket>;
};

type getType<T> = T extends HypixelPacket<infer U> ? U : never;
