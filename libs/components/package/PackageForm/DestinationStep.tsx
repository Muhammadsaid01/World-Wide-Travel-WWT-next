import PackageFields, { FieldsProps } from './PackageFields';
export default function DestinationStep(props: FieldsProps) {
	return (
		<PackageFields
			{...props}
			fields={['destinationCountry', 'destinationCity', 'meetingPoint', 'latitude', 'longitude']}
		/>
	);
}
