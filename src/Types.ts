export enum PlayerRank {
  NORMAL = 1,
  YOUTUBER,
  GAME__MASTER,
  ADMIN,
}

export enum PackageRank {
  NONE = 1,
  VIP,
  VIP_PLUS,
  MVP,
  MVP_PLUS,
}

export enum MonthlyPackageRank {
  NONE = 1,
  SUPERSTAR,
}

export interface ServerType {
  name: string;
}

export enum EnvironmentID {
  PRODUCTION = 0,
  BETA,
  TEST,
}

export enum Events {
  LOCATION
}