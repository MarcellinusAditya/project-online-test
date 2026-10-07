import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Test } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';

interface TestsEditProps {
    test: Test;
}

export default function TestsEdit({ test }: TestsEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        title: test.title,
        description: test.description ?? '',
        start_at: test.start_at ? test.start_at.slice(0, 16) : '',
        end_at: test.end_at ? test.end_at.slice(0, 16) : '',
        duration_minutes: test.duration_minutes,
        show_result: test.show_result,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('tests.update', test.id));
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${test.title}"?`)) {
            router.delete(route('tests.destroy', test.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-on-surface-variant text-body-sm cursor-pointer hover:text-primary transition-colors">
                        <Link href={route('tests.show', test.id)} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                            <span>Back to {test.title}</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Edit ${test.title}`} />

            <div className="flex justify-center">
                <div className="w-full max-w-[800px] flex flex-col gap-8">
                    <div>
                        <h1 className="text-display-lg text-on-surface mb-2">Edit Test</h1>
                        <p className="text-body-md text-on-surface-variant">
                            Update the details for your assessment.
                        </p>
                    </div>

                    <form onSubmit={submit} className="bg-surface-container-lowest rounded-lg border border-outline-variant p-8 flex flex-col gap-8 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                        <section className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-title-sm text-on-surface" htmlFor="title">Test Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full rounded bg-surface-bright border border-outline-variant px-4 py-3 text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    required
                                />
                                {errors.title && (
                                    <p className="text-sm text-error">{errors.title}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-title-sm text-on-surface flex justify-between" htmlFor="description">
                                    Description
                                    <span className="text-body-sm text-outline font-normal">Optional</span>
                                </label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full rounded bg-surface-bright border border-outline-variant px-4 py-3 text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-y"
                                />
                            </div>
                        </section>

                        <hr className="border-outline-variant/50" />

                        <section className="flex flex-col gap-6">
                            <h2 className="text-headline-md text-on-surface">Schedule & Duration</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-title-sm text-on-surface">Available From</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">calendar_today</span>
                                        <input
                                            type="datetime-local"
                                            value={data.start_at}
                                            onChange={(e) => setData('start_at', e.target.value)}
                                            className="w-full rounded bg-surface-bright border border-outline-variant pl-10 pr-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-title-sm text-on-surface">Available Until</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">event_busy</span>
                                        <input
                                            type="datetime-local"
                                            value={data.end_at}
                                            onChange={(e) => setData('end_at', e.target.value)}
                                            className="w-full rounded bg-surface-bright border border-outline-variant pl-10 pr-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-title-sm text-on-surface" htmlFor="duration_minutes">Time Limit</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-32">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">timer</span>
                                        <input
                                            type="number"
                                            id="duration_minutes"
                                            min={1}
                                            max={480}
                                            value={data.duration_minutes}
                                            onChange={(e) => setData('duration_minutes', parseInt(e.target.value))}
                                            className="w-full rounded bg-surface-bright border border-outline-variant pl-10 pr-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                            required
                                        />
                                    </div>
                                    <span className="text-body-md text-on-surface-variant">minutes</span>
                                </div>
                                {errors.duration_minutes && (
                                    <p className="text-sm text-error">{errors.duration_minutes}</p>
                                )}
                            </div>
                        </section>

                        <hr className="border-outline-variant/50" />

                        <section className="flex flex-col gap-6">
                            <h2 className="text-headline-md text-on-surface">Result Visibility</h2>
                            <div className="flex flex-col gap-4">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="flex items-center h-6">
                                        <input
                                            type="radio"
                                            name="show_result"
                                            checked={data.show_result === true}
                                            onChange={() => setData('show_result', true)}
                                            className="w-4 h-4 text-primary bg-surface border-outline-variant focus:ring-primary/20 focus:ring-2 cursor-pointer mt-1"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-title-sm text-on-surface group-hover:text-primary transition-colors">Show result immediately</span>
                                        <span className="text-body-sm text-on-surface-variant">Students will see their score and feedback as soon as they submit.</span>
                                    </div>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="flex items-center h-6">
                                        <input
                                            type="radio"
                                            name="show_result"
                                            checked={data.show_result === false}
                                            onChange={() => setData('show_result', false)}
                                            className="w-4 h-4 text-primary bg-surface border-outline-variant focus:ring-primary/20 focus:ring-2 cursor-pointer mt-1"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-title-sm text-on-surface group-hover:text-primary transition-colors">Hide result</span>
                                        <span className="text-body-sm text-on-surface-variant">Scores will be held until manually released by an administrator.</span>
                                    </div>
                                </label>
                            </div>
                        </section>
                    </form>

                    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-outline-variant p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                        <div className="max-w-[800px] mx-auto flex items-center justify-between">
                            <button
                                onClick={handleDelete}
                                className="px-6 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-title-sm hover:bg-error-container/30 hover:text-error transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                Delete Test
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                onClick={submit}
                                className="px-6 py-2 rounded-lg bg-primary-container text-on-primary text-title-sm hover:bg-primary transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
