import Head from 'next/head';
import Signup from '@/libs/components/account/Signup';
import withLayout from '@/libs/components/layout/withLayout';

function SignupPage() {
	return (
		<>
			<Head>
				<title>Create account | WWT</title>
			</Head>
			<Signup />
		</>
	);
}

export default withLayout(SignupPage);
