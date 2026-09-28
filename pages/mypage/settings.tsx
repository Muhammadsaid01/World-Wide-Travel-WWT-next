import Head from 'next/head';
import withLayout from '@/libs/components/layout/withLayout';
import Settings from '@/libs/components/mypage/Settings';
function SettingsPage() {
	return (
		<>
			<Head>
				<title>Settings | WWT</title>
			</Head>
			<Settings />
		</>
	);
}
export default withLayout(SettingsPage);
