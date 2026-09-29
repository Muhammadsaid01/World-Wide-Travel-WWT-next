import type { ReactNode } from 'react';
import { Chip, Typography } from '@mui/material';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import PackageImage from '../PackageImage';
import { cleanList, TripDetailsValues } from './tripDetailsState';
import type { ItineraryValues, ScheduleValues, Values } from './formState';
import { durationLabel, enumLabel, formatPrice, groupLabel } from './preview';
function SummaryCard({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="review-summary-card">
			<Typography component="h3">{title}</Typography>
			{children}
		</section>
	);
}
function Definitions({ items }: { items: [string, string][] }) {
	return (
		<dl className="review-definition-grid">
			{items
				.filter(([, value]) => value.trim())
				.map(([label, value]) => (
					<div key={label}>
						<dt>{label}</dt>
						<dd>{value}</dd>
					</div>
				))}
		</dl>
	);
}
export default function ReviewStep({
	details,
	values,
	images,
	itineraries,
	schedules,
}: {
	details: TripDetailsValues;
	values: Values;
	images: string[];
	itineraries: ItineraryValues[];
	schedules: ScheduleValues[];
}) {
	const includes = cleanList(details.packageIncludes);
	const excludes = cleanList(details.packageExcludes);
	const tags = cleanList(details.packageTags, true);
	const inclusionGroups: [string, string[]][] = [
		['Includes', includes],
		['Excludes', excludes],
	];
	const duration = durationLabel(values);
	const group = groupLabel(values);
	const location = [values.destinationCity, values.destinationCountry].filter((value) => value.trim()).join(', ');
	return (
		<div className="review-layout">
			<div className="review-summary-stack">
				<SummaryCard title="Basic Information">
					<Definitions
						items={[
							['Package Title', values.packageTitle],
							['Tour Type', enumLabel(values.packageType)],
							['Category', enumLabel(values.packageCategory)],
							['Package Level', enumLabel(values.packageLevel)],
						]}
					/>
					{values.packageShortDesc.trim() && <p className="review-description">{values.packageShortDesc}</p>}
					{values.packageDesc.trim() && (
						<details className="review-description">
							<summary>Full description</summary>
							<p>{values.packageDesc}</p>
						</details>
					)}
				</SummaryCard>
				<SummaryCard title="Destination">
					<Definitions
						items={[
							['Country', values.destinationCountry],
							['City', values.destinationCity],
							['Meeting Point', values.meetingPoint],
						]}
					/>
					{(values.latitude.trim() || values.longitude.trim()) && (
						<p className="review-coordinates">
							{values.latitude.trim() && `Latitude: ${values.latitude}`}{' '}
							{values.longitude.trim() && `Longitude: ${values.longitude}`}
						</p>
					)}
				</SummaryCard>
				<SummaryCard title="Trip Details">
					<Definitions
						items={[
							['Duration', duration],
							['Group Size', group],
							['Transport', enumLabel(values.transportType)],
						]}
					/>
					{(includes.length > 0 || excludes.length > 0) && (
						<div className="review-inclusions">
							{inclusionGroups.map(
								([title, items]) =>
									items.length > 0 && (
										<div key={title}>
											<h4>{title}</h4>
											<ul>
												{items.map((item, index) => (
													<li key={index}>{item}</li>
												))}
											</ul>
										</div>
									),
							)}
						</div>
					)}
					{tags.length > 0 && (
						<div className="review-tags">
							<h4>Tags</h4>
							<div>
								{tags.map((tag) => (
									<Chip key={tag} label={tag} size="small" />
								))}
							</div>
						</div>
					)}
					{details.cancelPolicy.trim() && (
						<div className="review-policy">
							<h4>Cancellation Policy</h4>
							<p>{details.cancelPolicy.trim()}</p>
						</div>
					)}
					{details.refundPolicy.trim() && (
						<div className="review-policy">
							<h4>Refund Policy</h4>
							<p>{details.refundPolicy.trim()}</p>
						</div>
					)}
				</SummaryCard>
				<SummaryCard title="Itinerary Highlight">
					{itineraries.length ? (
						<ol className="review-itinerary">
							{itineraries.map((item, index) => (
								<li key={index}>
									<span>Day {item.dayNumber}</span>
									<strong>{item.title}</strong>
								</li>
							))}
						</ol>
					) : (
						<p className="review-empty">No itinerary added.</p>
					)}
				</SummaryCard>
				<SummaryCard title="Departure Schedules">
					{schedules.length ? (
						<div className="review-schedule-table">
							<table>
								<thead>
									<tr>
										<th>Date Range</th>
										<th>Seats</th>
										<th>Status</th>
									</tr>
								</thead>
								<tbody>
									{schedules.map((item, index) => (
										<tr key={index}>
											<td>
												<time dateTime={item.startDate}>{item.startDate}</time>
												<span> – </span>
												<time dateTime={item.endDate}>{item.endDate}</time>
											</td>
											<td>{item.availableSeats}</td>
											<td>
												<span className="review-schedule-status">
													{item.scheduleStatus ? enumLabel(item.scheduleStatus) : 'Default'}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<p className="review-empty">No departure schedules added.</p>
					)}
				</SummaryCard>
				<SummaryCard title="Pricing">
					<div className="review-pricing">
						<Definitions
							items={[
								['Currency', values.currency.trim().toUpperCase() || 'Default currency'],
								['Price per Person', formatPrice(values.packagePrice, values.currency)],
							]}
						/>
					</div>
				</SummaryCard>
			</div>
			<aside className="review-sidebar">
				<section className="review-package-preview">
					<div className="package-form-image">
						<PackageImage path={images[0]} alt={values.packageTitle || 'Package cover'} />
					</div>
					<div className="review-preview-content">
						<span className="preview-eyebrow">Package Preview</span>
						<Typography component="h3">{values.packageTitle.trim() || 'Untitled Package'}</Typography>
						{location && <p className="review-preview-location">{location}</p>}
						<ul className="preview-facts">
							{duration && <li>{duration}</li>}
							{group && <li>{group}</li>}
							{values.transportType && <li>{enumLabel(values.transportType)}</li>}
						</ul>
						<div className="preview-price">
							<span>Base Package Price</span>
							<p>
								<strong>{formatPrice(values.packagePrice, values.currency)}</strong>
								{values.packagePrice.trim() && Number(values.packagePrice) >= 0 && <small> / person</small>}
							</p>
						</div>
					</div>
				</section>
				<div className="review-info-notice">
					<InfoOutlined fontSize="small" />
					<p>
						By publishing this package, you confirm that the information provided is accurate and ready to be shown on
						WWT.
					</p>
				</div>
			</aside>
		</div>
	);
}
