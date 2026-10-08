import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans antialiased">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-6">
                    <Link
                        href="/"
                        className="inline-flex flex-col items-center gap-3"
                    >
                        <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-primary text-3xl">
                                quiz
                            </span>
                        </div>
                        <span className="font-bold text-title-sm text-on-surface">
                            TestPro
                        </span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-6 sm:p-8">
                    {children}
                </div>

                {/* Footer */}
                <p className="text-center text-body-sm text-on-surface-variant mt-6">
                    Powered by{' '}
                    <Link
                        href="/"
                        className="font-medium text-primary hover:underline"
                    >
                        TestPro
                    </Link>
                </p>
            </div>
        </div>
    );
}
