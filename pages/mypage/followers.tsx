import Head from 'next/head';
import withLayout from '@/libs/components/layout/withLayout';
import FollowConnections from '@/libs/components/mypage/FollowConnections';
function ConnectionsPage() {
	return (
		<>
			<Head>
				<title>Followers | WWT</title>
			</Head>
			<FollowConnections type="followers" />
		</>
	);
}
export default withLayout(ConnectionsPage);
