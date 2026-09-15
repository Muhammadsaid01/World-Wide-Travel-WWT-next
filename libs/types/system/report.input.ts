import { Direction } from '../../enums/common.enum';

import {
	ReportStatus,
	ReportTargetType,
	ReportType,
} from '../../enums/system.enum';

export interface ReportInput {
	targetId: string;
	targetType: ReportTargetType;
	reportType: ReportType;

	reportDesc?: string;
}

interface ReportSearch {
	reporterId?: string;
	targetId?: string;

	targetType?: ReportTargetType;
	reportStatus?: ReportStatus;
}

export interface ReportsInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: ReportSearch;
}

export interface UpdateReportStatusInput {
	reportId: string;
	reportStatus: ReportStatus;

	adminNote?: string;
}