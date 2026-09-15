import { LikeTargetType } from '../../enums/community.enum';

export interface Like {
	_id: string;

	memberId: string;
	targetId: string;
	targetType: LikeTargetType;

	createdAt: string;
	updatedAt: string;
}

export interface MeLiked {
	memberId: string;
	targetId: string;
	targetType: LikeTargetType;

	meLiked: boolean;
}