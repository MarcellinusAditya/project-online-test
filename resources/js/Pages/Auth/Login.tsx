import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const inputClass =
    'w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Sign in" />

            <div className="mb-6">
                <h1 className="text-headline-md font-bold text-on-surface">
                    Welcome back
                </h1>
                <p className="text-body-md text-on-surface-variant mt-1">
                    Sign in to manage your tests
                </p>
            </div>

            {status && (
                <div className="mb-4 p-3 bg-surface-container-low rounded-lg text-body-sm font-medium text-on-surface">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label
                        htmlFor="email"
                        className="block font-body-sm font-medium text-on-surface mb-2"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className={inputClass}
                        autoComplete="username"
                        autoFocus
                        placeholder="you@example.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block font-body-sm font-medium text-on-surface mb-2"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className={inputClass}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="text-body-sm text-on-surface-variant">
                            Remember me
                        </span>
                    </label>
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-body-sm text-primary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-primary-container text-on-primary font-title-sm text-title-sm px-6 py-3 rounded-lg hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {processing ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-outline-variant/60 text-center space-y-2">
                <p className="text-body-sm text-on-surface-variant">
                    Don&apos;t have an account?{' '}
                    <Link
                        href={route('register')}
                        className="font-medium text-primary hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
                <p className="text-body-sm text-on-surface-variant">
                    Taking a test?{' '}
                    <Link
                        href="/join"
                        className="font-medium text-primary hover:underline"
                    >
                        Join with token
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
