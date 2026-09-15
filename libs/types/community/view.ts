import { ViewTargetType } from '../../enums/community.enum';

export interface View {
	_id: string;

	viewerId: string;
	targetId: string;

	targetType: ViewTargetType;

	viewedAt: string;
}