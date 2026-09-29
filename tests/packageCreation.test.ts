import test from 'node:test';
import assert from 'node:assert/strict';
import { PackageCategory, ScheduleStatus } from '../libs/enums/package.enum';
import {
	initialValues,
	buildPackageInput,
	validatePackage,
	validateItineraries,
	validateSchedules,
	type ScheduleValues,
} from '../libs/components/package/PackageForm/formState';
import { publishPackage, type PublishProgress } from '../libs/components/package/PackageForm/publishPackage';

const values = {
	...initialValues,
	packageTitle: 'Test trip',
	packageDesc: 'A full description.',
	packageCategory: PackageCategory.NATURE,
	destinationCountry: 'Korea',
	destinationCity: 'Seoul',
	packageDays: '1',
	packageNights: '0',
	packagePrice: '0',
	maxPeople: '4',
};
const input = buildPackageInput(values, ['uploads/package/test.png']);
const days = [
	{ dayNumber: '1', title: 'Arrival', description: 'Meet at the station.' },
	{ dayNumber: '2', title: 'Explore', description: 'Explore the city.' },
];
const schedules: ScheduleValues[] = [
	{ startDate: '2027-01-01', endDate: '2027-01-02', availableSeats: '0', scheduleStatus: ScheduleStatus.OPEN },
];
const newProgress = (): PublishProgress => ({ packageId: '', itineraries: 0, schedules: 0 });

test('required input supports zero values and omits blank optional fields', () => {
	assert.deepEqual(validatePackage(values, input.packageImages), {});
	assert.equal(input.packagePrice, 0);
	assert.equal(input.packageNights, 0);
	assert.equal('minPeople' in input, false);
	assert.equal('currency' in input, false);
	assert.equal('itineraries' in input, false);
	assert.equal('schedules' in input, false);
	const coordinates = buildPackageInput({ ...values, latitude: '0', longitude: '0' }, input.packageImages);
	assert.equal(coordinates.latitude, 0);
	assert.equal(coordinates.longitude, 0);
});

test('invalid required fields, missing uploads, fractions and inverted group sizes are rejected', () => {
	const errors = validatePackage(
		{ ...values, packageTitle: 'a', packageDesc: 'short', packageDays: '1.5', minPeople: '5', packagePrice: '-1' },
		[],
	);
	for (const field of [
		'packageTitle',
		'packageDesc',
		'packageDays',
		'minPeople',
		'packagePrice',
		'packageImages',
	] as const)
		assert.ok(errors[field]);
	assert.ok(validatePackage({ ...values, maxPeople: '2147483648' }, input.packageImages).maxPeople);
});

test('separate resources validate uniqueness, chronology and zero-seat schedules', () => {
	assert.deepEqual(validateItineraries(days), ['', '']);
	assert.ok(validateItineraries([days[0], { ...days[1], dayNumber: '1' }]).every(Boolean));
	assert.deepEqual(validateSchedules(schedules), ['']);
	assert.ok(validateSchedules([{ ...schedules[0], endDate: schedules[0].startDate }])[0]);
	assert.ok(validateSchedules([schedules[0], schedules[0]]).every(Boolean));
	assert.ok(validateSchedules([{ ...schedules[0], availableSeats: '1.5' }])[0]);
	assert.deepEqual(validateSchedules([]), []);
	assert.deepEqual(validateItineraries([]), []);
});

test('publish waits for package ID and persists dependent resources in order', async () => {
	const calls: string[] = [];
	const progress = newProgress();
	await publishPackage(input, days, schedules, progress, {
		createPackage: async (data) => {
			assert.deepEqual(data, input);
			calls.push('package');
			return 'real-id';
		},
		createItinerary: async (data) => {
			assert.equal(data.packageId, 'real-id');
			calls.push(`day-${data.dayNumber}`);
			return 'day-id';
		},
		createSchedule: async (data) => {
			assert.equal(data.packageId, 'real-id');
			assert.equal(data.availableSeats, 0);
			calls.push('schedule');
			return 'schedule-id';
		},
	});
	assert.deepEqual(calls, ['package', 'day-1', 'day-2', 'schedule']);
	assert.deepEqual(progress, { packageId: 'real-id', itineraries: 2, schedules: 1 });
});

test('partial failure preserves confirmed progress and retry never recreates confirmed resources', async () => {
	const calls: string[] = [];
	const progress = newProgress();
	let fail = true;
	const operations = {
		createPackage: async () => {
			calls.push('package');
			return 'real-id';
		},
		createItinerary: async (data: { dayNumber: number }) => {
			calls.push(`day-${data.dayNumber}`);
			if (data.dayNumber === 2 && fail) throw new Error('Rejected');
			return 'day-id';
		},
		createSchedule: async () => {
			calls.push('schedule');
			return 'schedule-id';
		},
	};
	await assert.rejects(publishPackage(input, days, schedules, progress, operations), /Rejected/);
	assert.deepEqual(progress, { packageId: 'real-id', itineraries: 1, schedules: 0 });
	assert.equal(calls.includes('schedule'), false);
	fail = false;
	await publishPackage(input, days, schedules, progress, operations);
	assert.deepEqual(calls, ['package', 'day-1', 'day-2', 'day-2', 'schedule']);
});

test('unconfirmed package cannot produce dependent writes or a success result', async () => {
	let dependentCalls = 0;
	await assert.rejects(
		publishPackage(input, days, schedules, newProgress(), {
			createPackage: async () => '',
			createItinerary: async () => {
				dependentCalls++;
				return '';
			},
			createSchedule: async () => {
				dependentCalls++;
				return '';
			},
		}),
		/not confirmed/,
	);
	assert.equal(dependentCalls, 0);
});

test('failed schedule is not counted as saved', async () => {
	const progress = newProgress();
	await assert.rejects(
		publishPackage(input, [], schedules, progress, {
			createPackage: async () => 'real-id',
			createItinerary: async () => 'unused',
			createSchedule: async () => '',
		}),
		/Schedule creation was not confirmed/,
	);
	assert.deepEqual(progress, { packageId: 'real-id', itineraries: 0, schedules: 0 });
});
