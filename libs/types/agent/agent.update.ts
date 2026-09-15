import { AgentStatus, AgentVerificationStatus } from '../../enums/member.enum';

export interface AgentUpdate {
  companyName?: string;
  officeAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  agentDesc?: string;
}

export interface UpdateAgentByAdmin {
  agentId: string;
  agentStatus?: AgentStatus;
  verificationStatus?: AgentVerificationStatus;
}