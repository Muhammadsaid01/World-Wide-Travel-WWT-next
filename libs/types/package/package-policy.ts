export interface PackagePolicy {
	_id: string;
	packageId: string;

	cancelPolicy: string;
	refundPolicy: string;

	createdAt: string;
	updatedAt: string;
}