/** Member enum */
export enum MemberType {
  ADMIN = 'ADMIN',
  USER = 'USER',
  AGENT = 'AGENT',
}


export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
}

export enum MemberAuthType {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  KAKAO = 'KAKAO',
  TELEGRAM = 'TELEGRAM',
  PHONE = 'PHONE',
}


export enum MemberLanguage {
  ENGLISH = 'ENGLISH',
  KOREAN = 'KOREAN',
  CHINESE = 'CHINESE',
  RUSSIAN = 'RUSSIAN',
  ARABIC = 'ARABIC',
  UZBEK = 'UZBEK',
}

export enum MemberRank {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

/** Agent-Request enum */

export enum AgentRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/** Agent enum */

export enum AgentStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum AgentVerificationStatus {
  APPROVED = 'APPROVED',
  REVOKED = 'REVOKED',
}
