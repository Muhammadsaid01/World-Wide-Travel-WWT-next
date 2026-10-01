import Head from 'next/head';
import CommunityHome from '@/libs/components/community/CommunityHome';
import withLayout from '@/libs/components/layout/withLayout';

function CommunityPage() {
	return (
		<>
			<Head>
				<title>Community | WWT</title>
				<meta name="description" content="Read real travel stories and find travel mates in the WWT community." />
			</Head>
			<CommunityHome />
		</>
	);
}

export default withLayout(CommunityPage);
