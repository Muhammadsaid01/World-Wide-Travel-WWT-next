import { Typography } from '@mui/material';
import PackageImage from '../PackageImage';
import { fieldLabels, FieldName, ItineraryValues, ScheduleValues, stepFields, Values } from './formState';
export default function ReviewStep({
	values,
	images,
	itineraries,
	schedules,
}: {
	values: Values;
	images: string[];
	itineraries: ItineraryValues[];
	schedules: ScheduleValues[];
}) {
	const summary = (title: string, step: number) => (
		<section className="package-form-summary">
			<Typography component="h3">{title}</Typography>
			<dl>
				{stepFields[step]
					.filter((key): key is FieldName => key !== 'packageImages')
					.map((key) =>
						values[key].trim() ? (
							<div key={key}>
								<dt>{fieldLabels[key]}</dt>
								<dd>{values[key]}</dd>
							</div>
						) : null,
					)}
			</dl>
		</section>
	);
	return (
		<div className="package-form-review">
			<div>
				{summary('Basic Information', 0)}
				{summary('Destination', 1)}
				{summary('Trip Details', 2)}
				<section className="package-form-summary">
					<Typography component="h3">Itinerary</Typography>
					{itineraries.length ? (
						itineraries.map((item, index) => (
							<div key={index}>
								<h4>
									Day {item.dayNumber}: {item.title}
								</h4>
								<p>{item.description}</p>
							</div>
						))
					) : (
						<p>No itinerary added.</p>
					)}
				</section>
				<section className="package-form-summary">
					<Typography component="h3">Schedules</Typography>
					{schedules.length ? (
						schedules.map((item, index) => (
							<div key={index}>
								<h4>Schedule {index + 1}</h4>
								<p>
									{item.startDate} → {item.endDate}
								</p>
								<p>
									{item.availableSeats} seats · {item.scheduleStatus || 'Default status'}
								</p>
							</div>
						))
					) : (
						<p>No schedules added.</p>
					)}
				</section>
				{summary('Pricing', 5)}
			</div>
			<aside className="package-form-preview">
				<div className="package-form-image">
					<PackageImage path={images[0]} alt={values.packageTitle} />
				</div>
				<div>
					<Typography variant="overline">Package Preview</Typography>
					<Typography component="h3">{values.packageTitle}</Typography>
					<p>
						{values.destinationCity}, {values.destinationCountry}
					</p>
					<p>
						{values.packageDays} days · {values.packageNights} nights
					</p>
					<p>{values.packageShortDesc}</p>
					<strong>
						{values.currency} {values.packagePrice}
					</strong>
				</div>
				<div className="package-form-images">
					{images.slice(1).map((path, index) => (
						<div className="package-form-image" key={`${path}-${index}`}>
							<PackageImage path={path} alt={`Package image ${index + 2}`} />
						</div>
					))}
				</div>
			</aside>
		</div>
	);
}
