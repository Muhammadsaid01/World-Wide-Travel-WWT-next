import { ReportStatus, ReportTargetType, ReportType } from '@/libs/enums/system.enum';

export const REPORT_REASON_OPTIONS = [
	{ value: ReportType.SPAM, label: 'Spam' },
	{ value: ReportType.INAPPROPRIATE, label: 'Inappropriate content' },
	{ value: ReportType.HARASSMENT, label: 'Harassment' },
	{ value: ReportType.FAKE_INFORMATION, label: 'False information' },
	{ value: ReportType.COPYRIGHT, label: 'Copyright violation' },
	{ value: ReportType.OTHER, label: 'Other' },
] as const;

export const REPORT_TARGET_OPTIONS = [
	{ value: ReportTargetType.MEMBER, label: 'Member' },
	{ value: ReportTargetType.ARTICLE, label: 'Article' },
	{ value: ReportTargetType.COMMENT, label: 'Comment' },
	{ value: ReportTargetType.REVIEW, label: 'Review' },
	{ value: ReportTargetType.TRAVEL_MATE_POST, label: 'Travel Mate post' },
] as const;

export const REPORT_STATUS_OPTIONS = [
	{ value: ReportStatus.PENDING, label: 'Pending' },
	{ value: ReportStatus.REVIEWED, label: 'Reviewed' },
	{ value: ReportStatus.REJECTED, label: 'Rejected' },
	{ value: ReportStatus.RESOLVED, label: 'Resolved' },
] as const;

export function reportReasonLabel(value: ReportType) {
	return REPORT_REASON_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function reportTargetLabel(value: ReportTargetType) {
	return REPORT_TARGET_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function reportStatusLabel(value: ReportStatus) {
	return REPORT_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function reportStatusClass(value: ReportStatus) {
	return `status-${value.toLowerCase()}`;
}

export function reportTransitions(value: ReportStatus): ReportStatus[] {
	if (value === ReportStatus.PENDING) {
		return [ReportStatus.REVIEWED, ReportStatus.REJECTED, ReportStatus.RESOLVED];
	}
	if (value === ReportStatus.REVIEWED) return [ReportStatus.REJECTED, ReportStatus.RESOLVED];
	return [];
}

export function isMongoId(value?: string | null): value is string {
	return Boolean(value && /^[a-f\d]{24}$/i.test(value));
}
