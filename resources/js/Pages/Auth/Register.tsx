import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const inputClass =
    'w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Sign up" />

            <div className="mb-6">
                <h1 className="text-headline-md font-bold text-on-surface">
                    Create your account
                </h1>
                <p className="text-body-md text-on-surface-variant mt-1">
                    Start creating online tests in minutes
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label
                        htmlFor="name"
                        className="block font-body-sm font-medium text-on-surface mb-2"
                    >
                        Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        value={data.name}
                        className={inputClass}
                        autoComplete="name"
                        autoFocus
                        placeholder="Your full name"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1" />
                </div>

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
                        placeholder="you@example.com"
                        onChange={(e) => setData('email', e.target.value)}
                        required
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
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div>
                    <label
                        htmlFor="password_confirmation"
                        className="block font-body-sm font-medium text-on-surface mb-2"
                    >
                        Confirm Password
                    </label>
                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className={inputClass}
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1"
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-primary-container text-on-primary font-title-sm text-title-sm px-6 py-3 rounded-lg hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {processing ? 'Creating account...' : 'Sign up'}
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-outline-variant/60 text-center space-y-2">
                <p className="text-body-sm text-on-surface-variant">
                    Already have an account?{' '}
                    <Link
                        href={route('login')}
                        className="font-medium text-primary hover:underline"
                    >
                        Sign in
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
