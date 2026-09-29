import PackageFields, { FieldsProps } from './PackageFields';
export default function PricingStep(props: FieldsProps) {
	return <PackageFields {...props} fields={['packagePrice', 'currency']} />;
}
