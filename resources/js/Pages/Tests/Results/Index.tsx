import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Test } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

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
    warnings_count: number;
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
        pass_rate: number;
        passing_attempts: number;
        unanswered_total: number;
    };
    filters: {
        search?: string | null;
        status?: string;
    };
}

const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'expired', label: 'Expired' },
    { key: 'grading', label: 'Grading' },
] as const;

export default function ResultsIndex({ test, attempts, stats, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const activeStatus = filters.status ?? 'all';
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = (nextSearch: string, nextStatus: string) => {
        router.get(
            route('tests.results.index', test.id),
            { search: nextSearch, status: nextStatus },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => applyFilters(value, activeStatus), 400);
    };

    useEffect(() => () => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
    }, []);

    const exportUrl = () => {
        const params = new URLSearchParams();
        if (activeStatus !== 'all') params.set('status', activeStatus);
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        params.set('format', exportFormat);
        return `${route('tests.export', test.id)}?${params.toString()}`;
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

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                    <p className="text-label-caps text-on-surface-variant uppercase mb-1">Participants</p>
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
                    <p className="text-label-caps text-on-surface-variant uppercase mb-1">Pass Rate</p>
                    <p className="text-title-sm md:text-headline-md font-bold text-on-surface">{stats.pass_rate}%</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">pass ≥ {test.passing_score}%</p>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                    <p className="text-label-caps text-on-surface-variant uppercase mb-1">Highest</p>
                    <p className="text-title-sm md:text-headline-md font-bold text-on-surface">{stats.highest_score}%</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">lowest {stats.lowest_score}%</p>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                    <p className="text-label-caps text-on-surface-variant uppercase mb-1">Unanswered</p>
                    <p className="text-title-sm md:text-headline-md font-bold text-on-surface">{stats.unanswered_total}</p>
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                    <div className="relative w-full lg:w-72">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                            search
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search by participant name or ID..."
                            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-on-surface-variant whitespace-nowrap" htmlFor="date_from">
                                From
                            </label>
                            <input
                                id="date_from"
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="bg-surface border border-outline-variant rounded-lg px-2 py-1.5 text-body-sm focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-on-surface-variant whitespace-nowrap" htmlFor="date_to">
                                To
                            </label>
                            <input
                                id="date_to"
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="bg-surface border border-outline-variant rounded-lg px-2 py-1.5 text-body-sm focus:outline-none focus:border-primary"
                            />
                        </div>
                        <select
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value as 'xlsx' | 'csv')}
                            className="bg-surface border border-outline-variant rounded-lg px-2 py-2 text-body-sm focus:outline-none focus:border-primary"
                            aria-label="Export format"
                        >
                            <option value="xlsx">Excel (.xlsx)</option>
                            <option value="csv">CSV (.csv)</option>
                        </select>
                        <a
                            href={exportUrl()}
                            className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-body-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Export
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
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

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/60 text-label-caps text-on-surface-variant uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Participant</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Score</th>
                                <th className="px-6 py-4 font-semibold">Correct / Wrong</th>
                                <th className="px-6 py-4 font-semibold">Warnings</th>
                                <th className="px-6 py-4 font-semibold">Time Spent</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-body-sm divide-y divide-outline-variant/40">
                            {attempts.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                                        No participants match the current filters.
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
                                                        : att.status === 'grading'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {att.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-title-sm text-on-surface">
                                                {att.score !== null ? `${att.score}%` : '-'}
                                            </span>
                                            {att.score !== null && (
                                                <span
                                                    className={`ml-2 text-[11px] font-semibold uppercase ${
                                                        att.score >= test.passing_score ? 'text-emerald-600' : 'text-error'
                                                    }`}
                                                >
                                                    {att.score >= test.passing_score ? 'Pass' : 'Fail'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">
                                            <span className="text-emerald-600 font-semibold">{att.total_correct ?? 0}</span>
                                            {' / '}
                                            <span className="text-error font-semibold">{att.total_wrong ?? 0}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(att.warnings_count ?? 0) > 0 ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-error-container text-on-error-container">
                                                    <span className="material-symbols-outlined text-[14px]">warning</span>
                                                    {att.warnings_count}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <span className="material-symbols-outlined text-[14px]">verified</span>
                                                    0
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">
                                            {formatDuration(att.time_spent_seconds)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={route('tests.attempts.show', [test.id, att.id])}
                                                className="inline-flex items-center gap-1 text-primary hover:underline font-medium whitespace-nowrap"
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

                {attempts.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-outline-variant/40 bg-surface flex items-center justify-between gap-3">
                        <p className="text-body-sm text-on-surface-variant">
                            Page <span className="font-medium text-on-surface">{attempts.current_page}</span> of{' '}
                            <span className="font-medium text-on-surface">{attempts.last_page}</span> ({attempts.total} total)
                        </p>
                        <div className="flex gap-2">
                            {attempts.current_page > 1 && (
                                <Link
                                    href={route('tests.results.index', {
                                        test: test.id,
                                        page: attempts.current_page - 1,
                                        search,
                                        status: activeStatus,
                                    })}
                                    className="px-3 py-1.5 text-sm font-medium text-on-surface-variant bg-surface border border-outline-variant rounded-md hover:bg-surface-container transition-colors"
                                >
                                    Previous
                                </Link>
                            )}
                            {attempts.current_page < attempts.last_page && (
                                <Link
                                    href={route('tests.results.index', {
                                        test: test.id,
                                        page: attempts.current_page + 1,
                                        search,
                                        status: activeStatus,
                                    })}
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
