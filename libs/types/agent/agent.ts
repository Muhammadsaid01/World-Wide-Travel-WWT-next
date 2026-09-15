
import { AgentStatus, AgentVerificationStatus } from '../../enums/member.enum';
import { Member, TotalCounter } from '../member/member';

export interface Agent {
  _id: string;
  memberId: string;
  memberData?: Member;

  companyName: string;
  businessNumber: string;
  licenseNumber: string;

  officeAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  agentDesc?: string;

  agentStatus: AgentStatus;
  verificationStatus: AgentVerificationStatus;

  agentRating: number;
  agentReviewCount: number;
  agentFollowerCount: number;
  agentPackageCount: number;
  agentBookingCount: number;
  agentTotalSales: number;
  agentRank: number;

  agentApprovedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentProfileData {
  _id: string;
  memberId: string;

  companyName: string;
  businessNumber: string;
  licenseNumber: string;

  officeAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  agentDesc?: string;
}

export interface Agents {
  list: Agent[];
  metaCounter?: TotalCounter[];
}