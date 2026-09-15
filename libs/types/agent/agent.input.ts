import { Direction } from '../../enums/common.enum';
import { AgentStatus, AgentVerificationStatus } from '../../enums/member.enum';


interface AISearch {
  text?: string;
  agentStatus?: AgentStatus;
  verificationStatus?: AgentVerificationStatus;
}

export interface AgentsInquiry {
  page: number;
  limit: number;

  sort?: string;
  direction?: Direction;
  search?: AISearch;
}

export interface UpdateAgentStatusInput {
  agentId: string;
  agentStatus: AgentStatus;
}

export interface UpdateAgentVerificationInput {
  agentId: string;
  verificationStatus: AgentVerificationStatus;
}