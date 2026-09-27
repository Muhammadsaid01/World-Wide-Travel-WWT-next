import Head from 'next/head';
import withLayout from '@/libs/components/layout/withLayout';
import JoinRequests from '@/libs/components/mypage/JoinRequests';
function JoinRequestsPage() {
	return (
		<>
			<Head>
				<title>Join Requests | WWT</title>
			</Head>
			<JoinRequests />
		</>
	);
}
export default withLayout(JoinRequestsPage);
