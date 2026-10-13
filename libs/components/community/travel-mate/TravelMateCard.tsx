import Link from 'next/link';
import { Avatar, Button, Chip, LinearProgress, Typography } from '@mui/material';
import ArrowForward from '@mui/icons-material/ArrowForward';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import FlagOutlined from '@mui/icons-material/FlagOutlined';
import PeopleAltOutlined from '@mui/icons-material/PeopleAltOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import type { CommunityTravelMateItem } from '@/apollo/user/query';
import { packageImageUrl } from '@/libs/components/package/PackageImage';
import { formatScheduleDate } from '@/libs/components/package/PackageSchedules';
import { excerpt, memberName } from '../communityState';
import { useTranslation } from 'react-i18next';

export default function TravelMateCard({ post }: { post: CommunityTravelMateItem }) {
	const { t, i18n } = useTranslation('community');
	const author = memberName(post.memberData);
	const remaining = Math.max(0, post.maxMembers - post.currentMembers);
	const progress = post.maxMembers > 0 ? Math.min(100, (post.currentMembers / post.maxMembers) * 100) : 0;
	return (
		<article className="community-mate-card">
			<header className="community-mate-topline">
				<div className="community-mate-location">
					<FlagOutlined />
					<span>
						{post.destinationCity}, {post.destinationCountry}
					</span>
				</div>
				<Chip size="small" className={remaining ? 'is-open' : 'is-full'} label={t(remaining ? 'mates.open' : 'mates.full')} />
			</header>
			<div className="community-mate-date">
				<CalendarMonthOutlined />
				<time dateTime={post.travelDate}>{formatScheduleDate(post.travelDate)}</time>
			</div>
			<Typography component="h3">{post.matePostTitle}</Typography>
			<Typography className="community-card-copy">{excerpt(post.matePostContent, 120)}</Typography>
			<div className="community-mate-capacity">
				<span>
					<PeopleAltOutlined /> {t('mates.travelers', { current: post.currentMembers, maximum: post.maxMembers })}
				</span>
				<small>{remaining ? t('mates.spots', { count: remaining }) : t('mates.full')}</small>
			</div>
			<LinearProgress
				variant="determinate"
				value={progress}
				aria-label={`${post.currentMembers} of ${post.maxMembers} travelers joined`}
			/>
			{typeof post.matePostViewCount === 'number' && (
				<div className="community-mate-views">
					<VisibilityOutlined /> {t('stories.views', { count: post.matePostViewCount.toLocaleString(i18n.language) })}
				</div>
			)}
			<footer>
				<div className="community-author">
					<Avatar src={packageImageUrl(post.memberData?.memberImage)} alt={author}>
						{author.charAt(0).toUpperCase()}
					</Avatar>
					<span>
						<strong>{author}</strong>
						<small>{post.memberData?.memberType === 'AGENT' ? 'Travel Agent' : 'Traveler'}</small>
					</span>
				</div>
				<Button component={Link} href={`/community/travel-mate/${post._id}`} endIcon={<ArrowForward />}>
					{t('mates.view')}
				</Button>
			</footer>
		</article>
	);
}
