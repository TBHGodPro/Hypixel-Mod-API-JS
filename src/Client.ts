import { EventEmitter, once } from 'node:events';
import HypixelPacket from './packets/HypixelPacket';
import PacketHandler, { EventsMap, PacketHandlerEvents } from './packets/PacketHandler';
import TypedEventEmitter from 'typed-emitter';
import { EnvironmentID, Events } from './Types';
import { setTimeout } from 'node:timers/promises';

export default class Client extends (EventEmitter as new () => TypedEventEmitter<ClientEvents>) {
  public readonly handler: PacketHandler;
  public readonly options: ClientOptions;

  private isConnected: boolean = false;
  public setConnected(connected: boolean) {
    this.isConnected = !!connected;
    if (connected) {
      for (const packet of this.queue) {
        this.log('debug', 'QUEUE SEND', packet[0], packet[1]);
        this.options.send(packet[0], packet[1]);
        packet[2]();
      }
      this.queue = [];
    }
  }
  private queue: [string, Buffer, () => void][] = [];

  constructor(options: ClientOptions) {
    super();

    options.debug ??= false;
    options.maxPingTimeout ??= 5_000;

    this.options = options;

    this.handler = new PacketHandler();

    this.handler.on('hello', data => {
      this.log('log', 'HELLO', data);
      this.emit('hello', data.environmentID);
    });
    this.handler.on('ping', data => {
      this.log('log', 'PING', data);
      this.emit('pong', data.response);
    });
    this.handler.on('party_info', data => {
      this.log('log', 'PARTY INFO', data);
    });
    this.handler.on('player_info', data => {
      this.log('log', 'PLAYER INFO', data);
    });

    this.handler.on('event', (name, data) => {
      this.log('log', 'EVENT', name, data);
      this.emit('event', name, data);
      // @ts-ignore
      this.emit(name, data);
    });
  }

  private log(type: 'log' | 'warn' | 'error' | 'debug', ...data: any[]) {
    if (this.options.debug) console[type](`[${type.toUpperCase()}]`, ...data);
  }

  public receivePacket(channel: string, data: Buffer): void {
    this.log('debug', 'RECEIVE', channel, data);
    this.handler.handlePacket(channel, data);
  }

  public async sendPacket<T extends Exclude<keyof typeof PacketHandler.packets, 'hypixel:hello'>>(packet: T, data: getType<(typeof PacketHandler.packets)[T]['serverbound']>): Promise<void> {
    const instance = new PacketHandler.packets[packet].serverbound();

    const buf = instance.write(data as any);

    if (this.isConnected) {
      this.log('debug', 'SEND', packet, buf);
      this.options.send(packet, buf);
      return Promise.resolve();
    } else {
      this.log('debug', 'QUEUE', packet, buf);
      return new Promise(res => {
        this.queue.push([packet, buf, res]);
      });
    }
  }

  public async awaitPacket<T extends Exclude<keyof typeof PacketHandler.packets, 'hypixel:register'>>(channel: T): Promise<getType<(typeof PacketHandler.packets)[T]['clientbound']>> {
    return await once(this.handler, channel.replace('hypixel:', ''))
      .then(i => i?.[0] ?? null)
      .catch(() => null);
  }

  public async ping(timeout: false): Promise<{ res: string; totalTimeMS: number; roundtripMS: number; pingMS: number; displayPingMS: number }>;
  public async ping(timeout?: number | false): Promise<{ res: string; totalTimeMS: number; roundtripMS: number; pingMS: number; displayPingMS: number } | null> {
    const realStart = Date.now();

    await this.sendPacket('hypixel:ping', {});

    const start = Date.now();

    return (
      (await Promise.race([
        this.awaitPacket('hypixel:ping').then(res => ({
          res: res.response,
          totalTimeMS: Date.now() - realStart,
          roundtripMS: Date.now() - start,
          pingMS: (Date.now() - start) / 2,
          displayPingMS: Math.round((Date.now() - start) / 2),
        })),
        timeout === false ? new Promise<void>(() => {}) : setTimeout(timeout ?? this.options.maxPingTimeout),
      ])) ?? null
    );
  }

  public async register(events: (keyof typeof PacketHandler.events)[]): Promise<void> {
    const map = new Map();

    for (const event of events) {
      if (PacketHandler.events[event]?.clientbound?.version) map.set(event, PacketHandler.events[event].clientbound.version);
    }

    await this.sendPacket('hypixel:register', {
      subscribedEvents: map,
    });
  }
}

type getType<T> = T extends typeof HypixelPacket<infer U> ? U : never;

export interface ClientOptions {
  send: (channel: string, data: Buffer) => void;
  debug?: boolean;
  maxPingTimeout?: number;
}

export type ClientEvents = {
  hello(environmentID: EnvironmentID): void;
  pong(response: string): void;

  event: PacketHandlerEvents['event'];
} & {
  [T in keyof typeof Events]: (data: EventsMap[(typeof Events)[T]]) => void;
};
