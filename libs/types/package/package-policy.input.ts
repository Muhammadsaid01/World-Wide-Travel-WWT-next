export interface PackagePolicyInput {
	packageId: string;

	cancelPolicy: string;
	refundPolicy: string;
}

export interface DeletePackagePolicyInput {
	_id: string;
}