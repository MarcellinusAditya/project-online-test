import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Test } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

interface TestShowProps {
    test: Test;
}

export default function TestsShow({ test }: TestShowProps) {
    const handlePublish = () => {
        router.post(route('tests.publish', test.id));
    };

    const handleUnpublish = () => {
        router.post(route('tests.unpublish', test.id));
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${test.title}"?`)) {
            router.delete(route('tests.destroy', test.id));
        }
    };

    const copyToken = () => {
        navigator.clipboard.writeText(test.token);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-end pb-4 border-b border-outline-variant">
                    <div>
                        <h2 className="text-display-lg text-on-surface mb-2">{test.title}</h2>
                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-caps font-label-caps uppercase tracking-wider ${
                                    test.status === 'published'
                                        ? 'bg-green-100 text-green-800'
                                        : test.status === 'archived'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                {test.status}
                            </span>
                            <span className="text-on-surface-variant text-body-sm ml-2">
                                Last updated {new Date(test.updated_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={route('tests.edit', test.id)}
                            className="bg-surface text-on-surface text-body-sm px-4 py-2 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                        </Link>
                        {test.status === 'draft' ? (
                            <button
                                onClick={handlePublish}
                                className="bg-primary-container text-on-primary text-body-sm px-4 py-2 rounded-lg hover:bg-primary transition-colors flex items-center gap-2"
                            >
                                Publish
                            </button>
                        ) : (
                            <button
                                onClick={handleUnpublish}
                                className="bg-surface text-on-surface text-body-sm px-4 py-2 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors"
                            >
                                Unpublish
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={test.title} />

            <div className="max-w-[1200px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-section-gap">
                    <div className="bg-surface border border-outline-variant rounded-lg p-6 flex flex-col justify-between">
                        <span className="text-label-caps text-on-surface-variant uppercase mb-2">Questions</span>
                        <div className="flex items-center justify-between">
                            <span className="text-display-lg">{test.questions_count ?? 0}</span>
                            <span className="material-symbols-outlined text-outline">format_list_numbered</span>
                        </div>
                    </div>

                    <div className="bg-surface border border-outline-variant rounded-lg p-6 flex flex-col justify-between">
                        <span className="text-label-caps text-on-surface-variant uppercase mb-2">Duration</span>
                        <div className="flex items-center justify-between">
                            <span className="text-display-lg">{test.duration_minutes}<span className="text-title-sm">m</span></span>
                            <span className="material-symbols-outlined text-outline">timer</span>
                        </div>
                    </div>

                    <div className="bg-surface border border-outline-variant rounded-lg p-6 flex flex-col justify-between">
                        <span className="text-label-caps text-on-surface-variant uppercase mb-2">Participants</span>
                        <div className="flex items-center justify-between">
                            <span className="text-display-lg">0</span>
                            <span className="material-symbols-outlined text-outline">group</span>
                        </div>
                    </div>

                    <div className="bg-surface border border-outline-variant rounded-lg p-6 flex flex-col justify-between">
                        <span className="text-label-caps text-on-surface-variant uppercase mb-2">Schedule</span>
                        <div className="flex items-center justify-between">
                            <span className="text-headline-md">
                                {test.start_at ? new Date(test.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                            </span>
                            <span className="material-symbols-outlined text-outline">event</span>
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-surface border border-outline-variant rounded-lg p-6">
                        <h3 className="text-title-sm mb-4 border-b border-outline-variant pb-2">Test Description</h3>
                        <p className="text-body-sm text-on-surface-variant mb-4">
                            {test.description || 'No description provided.'}
                        </p>
                    </div>

                    <div className="md:col-span-2 bg-surface border border-outline-variant rounded-lg p-6">
                        <h3 className="text-title-sm mb-4 border-b border-outline-variant pb-2">Access Information</h3>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-label-caps text-on-surface-variant block mb-1">Test Token</label>
                                <div className="flex items-center">
                                    <code className="font-mono bg-surface-container-low border border-outline-variant px-3 py-2 rounded-l-lg flex-grow text-on-surface">
                                        {test.token}
                                    </code>
                                    <button
                                        onClick={copyToken}
                                        className="bg-surface border border-l-0 border-outline-variant px-3 py-2 rounded-r-lg text-on-surface-variant hover:text-primary transition-colors"
                                        title="Copy Token"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-label-caps text-on-surface-variant block mb-1">Test URL</label>
                                <div className="flex items-center">
                                    <code className="font-mono bg-surface-container-low border border-outline-variant px-3 py-2 rounded-l-lg flex-grow text-on-surface">
                                        {window.location.origin}/join
                                    </code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/join`)}
                                        className="bg-surface border border-l-0 border-outline-variant px-3 py-2 rounded-r-lg text-on-surface-variant hover:text-primary transition-colors"
                                        title="Copy URL"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-surface border border-outline-variant rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-outline-variant bg-surface">
                            <h3 className="text-title-sm">Question Summary</h3>
                        </div>
                        <div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low border-b border-outline-variant">
                                        <th className="py-3 px-6 text-label-caps text-on-surface-variant uppercase">Type</th>
                                        <th className="py-3 px-6 text-label-caps text-on-surface-variant uppercase">Count</th>
                                        <th className="py-3 px-6 text-label-caps text-on-surface-variant uppercase">Weight</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                                        <td className="py-3 px-6 text-body-sm">Multiple Choice</td>
                                        <td className="py-3 px-6 text-body-sm">0</td>
                                        <td className="py-3 px-6 text-body-sm">1 pt</td>
                                    </tr>
                                    <tr className="hover:bg-surface-container-low transition-colors">
                                        <td className="py-3 px-6 text-body-sm">Essay</td>
                                        <td className="py-3 px-6 text-body-sm">0</td>
                                        <td className="py-3 px-6 text-body-sm">5 pts</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-outline-variant">
                            <Link
                                href={route('tests.questions.index', test.id)}
                                className="text-primary hover:underline text-body-sm flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Add Questions
                            </Link>
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-surface border border-outline-variant rounded-lg p-6">
                        <h3 className="text-title-sm mb-4 border-b border-outline-variant pb-2">Test Settings</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center justify-between text-body-sm">
                                <span className="text-on-surface-variant">Show Results Immediately</span>
                                <span className={`material-symbols-outlined ${test.show_result ? 'text-primary' : 'text-outline'}`}>
                                    {test.show_result ? 'check_circle' : 'cancel'}
                                </span>
                            </li>
                            <li className="flex items-center justify-between text-body-sm border-t border-outline-variant pt-3">
                                <span className="text-on-surface-variant">Randomize Questions</span>
                                <span className="material-symbols-outlined text-outline">cancel</span>
                            </li>
                            <li className="flex items-center justify-between text-body-sm border-t border-outline-variant pt-3">
                                <span className="text-on-surface-variant">Allow Backtracking</span>
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
