import type { NextPage } from 'next';

import Auth from '@/libs/components/account/Auth';

const SignupPage: NextPage = () => {
	return <Auth initialMode="signup" />;
};

export default SignupPage;