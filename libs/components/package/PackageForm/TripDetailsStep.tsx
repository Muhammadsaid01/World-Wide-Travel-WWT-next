import PackageFields, { FieldsProps } from './PackageFields';
export default function TripDetailsStep(props: FieldsProps) {
	return (
		<PackageFields {...props} fields={['packageDays', 'packageNights', 'minPeople', 'maxPeople', 'transportType']} />
	);
}
