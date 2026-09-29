import { Alert, Button, Typography } from '@mui/material';
import AddPhotoAlternateOutlined from '@mui/icons-material/AddPhotoAlternateOutlined';
import PackageFields, { FieldsProps } from './PackageFields';
import PackageImage from '../PackageImage';
export default function BasicInfoStep({
	images,
	uploading,
	onUpload,
	onRemove,
	...props
}: FieldsProps & {
	images: string[];
	uploading: boolean;
	onUpload: (files: File[]) => void;
	onRemove: (index: number) => void;
}) {
	return (
		<>
			<PackageFields
				{...props}
				fields={['packageTitle', 'packageShortDesc', 'packageDesc', 'packageType', 'packageCategory', 'packageLevel']}
			/>
			<section className="package-form-upload">
				<Typography component="h3">Package Images</Typography>
				<Typography color="text.secondary">
					Upload JPG or PNG images, up to 15 MB each. The first image is the cover.
				</Typography>
				<Button
					component="label"
					variant="outlined"
					disabled={props.disabled}
					startIcon={<AddPhotoAlternateOutlined />}
				>
					{uploading ? 'Uploading…' : images.length ? 'Upload More Images' : 'Upload Package Cover'}
					<input
						hidden
						type="file"
						multiple
						accept="image/jpeg,image/png"
						disabled={props.disabled}
						onChange={(event) => {
							const files = Array.from(event.target.files ?? []);
							event.target.value = '';
							onUpload(files);
						}}
					/>
				</Button>
				{props.errors.packageImages && <Alert severity="error">{props.errors.packageImages}</Alert>}
				<div className="package-form-images">
					{images.map((path, index) => (
						<div key={`${path}-${index}`}>
							<div className="package-form-image">
								<PackageImage path={path} alt={`Package image ${index + 1}`} />
							</div>
							<Button
								color="error"
								disabled={props.disabled}
								onClick={() => onRemove(index)}
								aria-label={`Remove image ${index + 1}`}
							>
								Remove
							</Button>
						</div>
					))}
				</div>
			</section>
		</>
	);
}
