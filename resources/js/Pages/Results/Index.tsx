import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface TestRow {
    id: number;
    title: string;
    status: string;
    passing_score: number;
    questions_count: number;
    attempts_count: number;
    completed_attempts_count: number;
    graded_attempts_count: number;
    passing_attempts_count: number;
    flagged_attempts_count: number;
    average_score: number;
    pass_rate: number;
    last_attempt_at: string | null;
}

interface PaginatedTests {
    data: TestRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface IndexProps {
    tests: PaginatedTests;
    overview: {
        total_tests: number;
        published_tests: number;
        total_attempts: number;
        completed_attempts: number;
        graded_attempts: number;
        average_score: number;
        flagged_attempts: number;
    };
    filters: { search?: string | null; status?: string };
}

const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Drafts' },
    { key: 'archived', label: 'Archived' },
] as const;

export default function ResultsIndex({ tests, overview, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const activeStatus = filters.status ?? 'all';
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = (nextSearch: string, nextStatus: string) => {
        router.get(route('results.index'), { search: nextSearch, status: nextStatus }, { preserveState: true, replace: true });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => applyFilters(value, activeStatus), 400);
    };

    useEffect(() => () => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-headline-md md:text-display-lg text-on-surface mb-1 md:mb-2">Results</h2>
                    <p className="text-body-sm md:text-body-md text-on-surface-variant max-w-2xl">
                        Performance across every test you own. Drill into a test to review individual submissions.
                    </p>
                </div>
            }
        >
            <Head title="Results" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                    <p className="text-label-caps text-on-surface-variant uppercase mb-1">Participants</p>
                    <p className="text-title-sm md:text-headline-md font-bold text-on-surface">{overview.total_attempts}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{overview.completed_attempts} completed</p>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                    <p className="text-label-caps text-on-surface-variant uppercase mb-1">Average Score</p>
                    <p className="text-title-sm md:text-headline-md font-bold text-primary">{overview.average_score}%</p>
                    <p className="text-xs text-on-surface-variant mt-1">{overview.graded_attempts} graded</p>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                    <p className="text-label-caps text-on-surface-variant uppercase mb-1">Tests</p>
                    <p className="text-title-sm md:text-headline-md font-bold text-on-surface">{overview.total_tests}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{overview.published_tests} published</p>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                    <p className="text-label-caps text-on-surface-variant uppercase mb-1">Flagged Attempts</p>
                    <p className={`text-title-sm md:text-headline-md font-bold ${overview.flagged_attempts > 0 ? 'text-error' : 'text-emerald-600'}`}>
                        {overview.flagged_attempts}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">anti-cheat events</p>
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-80">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search tests..."
                            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder-on-surface-variant/60"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                        <div className="flex p-1 bg-surface-container-high rounded-lg whitespace-nowrap text-body-sm shrink-0">
                            {statusTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => applyFilters(search, tab.key)}
                                    className={
                                        activeStatus === tab.key
                                            ? 'px-3 py-1.5 bg-surface rounded-md shadow-sm text-primary font-medium border border-outline-variant/20'
                                            : 'px-3 py-1.5 text-on-surface-variant hover:text-on-surface font-medium transition-colors'
                                    }
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/60 text-label-caps text-on-surface-variant uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Test</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Participants</th>
                                <th className="px-6 py-4 font-semibold">Avg Score</th>
                                <th className="px-6 py-4 font-semibold">Pass Rate</th>
                                <th className="px-6 py-4 font-semibold">Flags</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-body-sm divide-y divide-outline-variant/40">
                            {tests.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                                        <p className="mb-2">No tests found.</p>
                                        <Link href={route('tests.create')} className="text-primary hover:underline">
                                            Create your first test
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                tests.data.map((test) => (
                                    <tr key={test.id} className="hover:bg-surface-container-low/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={route('tests.results.index', test.id)}
                                                className="font-medium text-on-surface hover:text-primary transition-colors line-clamp-1"
                                            >
                                                {test.title}
                                            </Link>
                                            <div className="text-on-surface-variant text-[13px] mt-0.5 flex items-center gap-2 flex-wrap">
                                                <span>{test.questions_count} questions</span>
                                                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                                                <span>pass ≥ {test.passing_score}%</span>
                                                {test.last_attempt_at && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-outline-variant" />
                                                        <span>last {new Date(test.last_attempt_at).toLocaleDateString()}</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                                                    test.status === 'published'
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                        : test.status === 'archived'
                                                          ? 'bg-red-100 text-red-800 border border-red-200'
                                                          : 'bg-surface-container-high text-on-surface border border-outline-variant/60'
                                                }`}
                                            >
                                                {test.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">
                                            <span className="font-semibold text-on-surface">{test.attempts_count}</span>
                                            <span className="text-xs"> ({test.completed_attempts_count} completed)</span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-on-surface">{test.average_score}%</td>
                                        <td className="px-6 py-4">
                                            {test.graded_attempts_count > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold ${test.pass_rate >= 50 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                        {test.pass_rate}%
                                                    </span>
                                                    <span className="text-xs text-on-surface-variant">
                                                        ({test.passing_attempts_count}/{test.graded_attempts_count})
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-on-surface-variant">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {test.flagged_attempts_count > 0 ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-error-container text-on-error-container">
                                                    <span className="material-symbols-outlined text-[14px]">warning</span>
                                                    {test.flagged_attempts_count}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-emerald-700">Clean</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={route('tests.results.index', test.id)}
                                                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium whitespace-nowrap"
                                                >
                                                    Results
                                                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                                </Link>
                                                <a
                                                    href={route('tests.export', test.id)}
                                                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md transition-colors"
                                                    title="Export Excel"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">download</span>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {tests.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-outline-variant/40 bg-surface flex items-center justify-between">
                        <p className="text-body-sm text-on-surface-variant">
                            Page <span className="font-medium text-on-surface">{tests.current_page}</span> of{' '}
                            <span className="font-medium text-on-surface">{tests.last_page}</span> ({tests.total} total)
                        </p>
                        <div className="flex gap-2">
                            {tests.current_page > 1 && (
                                <Link
                                    href={route('results.index', { page: tests.current_page - 1, search, status: activeStatus })}
                                    className="px-3 py-1.5 text-sm font-medium text-on-surface-variant bg-surface border border-outline-variant rounded-md hover:bg-surface-container transition-colors"
                                >
                                    Previous
                                </Link>
                            )}
                            {tests.current_page < tests.last_page && (
                                <Link
                                    href={route('results.index', { page: tests.current_page + 1, search, status: activeStatus })}
                                    className="px-3 py-1.5 text-sm font-medium text-on-surface-variant bg-surface border border-outline-variant rounded-md hover:bg-surface-container transition-colors"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
