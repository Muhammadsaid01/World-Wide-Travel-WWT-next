import type { PackageExclude } from '../../../types/package/package-exclude';
import type { PackageExcludeInput } from '../../../types/package/package-exclude.input';
import type { PackageInclude } from '../../../types/package/package-include';
import type { PackageIncludeInput } from '../../../types/package/package-include.input';
import type { PackagePolicy } from '../../../types/package/package-policy';
import type { PackagePolicyInput } from '../../../types/package/package-policy.input';
import type { PackageTag } from '../../../types/package/package-tag';
import type { PackageTagInput } from '../../../types/package/package-tag.input';
export interface TripDetailsValues {
	packageIncludes: string[];
	packageExcludes: string[];
	packageTags: string[];
	cancelPolicy: string;
	refundPolicy: string;
}
export const initialTripDetails: TripDetailsValues = {
	packageIncludes: [],
	packageExcludes: [],
	packageTags: [],
	cancelPolicy: '',
	refundPolicy: '',
};
export type TripDetailsErrors = Partial<Record<keyof TripDetailsValues, string>>;
export function cleanList(items: string[], unique = false): string[] {
	const result: string[] = [];
	for (const item of items) {
		const value = item.trim();
		if (value && (!unique || !result.some((existing) => existing.toLowerCase() === value.toLowerCase())))
			result.push(value);
	}
	return result;
}
export function validateTripDetails(values: TripDetailsValues): TripDetailsErrors {
	const errors: TripDetailsErrors = {};
	for (const key of ['packageIncludes', 'packageExcludes', 'packageTags'] as const) {
		const max = key === 'packageTags' ? 50 : 200;
		if (cleanList(values[key]).some((value) => value.length < 2 || value.length > max))
			errors[key] = `Use 2–${max} characters per item.`;
	}
	if (values.cancelPolicy.trim() || values.refundPolicy.trim()) {
		for (const key of ['cancelPolicy', 'refundPolicy'] as const) {
			const length = values[key].trim().length;
			if (length < 10 || length > 3000) errors[key] = 'Provide both policies, using 10–3000 characters each.';
		}
	}
	return errors;
}
export interface TripDetailsProgress {
	includes: number;
	excludes: number;
	tags: number;
	policy: boolean;
}
export const newTripDetailsProgress = (): TripDetailsProgress => ({ includes: 0, excludes: 0, tags: 0, policy: false });
export interface TripDetailsOperations {
	createInclude: (input: PackageIncludeInput) => Promise<string>;
	createExclude: (input: PackageExcludeInput) => Promise<string>;
	createTag: (input: PackageTagInput) => Promise<string>;
	createPolicy: (input: PackagePolicyInput) => Promise<string>;
}
export async function publishTripDetails(
	packageId: string,
	values: TripDetailsValues,
	progress: TripDetailsProgress,
	operations: TripDetailsOperations,
) {
	if (!packageId) throw new Error('A confirmed package ID is required.');
	const lists = {
		includes: cleanList(values.packageIncludes),
		excludes: cleanList(values.packageExcludes),
		tags: cleanList(values.packageTags, true),
	};
	for (const key of ['includes', 'excludes', 'tags'] as const) {
		while (progress[key] < lists[key].length) {
			const value = lists[key][progress[key]];
			const id =
				key === 'includes'
					? await operations.createInclude({ packageId, content: value })
					: key === 'excludes'
						? await operations.createExclude({ packageId, title: value })
						: await operations.createTag({ packageId, tagName: value });
			if (!id) throw new Error(`${key} creation was not confirmed by the server.`);
			progress[key]++;
		}
	}
	if (!progress.policy && (values.cancelPolicy.trim() || values.refundPolicy.trim())) {
		const id = await operations.createPolicy({
			packageId,
			cancelPolicy: values.cancelPolicy.trim(),
			refundPolicy: values.refundPolicy.trim(),
		});
		if (!id) throw new Error('Policy creation was not confirmed by the server.');
		progress.policy = true;
	}
}



export function packageTripDetailsToValues(
        includes: Pick<PackageInclude, 'content'>[],
        excludes: Pick<PackageExclude, 'title'>[],
        tags: Pick<PackageTag, 'tagName'>[],
        policies: Pick<PackagePolicy, 'cancelPolicy' | 'refundPolicy'>[],
): TripDetailsValues {
        const policy = policies[0];

        return {
                packageIncludes: includes.map((item) => item.content),
                packageExcludes: excludes.map((item) => item.title),
                packageTags: tags.map((item) => item.tagName),
                cancelPolicy: policy?.cancelPolicy ?? '',
                refundPolicy: policy?.refundPolicy ?? '',
        };
}