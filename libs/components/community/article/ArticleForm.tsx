import { useEffect, useState } from 'react';
import { Alert, Avatar, Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import AddPhotoAlternateOutlined from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import { ArticleCategory } from '@/libs/enums/community.enum';
import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';
import { packageImageUrl } from '../../package/PackageImage';
import { memberName } from '../communityState';

const maxFileSize = 15_000_000;
const categoryOptions: Array<{ value: ArticleCategory; label: string }> = [
	{ value: ArticleCategory.FREE, label: 'Free' },
	{ value: ArticleCategory.TRAVEL_TIP, label: 'Travel Tips' },
	{ value: ArticleCategory.TRAVEL_REVIEW, label: 'Travel Reviews' },
	{ value: ArticleCategory.QUESTION, label: 'Questions' },
	{ value: ArticleCategory.FIND_COMPANION, label: 'Find Companion' },
	{ value: ArticleCategory.NOTICE, label: 'Notice' },
];

export interface ArticleFormValues {
	articleTitle: string;
	articleCategory: ArticleCategory;
	articleContent: string;
	coverFile: File | null;
}

type ArticleFormErrors = Partial<Record<'articleTitle' | 'articleCategory' | 'articleContent' | 'coverFile', string>>;

export interface ArticleFormProps {
	member: Pick<CustomJwtPayload, 'memberNick' | 'memberFullName' | 'memberImage'>;
	submitting: boolean;
	submitError?: string;
	onSubmit: (values: ArticleFormValues) => void;
	onCancel: () => void;
}

function isAllowedImage(file: File) {
	return ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type) && /\.(jpe?g|png)$/i.test(file.name);
}

export default function ArticleForm({ member, submitting, submitError, onSubmit, onCancel }: ArticleFormProps) {
	const [articleTitle, setArticleTitle] = useState('');
	const [articleCategory, setArticleCategory] = useState<ArticleCategory | ''>('');
	const [articleContent, setArticleContent] = useState('');
	const [coverFile, setCoverFile] = useState<File | null>(null);
	const [coverPreview, setCoverPreview] = useState('');
	const [errors, setErrors] = useState<ArticleFormErrors>({});
	const displayName = memberName(member);

	useEffect(
		() => () => {
			if (coverPreview) URL.revokeObjectURL(coverPreview);
		},
		[coverPreview],
	);

	function selectCover(file?: File) {
		if (!file) return;
		if (!isAllowedImage(file)) {
			setErrors((previous) => ({ ...previous, coverFile: 'Choose a JPG, JPEG, or PNG image.' }));
			return;
		}
		if (file.size > maxFileSize) {
			setErrors((previous) => ({ ...previous, coverFile: 'Image must be 15 MB or smaller.' }));
			return;
		}
		if (coverPreview) URL.revokeObjectURL(coverPreview);
		setCoverFile(file);
		setCoverPreview(URL.createObjectURL(file));
		setErrors((previous) => ({ ...previous, coverFile: undefined }));
	}

	function removeCover() {
		if (coverPreview) URL.revokeObjectURL(coverPreview);
		setCoverFile(null);
		setCoverPreview('');
		setErrors((previous) => ({ ...previous, coverFile: undefined }));
	}

	function clearFieldError(field: keyof ArticleFormErrors) {
		setErrors((previous) => (previous[field] ? { ...previous, [field]: undefined } : previous));
	}

	function validate(): ArticleFormValues | null {
		const title = articleTitle.trim();
		const content = articleContent.trim();
		const nextErrors: ArticleFormErrors = {};
		if (!title) nextErrors.articleTitle = 'Enter a title for your story.';
		else if (title.length < 3 || title.length > 200) nextErrors.articleTitle = 'Use 3–200 characters.';
		if (!articleCategory) nextErrors.articleCategory = 'Choose a category.';
		if (!content) nextErrors.articleContent = 'Tell us about your journey.';
		else if (content.length < 10 || content.length > 10_000) nextErrors.articleContent = 'Use 10–10,000 characters.';
		if (errors.coverFile) nextErrors.coverFile = errors.coverFile;
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length || !articleCategory) return null;
		return { articleTitle: title, articleCategory, articleContent: content, coverFile };
	}

	return (
		<Paper
			component="form"
			className="travel-story-form-card"
			variant="outlined"
			onSubmit={(event) => {
				event.preventDefault();
				if (!submitting) {
					const values = validate();
					if (values) onSubmit(values);
				}
			}}
		>
			<header className="travel-story-form-heading">
				<Typography component="h1">Share Your Travel Story</Typography>
				<Typography>
					Inspire fellow travelers with the places, people, and moments that made your journey memorable.
				</Typography>
			</header>

			<div className="travel-story-form-fields">
				<TextField
					fullWidth
					label="Article Title"
					value={articleTitle}
					onChange={(event) => {
						setArticleTitle(event.target.value);
						clearFieldError('articleTitle');
					}}
					error={Boolean(errors.articleTitle)}
					helperText={errors.articleTitle || 'Give your story a clear, inviting title.'}
					slotProps={{ htmlInput: { maxLength: 200 } }}
				/>
				<TextField
					fullWidth
					select
					label="Category"
					value={articleCategory}
					onChange={(event) => {
						setArticleCategory(event.target.value as ArticleCategory | '');
						clearFieldError('articleCategory');
					}}
					error={Boolean(errors.articleCategory)}
					helperText={errors.articleCategory || 'Choose the category that best fits your story.'}
				>
					<MenuItem value="">Select a category</MenuItem>
					{categoryOptions.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))}
				</TextField>

				<section className="travel-story-form-upload" aria-labelledby="cover-image-title">
					<div>
						<Typography component="h2" id="cover-image-title">Cover Image</Typography>
						<Typography color="text.secondary">Optional. JPG, JPEG, or PNG up to 15 MB.</Typography>
					</div>
					{coverPreview ? (
						<div className="travel-story-cover-selected">
							<Box component="img" src={coverPreview} alt="Selected cover preview" />
							<div>
								<Typography>{coverFile?.name}</Typography>
								<Button component="label" type="button" color="inherit" startIcon={<AddPhotoAlternateOutlined />} disabled={submitting}>
									Change image
									<input
										hidden
										type="file"
										accept="image/jpeg,image/jpg,image/png"
										disabled={submitting}
										onChange={(event) => {
											selectCover(event.target.files?.[0]);
											event.target.value = '';
										}}
									/>
								</Button>
								<Button type="button" color="inherit" startIcon={<DeleteOutlineOutlined />} onClick={removeCover} disabled={submitting}>
									Remove image
								</Button>
							</div>
						</div>
					) : (
						<Button component="label" variant="outlined" startIcon={<AddPhotoAlternateOutlined />} disabled={submitting}>
							Choose Cover Image
							<input
								hidden
								type="file"
								accept="image/jpeg,image/jpg,image/png"
								disabled={submitting}
								onChange={(event) => {
									selectCover(event.target.files?.[0]);
									event.target.value = '';
								}}
							/>
						</Button>
					)}
					{errors.coverFile && <Alert severity="error">{errors.coverFile}</Alert>}
				</section>

				<TextField
					fullWidth
					label="Story Content"
					value={articleContent}
					onChange={(event) => {
						setArticleContent(event.target.value);
						clearFieldError('articleContent');
					}}
					error={Boolean(errors.articleContent)}
					helperText={errors.articleContent || `${articleContent.length.toLocaleString()} / 10,000 characters`}
					multiline
					minRows={12}
					slotProps={{ htmlInput: { maxLength: 10_000 } }}
				/>

				<section className="travel-story-form-identity" aria-labelledby="publishing-identity-title">
					<Typography component="h2" id="publishing-identity-title">Publishing as</Typography>
					<div>
						<Avatar src={packageImageUrl(member.memberImage)} alt={displayName}>
							{displayName.charAt(0).toUpperCase()}
						</Avatar>
						<span>
							<strong>{displayName}</strong>
							<small>Your story will be published to the WWT community.</small>
						</span>
					</div>
				</section>

				{submitError && <Alert severity="error">{submitError}</Alert>}
			</div>

			<footer className="travel-story-form-actions">
				<Button type="button" variant="outlined" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" variant="contained" disabled={submitting}>
					{submitting ? 'Publishing…' : 'Publish Story'}
				</Button>
			</footer>
		</Paper>
	);
}
