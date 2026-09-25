import type { NextPage } from 'next';

import Auth from '@/libs/components/account/Auth';

const LoginPage: NextPage = () => {
	return <Auth initialMode="login" />;
};

export default LoginPage;