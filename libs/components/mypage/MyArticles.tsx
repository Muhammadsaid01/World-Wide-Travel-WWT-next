import { useState } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import { currentUserVar } from '@/apollo/store';
import { GET_MY_ARTICLES, type MyArticlesInput } from '@/apollo/user/query';
import { ArticleStatus } from '@/libs/enums/community.enum';
import ProfileSidebar from './ProfileSidebar';
import PackageImage from '../package/PackageImage';
import { formatScheduleDate } from '../package/PackageSchedules';
import Link from 'next/link';
import {
	Alert,
	Breadcrumbs,
	Button,
	InputAdornment,
	MenuItem,
	Pagination,
	Paper,
	Skeleton,
	TextField,
	Typography,
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import Add from '@mui/icons-material/Add';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlined from '@mui/icons-material/ChatBubbleOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
const LIMIT = 6;
const sorts = [
	{ label: 'Newest', field: 'createdAt', direction: 'DESC' },
	{ label: 'Oldest', field: 'createdAt', direction: 'ASC' },
	{ label: 'Most Viewed', field: 'articleViewCount', direction: 'DESC' },
	{ label: 'Most Liked', field: 'articleLikeCount', direction: 'DESC' },
] as const;
export default function MyArticles() {
	const user = useReactiveVar(currentUserVar);
	return <ArticleList key={user?._id ?? 'guest'} authenticated={Boolean(user)} />;
}
function ArticleList({ authenticated }: { authenticated: boolean }) {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<ArticleStatus | undefined>();
	const [draft, setDraft] = useState('');
	const [search, setSearch] = useState('');
	const [sortIndex, setSortIndex] = useState(0);
	const sort = sorts[sortIndex];
	const input: MyArticlesInput = {
		page,
		limit: LIMIT,
		sort: sort.field,
		direction: sort.direction,
		search: { text: search || undefined, articleStatus: status },
	};
	const { data, loading, error, refetch } = useQuery(GET_MY_ARTICLES, {
		variables: { input },
		skip: !authenticated,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const result = data?.getMyBoardArticles;
	const total = result?.metaCounter?.[0]?.total ?? 0;
	return (
		<div className="my-bookings-page my-articles-page">
			<Breadcrumbs separator="›" className="my-bookings-breadcrumb">
				<Link href="/">Home</Link>
				<Link href="/mypage">My Profile</Link>
				<span aria-current="page">My Articles</span>
			</Breadcrumbs>
			<div className="my-bookings-layout">
				<ProfileSidebar active="My Articles" />
				<div className="my-articles-main">
					<header className="my-articles-header">
						<div>
							<Typography component="h1">My Articles</Typography>
							<Typography color="text.secondary">Manage the travel stories you&apos;ve shared on WWT.</Typography>
						</div>
						<div>
							<Button component={Link} href="/community/stories/create" variant="contained" startIcon={<Add />}>
								Create Article
							</Button>
						</div>
					</header>
					{!authenticated ? (
						<Alert
							severity="info"
							action={
								<Button component={Link} href="/account/login">
									Login
								</Button>
							}
						>
							Log in to view your articles.
						</Alert>
					) : (
						<>
							<div className="my-articles-toolbar">
								<div className="my-articles-tabs my-bookings-tabs" role="group" aria-label="Article status">
									{[
										{ label: 'All', value: undefined },
										{ label: 'Active', value: ArticleStatus.ACTIVE },
										{ label: 'Draft', value: ArticleStatus.DRAFT },
									].map((tab) => (
										<Button
											key={tab.label}
											className={status === tab.value ? 'is-active' : ''}
											aria-pressed={status === tab.value}
											onClick={() => {
												setStatus(tab.value);
												setPage(1);
											}}
										>
											{tab.label}
										</Button>
									))}
								</div>
								<form
									onSubmit={(event) => {
										event.preventDefault();
										setSearch(draft.trim());
										setPage(1);
									}}
								>
									<TextField
										size="small"
										placeholder="Search my articles..."
										value={draft}
										onChange={(event) => setDraft(event.target.value)}
										slotProps={{
											htmlInput: { 'aria-label': 'Search my articles; press Enter' },
											input: {
												startAdornment: (
													<InputAdornment position="start">
														<Search />
													</InputAdornment>
												),
											},
										}}
									/>
								</form>
								<TextField
									select
									size="small"
									value={sortIndex}
									onChange={(event) => {
										setSortIndex(Number(event.target.value));
										setPage(1);
									}}
									slotProps={{ htmlInput: { 'aria-label': 'Sort articles' } }}
								>
									{sorts.map((item, index) => (
										<MenuItem value={index} key={item.label}>
											{item.label}
										</MenuItem>
									))}
								</TextField>
							</div>
							{!loading && !error && result && (
								<Typography className="my-articles-count" role="status">
									{total} {status || search ? 'matching articles' : 'articles total'}
								</Typography>
							)}
							<div className="my-articles-list" aria-busy={loading}>
								{loading ? (
									Array.from({ length: 3 }, (_, index) => (
										<Paper className="my-article-card" key={index} aria-hidden="true">
											<Skeleton variant="rounded" className="my-article-image" />
											<div className="my-article-info">
												<Skeleton width="50%" />
												<Skeleton height={38} />
												<Skeleton width="65%" />
											</div>
										</Paper>
									))
								) : error ? (
									<Alert
										severity="error"
										action={
											<Button
												onClick={() => {
													void refetch().catch(() => undefined);
												}}
											>
												Retry
											</Button>
										}
									>
										Articles could not be loaded. {error.message}
									</Alert>
								) : !result?.list.length ? (
									<Paper variant="outlined" className="my-articles-empty">
										<Typography component="h2">
											{status || search ? 'No articles match your filters.' : 'No articles yet.'}
										</Typography>
										{status || search ? (
											<Button
												onClick={() => {
													setStatus(undefined);
													setSearch('');
													setDraft('');
													setPage(1);
												}}
											>
												Clear filters
											</Button>
										) : (
											<Button component={Link} href="/community/stories/create">
												Share your first travel story
											</Button>
										)}
									</Paper>
								) : (
									result.list.map((article) => (
										<Paper component="article" className="my-article-card" key={article._id} variant="outlined">
											<div className="my-article-image">
												<PackageImage path={article.articleImages[0]} alt={article.articleTitle} />
											</div>
											<div className="my-article-info">
												<div className="my-article-meta">
													<span className="my-article-category">{article.articleCategory.replace(/_/g, ' ')}</span>
													<span>
														{article.articleStatus === ArticleStatus.DRAFT ? 'Last edited' : 'Created'}{' '}
														{formatScheduleDate(
															article.articleStatus === ArticleStatus.DRAFT ? article.updatedAt : article.createdAt,
														)}
													</span>
												</div>
												<Typography component="h2" title={article.articleTitle}>
													{article.articleTitle}
												</Typography>
												<div className="my-article-metrics">
													<span>
														<FavoriteBorder />
														{article.articleLikeCount} likes
													</span>
													<span>
														<ChatBubbleOutlined />
														{article.articleCommentCount} comments
													</span>
													<span>
														<VisibilityOutlined />
														{article.articleViewCount} views
													</span>
												</div>
											</div>
											<span className="my-article-status">{article.articleStatus}</span>
										</Paper>
									))
								)}
							</div>
							{!loading && !error && total > LIMIT && (
								<Pagination
									className="my-articles-pagination my-bookings-pagination"
									color="primary"
									count={Math.ceil(total / LIMIT)}
									page={page}
									onChange={(_, value) => setPage(value)}
								/>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
