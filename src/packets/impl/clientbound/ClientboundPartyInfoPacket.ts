import { UUID } from '@minecraft-js/uuid';
import HypixelPacket from '../../HypixelPacket';
import BufUtil from '../../../serializer/BufUtil';

export default class ClientboundPartyInfoPacket extends HypixelPacket<ClientboundPartyInfo> {
  public readonly name = 'party_info';
  public static readonly version = 2;

  public write(data: ClientboundPartyInfo): Buffer {
    this.buf.writeVarInt(ClientboundPartyInfoPacket.version);

    this.buf.writeBoolean(data.inParty);

    if (data.inParty) {
      this.buf.writeVarInt(data.members.size);
      data.members.forEach(member => member.write(this.buf));
    }

    return this.buf.finish();
  }

  public read(): ClientboundPartyInfo | null {
    if (this.buf.readVarInt() !== ClientboundPartyInfoPacket.version) return null;

    const inParty = this.buf.readBoolean();

    if (!inParty)
      return {
        inParty,
        members: new Map(),
      };

    const memberCount = this.buf.readVarInt();
    const members = new Map<UUID, PartyMember>();
    for (let i = 0; i < memberCount; i++) {
      const member = PartyMember.from(this.buf);
      members.set(member.uuid, member);
    }

    return {
      inParty,
      members,
    };
  }
}

export interface ClientboundPartyInfo {
  inParty: boolean;
  members: Map<UUID, PartyMember>;
}

export class PartyMember {
  public readonly uuid: UUID;
  public readonly role: PartyRole;

  public constructor(uuid: UUID, role: PartyRole) {
    this.uuid = uuid;
    this.role = role;
  }

  public static from(buf: BufUtil): PartyMember {
    return new PartyMember(buf.readUUID(), buf.readVarInt());
  }

  public write(buf: BufUtil) {
    buf.writeUUID(this.uuid);
    buf.writeVarInt(this.role);
  }
}

export enum PartyRole {
  LEADER,
  MOD,
  MEMBER,
}
