import { useState } from 'react';
import Link from 'next/link';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Star from '@mui/icons-material/Star';
import { useQuery } from '@apollo/client';
import {
	Alert,
	Avatar,
	Button,
	MenuItem,
	Pagination,
	Paper,
	Select,
	Skeleton,
	TextField,
	Typography,
} from '@mui/material';
import {
	GET_TRAVEL_PACKAGES,
	GET_MEMBER_FOLLOWERS,
	GET_MEMBER_FOLLOWINGS,
	GET_PUBLIC_MEMBER_ARTICLES,
} from '@/apollo/user/query';
import PackageImage, { packageImageUrl } from '../package/PackageImage';
import { useTranslation } from 'react-i18next';

export function PublicAgentPackages({ agentId, name }: { agentId: string; name: string }) {
	const { t, i18n } = useTranslation(['agents', 'common']);
	const [page, setPage] = useState(1);
	const [draft, setDraft] = useState('');
	const [text, setText] = useState('');
	const [sort, setSort] = useState('newest');
	const sorting =
		sort === 'price-low'
			? { sort: 'packagePrice', direction: 'ASC' as const }
			: sort === 'price-high'
				? { sort: 'packagePrice', direction: 'DESC' as const }
				: { sort: 'createdAt', direction: 'DESC' as const };
	const { data, loading, error, refetch } = useQuery(GET_TRAVEL_PACKAGES, {
		variables: { input: { page, limit: 6, ...sorting, search: { agentId, ...(text ? { text } : {}) } } },
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	const total = data?.getTravelPackages.metaCounter?.[0]?.total ?? 0;
	return (
		<section className="agent-packages-tab" aria-busy={loading}>
			<header className="agent-packages-heading">
				<Typography component="h2">{t('tabs.packagesTitle')}</Typography>
				<Typography color="text.secondary">{t('tabs.packagesBy', { name })}</Typography>
			</header>
			<form
				className="agent-packages-toolbar"
				onSubmit={(event) => {
					event.preventDefault();
					setText(draft.trim());
					setPage(1);
				}}
			>
				<div className="agent-packages-search">
					<TextField
						label={t('tabs.searchPackages')}
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
						size="small"
					/>
					<Button type="submit" variant="contained">
						{t('actions.search', { ns: 'common' })}
					</Button>
				</div>
				<div className="agent-packages-sort">
					<span id="agent-packages-sort-label">{t('sort.label', { ns: 'common' })}</span>
					<Select
						labelId="agent-packages-sort-label"
						size="small"
						value={sort}
						onChange={(event) => {
							setSort(event.target.value);
							setPage(1);
						}}
					>
						<MenuItem value="newest">{t('sort.newest', { ns: 'common' })}</MenuItem>
						<MenuItem value="price-low">{t('tabs.priceLow')}</MenuItem>
						<MenuItem value="price-high">{t('tabs.priceHigh')}</MenuItem>
					</Select>
				</div>
			</form>
			{loading ? (
				<Paper className="agent-packages-list" aria-label={t('tabs.loadingPackages')}>
					{Array.from({ length: 6 }, (_, index) => (
						<div className="agent-package-row" key={index} aria-hidden="true">
							<div className="agent-package-summary">
								<Skeleton variant="rounded" width={76} height={76} />
								<Skeleton width="60%" />
							</div>
							<Skeleton />
							<Skeleton />
							<Skeleton />
							<Skeleton variant="circular" width={32} height={32} />
						</div>
					))}
				</Paper>
			) : error ? (
				<TabError
					retry={() => {
						void refetch().catch(() => undefined);
					}}
				/>
			) : !data?.getTravelPackages.list.length ? (
				<Paper className="agent-detail-card">
					{t(text ? 'tabs.noPackageMatch' : 'tabs.noPackages')}
				</Paper>
			) : (
				<>
					<Typography className="agent-tab-total">{t('tabs.packageCount', { count: total })}</Typography>
					<Paper className="agent-packages-list">
						<div className="agent-package-columns" aria-hidden="true">
							<span>{t('tabs.package')}</span>
							<span>{t('tabs.duration')}</span>
							<span>{t('tabs.rating')}</span>
							<span>{t('tabs.price')}</span>
							<span />
						</div>
						<ul>
							{data.getTravelPackages.list.map((item) => (
								<li key={item._id}>
									<Link href={`/package/${item._id}`} className="agent-package-row">
										<div className="agent-package-summary">
											<div className="agent-package-thumbnail">
												<PackageImage path={item.packageImages?.[0]} alt={item.packageTitle} />
											</div>
											<div>
												<Typography component="h3">{item.packageTitle}</Typography>
												<Typography component="span" className="agent-package-location">
													{[item.destinationCity, item.destinationCountry].filter(Boolean).join(', ')}
												</Typography>
											</div>
										</div>
										<span className="agent-package-duration">
											<span className="agent-package-mobile-label">{t('tabs.duration')}</span>
											{t('tabs.daysNights', { days: item.packageDays, nights: item.packageNights })}
										</span>
										<span className="agent-package-rating">
											<span className="agent-package-mobile-label">{t('tabs.rating')}</span>
											{item.packageReviewCount > 0 ? (
												<>
													<span>
														<Star aria-hidden="true" />
														{item.packageRating}
													</span>
															<small>{t('card.reviews', { count: item.packageReviewCount })}</small>
												</>
											) : (
												<span>{t('tabs.noReviews')}</span>
											)}
										</span>
										<span className="agent-package-price">
											<span className="agent-package-mobile-label">{t('tabs.price')}</span>
											{item.currency} {item.packagePrice.toLocaleString(i18n.language)}
										</span>
										<span className="agent-package-arrow" aria-hidden="true">
											<ArrowForward fontSize="small" />
										</span>
									</Link>
								</li>
							))}
						</ul>
					</Paper>
				</>
			)}
			{!loading && !error && total > 6 && (
				<Pagination
					className="agent-tab-pagination"
					page={page}
					count={Math.ceil(total / 6)}
					onChange={(_, value) => setPage(value)}
				/>
			)}
		</section>
	);
}
function TabSkeleton() {
	const { t } = useTranslation('agents');
	return (
		<div aria-label={t('tabs.loadingContent')} aria-busy="true">
			{[0, 1, 2].map((i) => (
				<Skeleton key={i} height={100} />
			))}
		</div>
	);
}
function TabError({ retry }: { retry: () => void }) {
	const { t } = useTranslation(['agents', 'common']);
	return (
		<Alert severity="error" action={<Button onClick={retry}>{t('actions.retry', { ns: 'common' })}</Button>}>
			{t('tabs.contentError')}
		</Alert>
	);
}
export function PublicConnections({ memberId, type }: { memberId: string; type: 'followers' | 'following' }) {
	const { t } = useTranslation('agents');
	const [page, setPage] = useState(1);
	const followers = useQuery(GET_MEMBER_FOLLOWERS, {
		variables: { input: { page, limit: 8, search: { followingId: memberId } } },
		skip: type !== 'followers',
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const following = useQuery(GET_MEMBER_FOLLOWINGS, {
		variables: { input: { page, limit: 8, search: { followerId: memberId } } },
		skip: type !== 'following',
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const query = type === 'followers' ? followers : following;
	const result = type === 'followers' ? followers.data?.getMemberFollowers : following.data?.getMemberFollowings;
	const total = result?.metaCounter?.[0]?.total ?? 0;
	return (
		<section>
			<Typography component="h2">{t(type === 'followers' ? 'detail.followers' : 'detail.followingTab')}</Typography>
			{query.loading ? (
				<TabSkeleton />
			) : query.error ? (
				<TabError
					retry={() => {
						void query.refetch().catch(() => undefined);
					}}
				/>
			) : !result?.list.length ? (
				<Paper className="agent-detail-card">
					{t(type === 'followers' ? 'tabs.noFollowers' : 'tabs.noFollowing')}
				</Paper>
			) : (
				<Paper component="ul" className="agent-public-list">
					{result.list.map((item) => {
						const member = type === 'followers' ? item.followerData : item.followingData;
						const name = member?.memberFullName || member?.memberNick;
						return (
							<li key={item._id} className="agent-public-connection">
								<Avatar src={packageImageUrl(member?.memberImage)} alt={name}>
									{name?.slice(0, 1)}
								</Avatar>
								<div>
									<Typography component="h3">{name || t('tabs.memberUnavailable')}</Typography>
									{member?.memberNick && <Typography color="text.secondary">@{member.memberNick}</Typography>}
									<div className="agent-public-counts">
										{typeof member?.memberFollowerCount === 'number' && (
											<span>{t('tabs.followerCount', { count: member.memberFollowerCount })}</span>
										)}
										{typeof member?.memberFollowingCount === 'number' && (
											<span>{t('tabs.followingCount', { count: member.memberFollowingCount })}</span>
										)}
									</div>
								</div>
							</li>
						);
					})}
				</Paper>
			)}
			{!query.loading && !query.error && total > 8 && (
				<Pagination
					className="agent-tab-pagination"
					page={page}
					count={Math.ceil(total / 8)}
					onChange={(_, value) => setPage(value)}
				/>
			)}
		</section>
	);
}
export function PublicArticles({ memberId }: { memberId: string }) {
	const { t } = useTranslation('agents');
	const [page, setPage] = useState(1);
	const { data, loading, error, refetch } = useQuery(GET_PUBLIC_MEMBER_ARTICLES, {
		variables: { input: { page, limit: 6, sort: 'createdAt', direction: 'DESC', search: { memberId } } },
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const result = data?.getBoardArticles;
	const total = result?.metaCounter?.[0]?.total ?? 0;
	return (
		<section>
			<Typography component="h2">{t('detail.articles')}</Typography>
			{loading ? (
				<TabSkeleton />
			) : error ? (
				<TabError
					retry={() => {
						void refetch().catch(() => undefined);
					}}
				/>
			) : !result?.list.length ? (
				<Paper className="agent-detail-card">{t('tabs.noArticles')}</Paper>
			) : (
				<Paper component="ul" className="agent-public-list">
					{result.list.map((article) => (
						<li key={article._id}>
							<Typography component="h3">{article.articleTitle}</Typography>
							<Typography color="text.secondary">
								{t('tabs.articleStats', { views: article.articleViewCount, likes: article.articleLikeCount, comments: article.articleCommentCount })}
							</Typography>
						</li>
					))}
				</Paper>
			)}
			{!loading && !error && total > 6 && (
				<Pagination
					className="agent-tab-pagination"
					page={page}
					count={Math.ceil(total / 6)}
					onChange={(_, value) => setPage(value)}
				/>
			)}
		</section>
	);
}
