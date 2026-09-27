import Head from 'next/head';
import withLayout from '@/libs/components/layout/withLayout';
import MyArticles from '@/libs/components/mypage/MyArticles';
function ArticlesPage() {
	return (
		<>
			<Head>
				<title>My Articles | WWT</title>
			</Head>
			<MyArticles />
		</>
	);
}
export default withLayout(ArticlesPage);
