import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Test } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface AttemptItem {
    id: number;
    participant_name: string;
    participant_identifier: string | null;
    status: string;
    score: number | null;
    total_correct: number | null;
    total_wrong: number | null;
    total_unanswered: number | null;
    time_spent_seconds: number | null;
    started_at: string | null;
    submitted_at: string | null;
}

interface IndexProps {
    test: Test;
    attempts: {
        data: AttemptItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total_attempts: number;
        completed_attempts: number;
        average_score: number;
        highest_score: number;
        lowest_score: number;
    };
    filters: {
        search?: string;
    };
}

export default function ResultsIndex({ test, attempts, stats, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('tests.results.index', test.id),
            { search },
            { preserveState: true, replace: true }
        );
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-2">
                        <Link href={route('tests.index')} className="hover:text-primary">
                            Tests
                        </Link>
                        <span>/</span>
                        <Link href={route('tests.show', test.id)} className="hover:text-primary">
                            {test.title}
                        </Link>
                        <span>/</span>
                        <span>Results</span>
                    </div>
                    <h2 className="text-headline-md md:text-display-lg text-on-surface">
                        Test Results — {test.title}
                    </h2>
                </div>
            }
        >
            <Head title={`Results - ${test.title}`} />

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                    <p className="text-label-caps text-on-surface-variant uppercase mb-1">Total Participants</p>
                    <p className="text-title-sm md:text-headline-md font-bold text-on-surface">{stats.total_attempts}</p>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                    <p className="text-label-caps text-on-surface-variant uppercase mb-1">Completed</p>
                    <p className="text-title-sm md:text-headline-md font-bold text-emerald-600">{stats.completed_attempts}</p>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                    <p className="text-label-caps text-on-surface-variant uppercase mb-1">Avg Score</p>
                    <p className="text-title-sm md:text-headline-md font-bold text-primary">{stats.average_score}%</p>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                    <p className="text-label-caps text-on-surface-variant uppercase mb-1">Highest Score</p>
                    <p className="text-title-sm md:text-headline-md font-bold text-on-surface">{stats.highest_score}%</p>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                    <p className="text-label-caps text-on-surface-variant uppercase mb-1">Lowest Score</p>
                    <p className="text-title-sm md:text-headline-md font-bold text-on-surface">{stats.lowest_score}%</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-6 shadow-sm">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                            search
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by participant name or ID..."
                            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-primary-container text-on-primary font-body-sm px-4 py-2 rounded-lg hover:bg-primary transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Participant Table */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/60 text-label-caps text-on-surface-variant uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Participant</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Score</th>
                                <th className="px-6 py-4 font-semibold">Correct / Wrong</th>
                                <th className="px-6 py-4 font-semibold">Time Spent</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-body-sm divide-y divide-outline-variant/40">
                            {attempts.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                                        No participants found for this test.
                                    </td>
                                </tr>
                            ) : (
                                attempts.data.map((att) => (
                                    <tr key={att.id} className="hover:bg-surface-container-low/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-on-surface">{att.participant_name}</div>
                                            {att.participant_identifier && (
                                                <div className="text-xs text-on-surface-variant">
                                                    ID: {att.participant_identifier}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium uppercase ${
                                                    att.status === 'submitted'
                                                        ? 'bg-green-100 text-green-800'
                                                        : att.status === 'in_progress'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {att.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-title-sm text-on-surface">
                                            {att.score !== null ? `${att.score}%` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">
                                            <span className="text-emerald-600 font-semibold">{att.total_correct ?? 0}</span>
                                            {' / '}
                                            <span className="text-error font-semibold">{att.total_wrong ?? 0}</span>
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">
                                            {formatDuration(att.time_spent_seconds)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={route('tests.attempts.show', [test.id, att.id])}
                                                className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                                            >
                                                Review & Grade
                                                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
