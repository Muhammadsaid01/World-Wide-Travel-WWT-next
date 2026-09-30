import { useReactiveVar } from '@apollo/client';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { currentUserVar } from '@/apollo/store';
import withLayout from '@/libs/components/layout/withLayout';
import MyPackages from '@/libs/components/mypage/MyPackages';
import PackageForm from '@/libs/components/package/PackageForm/PackageForm';

function MyPackagesPage() {
        const router = useRouter();
        const user = useReactiveVar(currentUserVar);

        const editId =
                typeof router.query.edit === 'string'
                        ? router.query.edit
                        : undefined;

        return (
                <>
                        <Head>
                                <title>{editId ? 'Edit Package' : 'My Packages'} | WWT</title>
                        </Head>

                        {editId && user?._id ? (
                                <PackageForm
                                        memberId={user._id}
                                        mode="edit"
                                        packageId={editId}
                                />
                        ) : (
                                <MyPackages />
                        )}
                </>
        );
}

export default withLayout(MyPackagesPage);