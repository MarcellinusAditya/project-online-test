import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Test } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

interface TestWithCount extends Test {
    questions_count: number;
}

interface PaginatedTests {
    data: TestWithCount[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface TestsIndexProps {
    tests: PaginatedTests;
}

export default function TestsIndex({ tests }: TestsIndexProps) {
    const handleDelete = (test: TestWithCount) => {
        if (confirm(`Are you sure you want to delete "${test.title}"?`)) {
            router.delete(route('tests.destroy', test.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-display-lg text-on-surface mb-2">Tests</h2>
                    <p className="text-body-md text-on-surface-variant max-w-2xl">
                        Create, manage, and monitor your online tests across all departments and cohorts.
                    </p>
                </div>
            }
        >
            <Head title="Tests" />

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-80">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                        <input
                            type="text"
                            placeholder="Search tests by title or keyword..."
                            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder-on-surface-variant/60"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                        <div className="flex p-1 bg-surface-container-high rounded-lg whitespace-nowrap text-body-sm shrink-0">
                            <button className="px-3 py-1.5 bg-surface rounded-md shadow-sm text-primary font-medium border border-outline-variant/20">All</button>
                            <button className="px-3 py-1.5 text-on-surface-variant hover:text-on-surface font-medium transition-colors">Published</button>
                            <button className="px-3 py-1.5 text-on-surface-variant hover:text-on-surface font-medium transition-colors">Drafts</button>
                            <button className="px-3 py-1.5 text-on-surface-variant hover:text-on-surface font-medium transition-colors">Archived</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/60 text-label-caps text-on-surface-variant uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Test Details</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Questions</th>
                                <th className="px-6 py-4 font-semibold">Schedule</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-body-sm divide-y divide-outline-variant/40">
                            {tests.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                                        <p className="mb-2">No tests found.</p>
                                        <Link
                                            href={route('tests.create')}
                                            className="text-primary hover:underline"
                                        >
                                            Create your first test
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                tests.data.map((test) => (
                                    <tr key={test.id} className="hover:bg-surface-container-low/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 w-8 h-8 rounded-md bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-[18px]">code</span>
                                                </div>
                                                <div>
                                                    <Link
                                                        href={route('tests.show', test.id)}
                                                        className="font-medium text-on-surface hover:text-primary transition-colors line-clamp-1 group-hover:underline decoration-primary/30 underline-offset-2"
                                                    >
                                                        {test.title}
                                                    </Link>
                                                    <div className="text-on-surface-variant text-[13px] mt-0.5 flex items-center gap-2">
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[14px]">timer</span>
                                                            {test.duration_minutes}m
                                                        </span>
                                                        {test.token && (
                                                            <>
                                                                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                                                                <span className="font-mono text-[13px]">{test.token}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    test.status === 'published'
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                        : test.status === 'archived'
                                                          ? 'bg-red-100 text-red-800 border border-red-200'
                                                          : 'bg-surface-container-high text-on-surface border border-outline-variant/60'
                                                }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        test.status === 'published'
                                                            ? 'bg-emerald-500'
                                                            : test.status === 'archived'
                                                              ? 'bg-red-500'
                                                              : 'bg-outline'
                                                    }`}
                                                />
                                                {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-on-surface-variant">
                                                <span className="material-symbols-outlined text-[16px]">help_center</span>
                                                <span className="font-mono text-[13px]">{test.questions_count ?? 0} Qs</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {test.start_at ? (
                                                <div>
                                                    <div className="text-on-surface">{new Date(test.start_at).toLocaleDateString()}</div>
                                                    {test.end_at && (
                                                        <div className="text-on-surface-variant text-[12px] mt-0.5">
                                                            to {new Date(test.end_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-on-surface-variant italic">Not scheduled</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={route('tests.edit', test.id)}
                                                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md transition-colors"
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </Link>
                                                <Link
                                                    href={route('tests.questions.index', test.id)}
                                                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md transition-colors"
                                                    title="Questions"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">quiz</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(test)}
                                                    className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-md transition-colors"
                                                    title="Delete"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
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
                            Showing <span className="font-medium text-on-surface">{(tests.current_page - 1) * tests.per_page + 1}</span> to{' '}
                            <span className="font-medium text-on-surface">
                                {Math.min(tests.current_page * tests.per_page, tests.total)}
                            </span>{' '}
                            of <span className="font-medium text-on-surface">{tests.total}</span> results
                        </p>
                        <div className="flex gap-2">
                            {tests.current_page > 1 && (
                                <Link
                                    href={route('tests.index', { page: tests.current_page - 1 })}
                                    className="px-3 py-1.5 text-sm font-medium text-on-surface-variant bg-surface border border-outline-variant rounded-md hover:bg-surface-container transition-colors"
                                >
                                    Previous
                                </Link>
                            )}
                            {tests.current_page < tests.last_page && (
                                <Link
                                    href={route('tests.index', { page: tests.current_page + 1 })}
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
