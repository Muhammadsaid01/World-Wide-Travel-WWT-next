import { useState } from 'react';
import { Button, Chip, IconButton, TextField, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Close from '@mui/icons-material/Close';
import { cleanList } from './tripDetailsState';
export default function StringListEditor({
	label,
	helper,
	addLabel,
	items,
	onChange,
	disabled,
	error,
	chips = false,
}: {
	label: string;
	helper: string;
	addLabel: string;
	items: string[];
	onChange: (items: string[]) => void;
	disabled: boolean;
	error?: string;
	chips?: boolean;
}) {
	const [editing, setEditing] = useState<number | null>(null);
	function commit(index: number) {
		if (chips) onChange(cleanList(items, true));
		else onChange(items.map((item, i) => (i === index ? item.trim() : item)));
		setEditing(null);
	}
	return (
		<section className={`trip-string-list ${chips ? 'trip-tags' : ''}`}>
			<Typography component="h3">{label}</Typography>
			<Typography className="trip-helper" color="text.secondary">
				{helper}
			</Typography>
			<div className={chips ? 'trip-tag-items' : 'trip-list-items'}>
				{items.map((item, index) =>
					chips && editing !== index && item.trim() ? (
						<Chip
							key={index}
							label={item}
							disabled={disabled}
							onDelete={() => onChange(items.filter((_, i) => i !== index))}
						/>
					) : (
						<div className="trip-list-row" key={index}>
							<TextField
								autoFocus={editing === index}
								size="small"
								fullWidth
								label={`${chips ? 'Tag' : label + ' item'} ${index + 1}`}
								value={item}
								disabled={disabled}
								onChange={(event) => onChange(items.map((value, i) => (i === index ? event.target.value : value)))}
								onBlur={() => commit(index)}
								onKeyDown={(event) => {
									if (event.key === 'Enter') {
										event.preventDefault();
										commit(index);
									}
								}}
							/>
							<IconButton
								size="small"
								disabled={disabled}
								aria-label={`Remove ${label.toLowerCase()} item ${index + 1}`}
								onMouseDown={(event) => event.preventDefault()}
								onClick={() => {
									onChange(items.filter((_, i) => i !== index));
									setEditing(null);
								}}
							>
								<Close fontSize="small" />
							</IconButton>
						</div>
					),
				)}
			</div>
			{error && (
				<Typography role="alert" color="error" variant="caption">
					{error}
				</Typography>
			)}
			<Button
				startIcon={<Add />}
				disabled={disabled}
				onClick={() => {
					const blank = items.findIndex((item) => !item.trim());
					if (blank >= 0) {
						setEditing(blank);
						return;
					}
					setEditing(items.length);
					onChange([...items, '']);
				}}
			>
				{addLabel}
			</Button>
		</section>
	);
}
