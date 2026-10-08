import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

const features = [
    {
        icon: 'folder_copy',
        title: 'Test management',
        desc: 'Create tests, set schedule and duration, then publish when ready.',
    },
    {
        icon: 'help_outline',
        title: 'Question bank',
        desc: 'Multiple-choice with auto answer key plus essay questions with points.',
    },
    {
        icon: 'key',
        title: 'Token-based join',
        desc: 'Share a short token (e.g. UGR-XXXX-XXXX). No participant account needed.',
    },
    {
        icon: 'timer',
        title: 'Timer & auto-save',
        desc: 'Server-side countdown, auto-submit on timeout, answers saved automatically.',
    },
    {
        icon: 'grade',
        title: 'Automatic grading',
        desc: 'Multiple-choice is graded instantly with correct / wrong / unanswered counts.',
    },
    {
        icon: 'monitoring',
        title: 'Attempt logging',
        desc: 'Every attempt records start, answers, submit, and suspicious-activity events.',
    },
];

const steps = [
    {
        n: '1',
        icon: 'add_circle',
        title: 'Create a test',
        desc: 'Sign up, add a test with duration and schedule, then write the questions.',
    },
    {
        n: '2',
        icon: 'share',
        title: 'Share the token',
        desc: 'Publish the test and send the token to participants.',
    },
    {
        n: '3',
        icon: 'quiz',
        title: 'Participants join & submit',
        desc: 'They open Join Test, enter the token and their name, then take the test.',
    },
];

export default function Welcome({
    auth,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    const user = auth.user;

    return (
        <>
            <Head title="TestPro — Online Test Platform" />
            <div className="min-h-screen bg-background text-on-surface font-sans antialiased">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur border-b border-outline-variant/60">
                    <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary-container rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-primary text-[22px]">
                                    quiz
                                </span>
                            </div>
                            <span className="font-bold text-title-sm">
                                TestPro
                            </span>
                        </Link>

                        <nav className="flex items-center gap-2 sm:gap-3">
                            {user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-primary-container text-on-primary font-body-sm text-body-sm px-4 sm:px-5 py-2 rounded-lg hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="font-body-sm text-body-sm px-4 sm:px-5 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="bg-primary-container text-on-primary font-body-sm text-body-sm px-4 sm:px-5 py-2 rounded-lg hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero */}
                <main className="mx-auto max-w-6xl px-6">
                    <section className="py-14 sm:py-20 text-center">
                        <div className="inline-flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-full px-4 py-1.5 mb-6">
                            <span className="material-symbols-outlined text-primary text-[18px]">
                                verified
                            </span>
                            <span className="text-body-sm text-on-surface-variant">
                                Online test platform for teachers & teams
                            </span>
                        </div>
                        <h1 className="text-display-lg-mobile sm:text-display-lg font-bold max-w-3xl mx-auto">
                            Create tests, share a token, get results
                        </h1>
                        <p className="text-body-md text-on-surface-variant max-w-2xl mx-auto mt-4">
                            TestPro lets you build timed online tests with
                            multiple-choice and essay questions. Participants
                            join with a short token — no account needed — and
                            multiple-choice answers are graded automatically.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                            {user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="w-full sm:w-auto bg-primary-container text-on-primary font-title-sm text-title-sm px-6 py-3 rounded-lg hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('register')}
                                    className="w-full sm:w-auto bg-primary-container text-on-primary font-title-sm text-title-sm px-6 py-3 rounded-lg hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
                                >
                                    Get started free
                                </Link>
                            )}
                            <Link
                                href="/join"
                                className="w-full sm:w-auto bg-surface-container-lowest border border-outline-variant font-title-sm text-title-sm px-6 py-3 rounded-lg hover:border-primary hover:text-primary transition-colors text-center"
                            >
                                Join a test
                            </Link>
                        </div>

                        {/* Info strip */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 text-left">
                            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                <span className="material-symbols-outlined text-primary">
                                    key
                                </span>
                                <div>
                                    <p className="text-body-sm text-on-surface-variant">
                                        Join with token
                                    </p>
                                    <p className="font-mono-label text-mono-label font-medium">
                                        UGR-XXXX-XXXX
                                    </p>
                                </div>
                            </div>
                            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                <span className="material-symbols-outlined text-primary">
                                    timer
                                </span>
                                <div>
                                    <p className="text-body-sm text-on-surface-variant">
                                        Timed + auto-submit
                                    </p>
                                    <p className="font-medium text-body-sm">
                                        Never lose an answer
                                    </p>
                                </div>
                            </div>
                            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                <span className="material-symbols-outlined text-primary">
                                    grade
                                </span>
                                <div>
                                    <p className="text-body-sm text-on-surface-variant">
                                        Instant MCQ grading
                                    </p>
                                    <p className="font-medium text-body-sm">
                                        Score, correct & wrong
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    <section className="pb-14">
                        <h2 className="text-headline-md font-bold text-center">
                            Everything you need for an online test
                        </h2>
                        <p className="text-body-md text-on-surface-variant text-center mt-2 max-w-xl mx-auto">
                            Built for the full flow: from creating questions to
                            reviewing participant results.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                            {features.map((f) => (
                                <div
                                    key={f.title}
                                    className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-primary">
                                            {f.icon}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-title-sm mb-1">
                                        {f.title}
                                    </h3>
                                    <p className="text-body-sm text-on-surface-variant">
                                        {f.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* How it works */}
                    <section className="pb-14">
                        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 sm:p-10">
                            <h2 className="text-headline-md font-bold text-center">
                                How it works
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                                {steps.map((s) => (
                                    <div
                                        key={s.n}
                                        className="text-center sm:text-left"
                                    >
                                        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                                            <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold text-body-sm flex items-center justify-center">
                                                {s.n}
                                            </span>
                                            <span className="material-symbols-outlined text-primary">
                                                {s.icon}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-title-sm">
                                            {s.title}
                                        </h3>
                                        <p className="text-body-sm text-on-surface-variant mt-1">
                                            {s.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Participant CTA */}
                    <section className="pb-16">
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 sm:p-10 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            <span className="material-symbols-outlined text-primary text-4xl">
                                input
                            </span>
                            <h2 className="text-headline-md font-bold mt-3">
                                Have a test token?
                            </h2>
                            <p className="text-body-md text-on-surface-variant mt-2 max-w-lg mx-auto">
                                You don&apos;t need an account to take a test.
                                Just enter the token your teacher or
                                administrator gave you.
                            </p>
                            <Link
                                href="/join"
                                className="inline-block mt-6 bg-primary-container text-on-primary font-title-sm text-title-sm px-6 py-3 rounded-lg hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                Join Test
                            </Link>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-outline-variant/60">
                    <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-primary-container rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-primary text-[18px]">
                                    quiz
                                </span>
                            </div>
                            <span className="text-body-sm font-semibold">
                                TestPro
                            </span>
                            <span className="text-body-sm text-on-surface-variant">
                                — Online Test Platform
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-body-sm">
                            <Link
                                href={route('login')}
                                className="text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                                Sign in
                            </Link>
                            <Link
                                href={route('register')}
                                className="text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                                Sign up
                            </Link>
                            <Link
                                href="/join"
                                className="text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                                Join Test
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
