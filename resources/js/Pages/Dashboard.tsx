import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface DashboardProps {
    totalTests: number;
    publishedTests: number;
    totalParticipants: number;
    averageScore: number;
}

export default function Dashboard({
    totalTests = 0,
    publishedTests = 0,
    totalParticipants = 0,
    averageScore = 0,
}: DashboardProps) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-display-lg text-on-surface mb-2">Good morning</h2>
                    <p className="text-body-md text-on-surface-variant">Here's an overview of your tests.</p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="glass-card rounded-xl border border-gray-200 p-6 flex flex-col justify-between hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-label-caps text-on-surface-variant uppercase tracking-widest">Total Tests</span>
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary-container">
                            <span className="material-symbols-outlined text-[18px]">folder_copy</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-display-lg-mobile text-on-surface">{totalTests}</span>
                    </div>
                </div>

                <div className="glass-card rounded-xl border border-gray-200 p-6 flex flex-col justify-between hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-label-caps text-on-surface-variant uppercase tracking-widest">Published Tests</span>
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-emerald-600">
                            <span className="material-symbols-outlined text-[18px]">publish</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-display-lg-mobile text-on-surface">{publishedTests}</span>
                    </div>
                </div>

                <div className="glass-card rounded-xl border border-gray-200 p-6 flex flex-col justify-between hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-label-caps text-on-surface-variant uppercase tracking-widest">Total Participants</span>
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary-container">
                            <span className="material-symbols-outlined text-[18px]">groups</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-3">
                        <span className="text-display-lg-mobile text-on-surface">{totalParticipants}</span>
                    </div>
                </div>

                <div className="glass-card rounded-xl border border-gray-200 p-6 flex flex-col justify-between hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-label-caps text-on-surface-variant uppercase tracking-widest">Average Score</span>
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-amber-600">
                            <span className="material-symbols-outlined text-[18px]">grade</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-display-lg-mobile text-on-surface">{averageScore}%</span>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-title-sm text-on-surface">Recent Tests</h3>
                    <Link
                        href={route('tests.index')}
                        className="text-on-surface-variant hover:text-primary-container transition-colors text-sm font-medium flex items-center gap-1"
                    >
                        View All <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F9FAFB] border-b border-gray-200">
                                <th className="px-6 py-3 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">Test Name</th>
                                <th className="px-6 py-3 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">Status</th>
                                <th className="px-6 py-3 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">Questions</th>
                                <th className="px-6 py-3 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">Schedule</th>
                                <th className="px-6 py-3 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-body-sm divide-y divide-gray-200 bg-white">
                            <tr className="hover:bg-[#F9FAFB] transition-colors">
                                <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                                    {totalTests === 0 ? (
                                        <div>
                                            <p>No tests yet.</p>
                                            <Link
                                                href={route('tests.create')}
                                                className="mt-2 inline-block text-primary hover:underline"
                                            >
                                                Create your first test
                                            </Link>
                                        </div>
                                    ) : (
                                        'Loading...'
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
