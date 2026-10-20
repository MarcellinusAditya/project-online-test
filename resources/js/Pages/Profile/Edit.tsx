import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-headline-md text-on-surface">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 sm:p-6 shadow-sm">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 sm:p-6 shadow-sm">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 sm:p-6 shadow-sm">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
