import { Direction } from '../../enums/common.enum';
import { ViewTargetType } from '../../enums/community.enum';

export interface ViewInput {
	viewerId: string;
	targetId: string;
	targetType: ViewTargetType;
}

interface VISearch {
	viewerId?: string;
	targetId?: string;
	targetType?: ViewTargetType;
}

export interface ViewsInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: VISearch;
}