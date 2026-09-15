import type { AgentRequestStatus } from '../../enums/member.enum';
import type { TotalCounter } from '../../types/member/member';

export interface AgentRequest {
	_id: string;
	memberId: string;

	companyName: string;
	businessNumber: string;
	licenseNumber: string;
	agentDescription: string;

	requestStatus: AgentRequestStatus;

	rejectReason?: string;
	reviewedBy?: string;

	reviewedAt?: string;

	createdAt: string;
	updatedAt: string;
}

export interface AgentRequests {
	list: AgentRequest[];
	metaCounter?: TotalCounter[];
}