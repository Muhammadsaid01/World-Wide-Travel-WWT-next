import { TextField, Typography } from '@mui/material';
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined';
import PeopleOutline from '@mui/icons-material/PeopleOutlined';
import DirectionsBusOutlined from '@mui/icons-material/DirectionsBusOutlined';
import PackageFields, { FieldsProps } from './PackageFields';
import StringListEditor from './StringListEditor';
import type { TripDetailsErrors, TripDetailsValues } from './tripDetailsState';
export default function TripDetailsStep({
	details,
	detailErrors,
	onDetailsChange,
	...props
}: FieldsProps & {
	details: TripDetailsValues;
	detailErrors: TripDetailsErrors;
	onDetailsChange: (values: TripDetailsValues) => void;
}) {
	return (
		<div className="trip-details-step">
			<Typography className="trip-intro" color="text.secondary">
				Define the duration, group size, transportation, inclusions, exclusions, tags, and package policies.
			</Typography>
			<div className="trip-top-panels">
				<section className="trip-panel">
					<Typography component="h3">
						<ScheduleOutlined />
						Duration
					</Typography>
					<PackageFields {...props} fields={['packageDays', 'packageNights']} />
				</section>
				<section className="trip-panel">
					<Typography component="h3">
						<PeopleOutline />
						Group Size
					</Typography>
					<PackageFields {...props} fields={['minPeople', 'maxPeople']} />
				</section>
			</div>
			<section className="trip-transport">
				<Typography component="h3">
					<DirectionsBusOutlined />
					Transportation
				</Typography>
				<PackageFields {...props} fields={['transportType']} />
			</section>
			<div className="trip-lists">
				<StringListEditor
					label="Package Includes"
					helper="Add services and benefits included in the package price."
					addLabel="Add Included Item"
					items={details.packageIncludes}
					onChange={(packageIncludes) => onDetailsChange({ ...details, packageIncludes })}
					disabled={props.disabled}
					error={detailErrors.packageIncludes}
				/>
				<StringListEditor
					label="Package Excludes"
					helper="Clarify costs or services that travelers must arrange separately."
					addLabel="Add Excluded Item"
					items={details.packageExcludes}
					onChange={(packageExcludes) => onDetailsChange({ ...details, packageExcludes })}
					disabled={props.disabled}
					error={detailErrors.packageExcludes}
				/>
			</div>
			<StringListEditor
				chips
				label="Tags"
				helper="Add tags to help travelers discover this package."
				addLabel="Add Tag"
				items={details.packageTags}
				onChange={(packageTags) => onDetailsChange({ ...details, packageTags })}
				disabled={props.disabled}
				error={detailErrors.packageTags}
			/>
			<section className="trip-policy">
				<Typography component="h3">Cancellation &amp; Package Policy</Typography>
				<Typography className="trip-helper" color="text.secondary">
					Optional. To add a policy, provide both cancellation and refund terms.
				</Typography>
				<TextField
					fullWidth
					multiline
					minRows={5}
					label="Cancellation Policy"
					placeholder="Describe cancellation, rescheduling, and no-show policies…"
					value={details.cancelPolicy}
					disabled={props.disabled}
					onChange={(event) => onDetailsChange({ ...details, cancelPolicy: event.target.value })}
					error={Boolean(detailErrors.cancelPolicy)}
					helperText={detailErrors.cancelPolicy}
				/>
				<TextField
					fullWidth
					multiline
					minRows={4}
					label="Refund Policy"
					placeholder="Describe refund eligibility, amounts, and processing times…"
					value={details.refundPolicy}
					disabled={props.disabled}
					onChange={(event) => onDetailsChange({ ...details, refundPolicy: event.target.value })}
					error={Boolean(detailErrors.refundPolicy)}
					helperText={detailErrors.refundPolicy}
				/>
			</section>
		</div>
	);
}
