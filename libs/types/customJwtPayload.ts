
import type { JwtPayload } from 'jwt-decode';

import {
	MemberAuthType,
	MemberStatus,
	MemberType,
} from '../enums/member.enum';

export interface CustomJwtPayload extends JwtPayload {
	_id: string;

	memberType: MemberType;
	memberStatus: MemberStatus;
	memberAuthType: MemberAuthType;

	memberNick: string;

	memberFullName?: string;
	memberPhone?: string;
	memberEmail?: string;
	memberImage?: string;
}