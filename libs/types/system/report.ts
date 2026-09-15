import {
	ReportStatus,
	ReportTargetType,
	ReportType,
} from '../../enums/system.enum';

import type { TotalCounter } from '@/libs/types/member/member';

export interface ReportEntity {
	_id: string;

	reporterId: string;
	targetId: string;

	targetType: ReportTargetType;
	reportType: ReportType;

	reportDesc?: string;

	reportStatus: ReportStatus;

	reviewedBy?: string;
	reviewedAt?: string;

	adminNote?: string;

	createdAt: string;
	updatedAt: string;
}

export interface Reports {
	list: ReportEntity[];
	metaCounter?: TotalCounter[];
}