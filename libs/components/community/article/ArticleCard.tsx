import { Avatar, Chip, Typography } from '@mui/material';
import Link from 'next/link';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import type { CommunityArticleItem } from '@/apollo/user/query';
import PackageImage, { packageImageUrl } from '@/libs/components/package/PackageImage';
import { formatScheduleDate } from '@/libs/components/package/PackageSchedules';
import { excerpt, memberName, memberRole } from '../communityState';

const communityCategoryLabels: Record<CommunityArticleItem['articleCategory'], string> = {
	FREE: 'Story',
	TRAVEL_TIP: 'Travel Tip',
	TRAVEL_REVIEW: 'Travel Review',
	QUESTION: 'Question',
	FIND_COMPANION: 'Find Companion',
	NOTICE: 'Notice',
};

const travelStoryCategoryLabels: Record<CommunityArticleItem['articleCategory'], string> = {
	FREE: 'Free',
	TRAVEL_TIP: 'Travel Tips',
	TRAVEL_REVIEW: 'Travel Reviews',
	QUESTION: 'Questions',
	FIND_COMPANION: 'Find Companion',
	NOTICE: 'Notice',
};

export default function ArticleCard({
	article,
	href,
	variant = 'community',
}: {
	article: CommunityArticleItem;
	href?: string;
	variant?: 'community' | 'travel-stories';
}) {
	const author = article.memberData ? memberName(article.memberData) : 'Member unavailable';
	const authorRole = memberRole(article.memberData);
	const isTravelStory = variant === 'travel-stories';
	const cardClass = isTravelStory ? 'travel-story-card' : 'community-story-card';
	const imageClass = isTravelStory ? 'travel-story-card-cover' : 'community-story-image';
	const bodyClass = isTravelStory ? 'travel-story-card-content' : 'community-story-body';
	const authorClass = isTravelStory ? 'travel-story-card-author' : 'community-author';
	const titleComponent = isTravelStory ? 'h2' : 'h3';
	const excerptClass = isTravelStory ? 'travel-story-card-excerpt' : 'community-card-copy';
	const footerClass = isTravelStory ? 'travel-story-card-footer' : 'community-story-footer';
	const statsClass = isTravelStory ? 'travel-story-card-stats' : 'community-story-stats';
	const categoryLabel = (isTravelStory ? travelStoryCategoryLabels : communityCategoryLabels)[article.articleCategory];
	const content = (
		<>
			<div className={imageClass}>
				<PackageImage path={article.articleImages[0]} alt={article.articleTitle} />
				<Chip label={categoryLabel} size="small" />
			</div>
			<div className={bodyClass}>
				<Typography component={titleComponent}>{article.articleTitle}</Typography>
				<Typography className={excerptClass}>{excerpt(article.articleContent)}</Typography>
				<div className={authorClass}>
					<Avatar src={packageImageUrl(article.memberData?.memberImage)} alt={author}>
						{author.charAt(0).toUpperCase()}
					</Avatar>
					<span>
						<strong>{author}</strong>
						<small>{authorRole}</small>
					</span>
				</div>
				<div className={footerClass}>
					<div className={statsClass} aria-label="Article engagement">
						<span>
							<FavoriteBorder /> {article.articleLikeCount}
						</span>
						<span>
							<ChatBubbleOutline /> {article.articleCommentCount}
						</span>
						<span>
							<VisibilityOutlined /> {article.articleViewCount}
						</span>
					</div>
					<time dateTime={article.createdAt}>{formatScheduleDate(article.createdAt)}</time>
				</div>
			</div>
		</>
	);
	return href ? (
		<Link className={cardClass} href={href} aria-label={`Read ${article.articleTitle}`}>
			{content}
		</Link>
	) : (
		<article className={cardClass}>{content}</article>
	);
}
