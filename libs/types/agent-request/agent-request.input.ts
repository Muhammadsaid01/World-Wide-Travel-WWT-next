import { Direction } from '@/libs/enums/common.enum';
import { AgentRequestStatus } from '../../enums/member.enum';

export interface AgentRequestInput {
	companyName: string;
	businessNumber: string;
	licenseNumber: string;
	agentDescription: string;
}

interface ARSearch {
	requestStatus?: AgentRequestStatus;
	text?: string;
}

export interface AgentRequestRejectInput {
	rejectReason: string;
}

export interface AgentRequestsInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: ARSearch;
}