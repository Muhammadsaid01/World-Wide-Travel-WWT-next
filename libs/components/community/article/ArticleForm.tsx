import { useEffect, useState } from 'react';
import { Alert, Avatar, Box, Button, CircularProgress, MenuItem, Paper, TextField, Typography } from '@mui/material';
import AddPhotoAlternateOutlined from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import { ArticleCategory } from '@/libs/enums/community.enum';
import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';
import { packageImageUrl } from '../../package/PackageImage';
import { memberName } from '../communityState';
import { useTranslation } from 'react-i18next';

const maxFileSize = 15_000_000;
const categoryOptions = Object.values(ArticleCategory);

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
	const { t, i18n } = useTranslation(['community', 'common']);
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
			setErrors((previous) => ({ ...previous, coverFile: t('create.imageType') }));
			return;
		}
		if (file.size > maxFileSize) {
			setErrors((previous) => ({ ...previous, coverFile: t('create.imageSize') }));
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
		if (!title) nextErrors.articleTitle = t('create.titleRequired');
		else if (title.length < 3 || title.length > 200) nextErrors.articleTitle = t('create.titleLength');
		if (!articleCategory) nextErrors.articleCategory = t('create.categoryRequired');
		if (!content) nextErrors.articleContent = t('create.contentRequired');
		else if (content.length < 10 || content.length > 10_000) nextErrors.articleContent = t('create.contentLength');
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
			aria-busy={submitting}
			onSubmit={(event) => {
				event.preventDefault();
				if (!submitting) {
					const values = validate();
					if (values) onSubmit(values);
				}
			}}
		>
			<header className="travel-story-form-heading">
				<Typography component="h1">{t('create.title')}</Typography>
				<Typography>
					{t('create.description')}
				</Typography>
			</header>

			<div className="travel-story-form-fields">
				<TextField
					fullWidth
					label={t('create.articleTitle')}
					disabled={submitting}
					value={articleTitle}
					onChange={(event) => {
						setArticleTitle(event.target.value);
						clearFieldError('articleTitle');
					}}
					error={Boolean(errors.articleTitle)}
					helperText={errors.articleTitle || t('create.titlePlaceholder')}
					slotProps={{ htmlInput: { maxLength: 200 } }}
				/>
				<TextField
					fullWidth
					select
					label={t('create.category')}
					disabled={submitting}
					value={articleCategory}
					onChange={(event) => {
						setArticleCategory(event.target.value as ArticleCategory | '');
						clearFieldError('articleCategory');
					}}
					error={Boolean(errors.articleCategory)}
					helperText={errors.articleCategory || t('create.categoryRequired')}
				>
					<MenuItem value="">{t('create.categoryRequired')}</MenuItem>
					{categoryOptions.map((option) => (
						<MenuItem key={option} value={option}>
							{t(`categories.${option}`)}
						</MenuItem>
					))}
				</TextField>

				<section className="travel-story-form-upload" aria-labelledby="cover-image-title">
					<div>
						<Typography component="h2" id="cover-image-title">{t('create.cover')}</Typography>
						<Typography color="text.secondary">{t('create.coverHelp')}</Typography>
					</div>
					{coverPreview ? (
						<div className="travel-story-cover-selected">
							<Box component="img" src={coverPreview} alt="Selected cover preview" />
							<div className="travel-story-cover-details">
								<Typography title={coverFile?.name}>{coverFile?.name}</Typography>
								<div className="travel-story-cover-actions">
									<Button component="label" type="button" color="inherit" startIcon={<AddPhotoAlternateOutlined />} disabled={submitting}>
									{t('create.changeImage')}
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
									{t('create.removeImage')}
									</Button>
								</div>
							</div>
						</div>
					) : (
						<Button component="label" variant="outlined" startIcon={<AddPhotoAlternateOutlined />} disabled={submitting}>
							{t('create.chooseImage')}
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
					label={t('create.content')}
					disabled={submitting}
					value={articleContent}
					onChange={(event) => {
						setArticleContent(event.target.value);
						clearFieldError('articleContent');
					}}
					error={Boolean(errors.articleContent)}
					helperText={errors.articleContent || t('create.characterCount', { count: articleContent.length.toLocaleString(i18n.language) })}
					multiline
					minRows={12}
					slotProps={{ htmlInput: { maxLength: 10_000 } }}
				/>

				<section className="travel-story-form-identity" aria-labelledby="publishing-identity-title">
					<Typography component="h2" id="publishing-identity-title">{t('create.publishingAs')}</Typography>
					<div>
						<Avatar src={packageImageUrl(member.memberImage)} alt={displayName}>
							{displayName.charAt(0).toUpperCase()}
						</Avatar>
						<span>
							<strong>{displayName}</strong>
							<small>{t('create.publishingNote')}</small>
						</span>
					</div>
				</section>

				{submitError && <Alert severity="error">{submitError}</Alert>}
			</div>

			<footer className="travel-story-form-actions">
				<Button type="button" variant="outlined" onClick={onCancel} disabled={submitting}>
					{t('actions.cancel', { ns: 'common' })}
				</Button>
				<Button
					type="submit"
					variant="contained"
					disabled={submitting}
					startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
				>
					{submitting ? t('create.publishing') : t('create.publish')}
				</Button>
			</footer>
		</Paper>
	);
}
