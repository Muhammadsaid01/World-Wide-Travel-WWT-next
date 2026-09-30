import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPackageUpdate, initialValues, schedulesToValues } from '../libs/components/package/PackageForm/formState';
import { runEditActions } from '../libs/components/package/PackageForm/editProgress';
import { PackageLevel, PackageType, ScheduleStatus, TransportType } from '../libs/enums/package.enum';

const confirmed = () => Promise.resolve({ data: { saved: { _id: 'saved-id' } } });

test('partial edit retry skips confirmed writes', async () => {
	const progress = { next: 0 };
	let creates = 0;
	let reject = true;
	const actions = [
		async () => {
			creates++;
			return confirmed();
		},
		async () => {
			if (reject) throw new Error('validation failed');
			return confirmed();
		},
	];
	await assert.rejects(runEditActions(actions, progress, () => {}));
	assert.equal(progress.next, 1);
	reject = false;
	await runEditActions(actions, progress, () => {});
	assert.equal(creates, 1);
	assert.equal(progress.next, 2);
});

test('missing mutation confirmation does not advance edit progress', async () => {
	const progress = { next: 0 };
	await assert.rejects(
		runEditActions([async () => ({ data: null })], progress, () => {}),
		/no confirmation/,
	);
	assert.equal(progress.next, 0);
});

test('session check stops the next mutation', async () => {
	let writes = 0;
	await assert.rejects(
		runEditActions(
			[
				async () => {
					writes++;
					return confirmed();
				},
			],
			{ next: 0 },
			() => {
				throw new Error('session changed');
			},
		),
	);
	assert.equal(writes, 0);
});

test('edit input clears optional text and coordinates and applies declared defaults', () => {
	const result = buildPackageUpdate('package-id', initialValues, ['image']);
	assert.equal(result._id, 'package-id');
	assert.equal(result.packageShortDesc, '');
	assert.equal(result.meetingPoint, '');
	assert.equal(result.latitude, null);
	assert.equal(result.longitude, null);
	assert.equal(result.currency, 'USD');
	assert.equal(result.minPeople, 1);
	assert.equal(result.packageType, PackageType.TOUR);
	assert.equal(result.packageLevel, PackageLevel.STANDARD);
	assert.equal(result.transportType, TransportType.MIXED);
	assert.equal(buildPackageUpdate('id', { ...initialValues, latitude: '0', longitude: '0' }, []).latitude, 0);
});

test('schedule prefill uses date-input values and preserves IDs and zero seats', () => {
	const result = schedulesToValues([
		{
			_id: 'schedule-id',
			startDate: '2027-01-02T09:00:00.000Z',
			endDate: '2027-01-03T18:00:00.000Z',
			availableSeats: 0,
			scheduleStatus: ScheduleStatus.OPEN,
		},
	]);
	assert.deepEqual(result[0], {
		_id: 'schedule-id',
		startDate: '2027-01-02',
		endDate: '2027-01-03',
		availableSeats: '0',
		scheduleStatus: ScheduleStatus.OPEN,
	});
});
