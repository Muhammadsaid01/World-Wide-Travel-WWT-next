/** Community enum */


/** Board Article enum */
export enum ArticleCategory {
  FREE = 'FREE',
  TRAVEL_TIP = 'TRAVEL_TIP',
  TRAVEL_REVIEW = 'TRAVEL_REVIEW',
  QUESTION = 'QUESTION',
  FIND_COMPANION = 'FIND_COMPANION',
  NOTICE = 'NOTICE',
}

export enum ArticleStatus {
  ACTIVE = 'ACTIVE',

  DRAFT = 'DRAFT',

  HIDDEN = 'HIDDEN',

  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
}

/** View enum */
export enum ViewTargetType {
  MEMBER = 'MEMBER',
  PACKAGE = 'PACKAGE',
  ARTICLE = 'ARTICLE',
  TRAVEL_MATE_POST = 'TRAVEL_MATE_POST',
  NOTICE = 'NOTICE',
}

/** Like enum */
export enum LikeTargetType {
  PACKAGE = 'PACKAGE',
  ARTICLE = 'ARTICLE',
  COMMENT = 'COMMENT',
  REVIEW = 'REVIEW',
  MEMBER = 'MEMBER',
}

/** Comment enum */
export enum CommentStatus {
  ACTIVE = 'ACTIVE',
  HIDDEN = 'HIDDEN',
  DELETED = 'DELETED',
}
/** Review enum */
export enum ReviewStatus {
  ACTIVE = 'ACTIVE',
  HIDDEN = 'HIDDEN',
  DELETED = 'DELETED',
}
/** Travel-Mate-Post enum */
export enum TravelMatePostStatus {
  ACTIVE = 'ACTIVE',
  FULL = 'FULL',
  CLOSED = 'CLOSED',
  DELETED = 'DELETED',
}
/** Travel-Mate-Join enum */

export enum TravelMateJoinStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}




