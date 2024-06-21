import { MonthlyPackageRank, PackageRank, PlayerRank } from '../../../Types';
import HypixelPacket from '../../HypixelPacket';

export default class ClientboundPlayerInfoPacket extends HypixelPacket<ClientboundPlayerInfo> {
  public readonly name = 'player_info';
  public static readonly version = 1;

  public write(data: ClientboundPlayerInfo): Buffer {
    this.buf.writeVarInt(ClientboundPlayerInfoPacket.version);

    this.buf.writeVarInt(data.rank);
    this.buf.writeVarInt(data.package);
    this.buf.writeVarInt(data.monthlyPackage);
    this.buf.writeOptional(!!data.prefix, buf => buf.writeString(data.prefix!));

    return this.buf.finish();
  }

  public read(): ClientboundPlayerInfo | null {
    if (this.buf.readVarInt() !== ClientboundPlayerInfoPacket.version) return null;

    return {
      rank: this.buf.readVarInt(),
      package: this.buf.readVarInt(),
      monthlyPackage: this.buf.readVarInt(),
      prefix: this.buf.readOptional(buf => buf.readString()),
    };
  }
}

export interface ClientboundPlayerInfo {
  rank: PlayerRank;
  package: PackageRank;
  monthlyPackage: MonthlyPackageRank;
  prefix?: string | null;
}
