import { LikeTargetType } from '../../enums/community.enum';

export interface LikeInput {
	memberId: string;
	targetId: string;
	targetType: LikeTargetType;
}