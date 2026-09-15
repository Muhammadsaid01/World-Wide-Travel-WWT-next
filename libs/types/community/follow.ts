import type { MeLiked } from '../../types/community/like';
import type { Member, TotalCounter } from '../../types/member/member';

export interface MeFollowed {
	followingId: string;
	followerId: string;
	myFollowing: boolean;
}

export interface Follower {
	_id: string;

	followerId: string;
	followingId: string;

	createdAt: string;
	updatedAt: string;

	/** From aggregation */
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
	followerData?: Member;
}

export interface Following {
	_id: string;

	followingId: string;
	followerId: string;

	createdAt: string;
	updatedAt: string;

	/** From aggregation */
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
	followingData?: Member;
}

export interface Followings {
	list: Following[];
	metaCounter: TotalCounter[];
}

export interface Followers {
	list: Follower[];
	metaCounter: TotalCounter[];
}