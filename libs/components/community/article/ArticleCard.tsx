import { Avatar, Chip, Typography } from '@mui/material';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import type { CommunityArticleItem } from '@/apollo/user/query';
import PackageImage, { packageImageUrl } from '@/libs/components/package/PackageImage';
import { formatScheduleDate } from '@/libs/components/package/PackageSchedules';
import { excerpt, memberName } from '../communityState';

const categoryLabels: Record<CommunityArticleItem['articleCategory'], string> = {
	FREE: 'Story',
	TRAVEL_TIP: 'Travel Tip',
	TRAVEL_REVIEW: 'Travel Review',
	QUESTION: 'Question',
	FIND_COMPANION: 'Find Companion',
	NOTICE: 'Notice',
};

export default function ArticleCard({ article }: { article: CommunityArticleItem }) {
	const author = memberName(article.memberData);
	return (
		<article className="community-story-card">
			<div className="community-story-image">
				<PackageImage path={article.articleImages[0]} alt={article.articleTitle} />
				<Chip label={categoryLabels[article.articleCategory]} size="small" />
			</div>
			<div className="community-story-body">
				<Typography component="h3">{article.articleTitle}</Typography>
				<Typography className="community-card-copy">{excerpt(article.articleContent)}</Typography>
				<div className="community-author">
					<Avatar src={packageImageUrl(article.memberData?.memberImage)} alt={author}>
						{author.charAt(0).toUpperCase()}
					</Avatar>
					<span>
						<strong>{author}</strong>
						<small>{article.memberData?.memberType === 'AGENT' ? 'Travel Agent' : 'Traveler'}</small>
					</span>
				</div>
				<div className="community-story-footer">
					<div className="community-story-stats" aria-label="Article engagement">
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
		</article>
	);
}
