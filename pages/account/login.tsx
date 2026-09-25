import Head from 'next/head';
import Login from '@/libs/components/account/Login';
import withLayout from '@/libs/components/layout/withLayout';

function LoginPage() {
	return (
		<>
			<Head>
				<title>Log in | WWT</title>
			</Head>
			<Login />
		</>
	);
}

export default withLayout(LoginPage);
