export type EditProgress = { next: number };
export type EditAction = () => Promise<{ data?: Record<string, { _id?: string }> | null }>;

/** Advance only after a confirmed response; a retry resumes after completed writes. */
export async function runEditActions(actions: EditAction[], progress: EditProgress, checkAccess: () => void) {
	while (progress.next < actions.length) {
		checkAccess();
		const response = await actions[progress.next]();
		if (!response.data || !Object.values(response.data).some((item) => item?._id)) {
			throw new Error('The last save returned no confirmation.');
		}
		progress.next++;
	}
}
