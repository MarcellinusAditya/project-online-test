import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface JoinIndexProps {
    error?: string;
    test?: {
        id: number;
        title: string;
    };
}

export default function JoinIndex({ error, test }: JoinIndexProps) {
    const { data, setData, post, processing, errors } = useForm({
        token: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        window.location.href = `/join?token=${data.token}`;
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Head title="Join Test" />

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-on-primary text-3xl">quiz</span>
                    </div>
                    <h1 className="text-headline-md font-bold text-on-surface">Join Test</h1>
                    <p className="text-body-md text-on-surface-variant mt-1">Enter your test token to begin</p>
                </div>

                {/* Card */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-error-container rounded-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-on-error-container">error</span>
                            <span className="text-body-sm text-on-error-container">{error}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block font-body-sm font-medium text-on-surface mb-2">
                                Test Token
                            </label>
                            <input
                                type="text"
                                value={data.token}
                                onChange={(e) => setData('token', e.target.value.toUpperCase())}
                                className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-mono-label text-mono-label text-on-surface text-center tracking-wider focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
                                placeholder="UGR-XXXX-XXXX"
                                required
                            />
                            {errors.token && (
                                <p className="mt-1 text-sm text-error">{errors.token}</p>
                            )}
                            <p className="mt-2 text-[12px] text-on-surface-variant text-center">
                                Enter the token provided by your test administrator
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !data.token}
                            className="w-full bg-primary-container text-on-primary font-title-sm text-title-sm px-6 py-3 rounded-lg hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Validating...' : 'Continue'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-body-sm text-on-surface-variant mt-6">
                    Powered by <span className="font-medium text-primary">TestPro</span>
                </p>
            </div>
        </div>
    );
}
