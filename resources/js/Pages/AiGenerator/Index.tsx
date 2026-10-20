import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';

interface GenerationItem {
    id: number;
    source_filename: string;
    status: string;
    question_count: number;
    question_type: string;
    difficulty: string;
    provider: string;
    error_message: string | null;
    test: { id: number; title: string } | null;
    created_at: string;
}

interface TestOption {
    id: number;
    title: string;
}

interface IndexProps {
    generations: {
        data: GenerationItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    tests: TestOption[];
    aiConfigured: boolean;
}

const statusStyle: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
};

export default function AiGeneratorIndex({ generations, tests, aiConfigured }: IndexProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        source_file: null as File | null,
        test_id: '',
        question_count: 5,
        question_type: 'multiple_choice',
        difficulty: 'medium',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('ai-generator.store'), {
            forceFormData: true,
            onSuccess: () => reset('source_file'),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-headline-md md:text-display-lg text-on-surface mb-1 md:mb-2">
                        AI Question Generator
                    </h2>
                    <p className="text-body-sm md:text-body-md text-on-surface-variant max-w-2xl">
                        Upload a PDF or text file and let AI draft questions for you.
                    </p>
                </div>
            }
        >
            <Head title="AI Generator" />

            {!aiConfigured && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-600">info</span>
                    <p className="text-body-sm text-amber-900">
                        No AI API key is configured. The generator will use the built-in offline
                        fallback (heuristic drafts from your document text). To use 9Router or
                        OpenAI, set <code className="font-mono">OPENAI_API_KEY</code> and{' '}
                        <code className="font-mono">OPENAI_API_BASE</code> in your environment.
                    </p>
                </div>
            )}

            {/* Upload card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-6 shadow-sm">
                <h3 className="font-semibold text-title-sm text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">upload_file</span>
                    Upload source document
                </h3>
                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block font-body-sm font-medium text-on-surface mb-2">
                            PDF or text file (max 10 MB)
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.txt"
                            onChange={(e) => setData('source_file', e.target.files?.[0] ?? null)}
                            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-fixed file:text-on-primary-fixed file:font-medium hover:file:bg-primary-fixed-dim transition-colors"
                        />
                        {errors.source_file && <p className="mt-1 text-sm text-error">{errors.source_file}</p>}
                    </div>
                    <div>
                        <label className="block font-body-sm font-medium text-on-surface mb-2">
                            Attach to test (optional)
                        </label>
                        <select
                            value={data.test_id}
                            onChange={(e) => setData('test_id', e.target.value)}
                            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-sm"
                        >
                            <option value="">Decide later during review</option>
                            {tests.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block font-body-sm font-medium text-on-surface mb-2">
                            Number of questions (min 1)
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={data.question_count}
                            onChange={(e) => setData('question_count', parseInt(e.target.value) || 5)}
                            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-sm"
                        />
                    </div>
                    <div>
                        <label className="block font-body-sm font-medium text-on-surface mb-2">
                            Question type
                        </label>
                        <select
                            value={data.question_type}
                            onChange={(e) => setData('question_type', e.target.value)}
                            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-sm"
                        >
                            <option value="multiple_choice">Multiple choice</option>
                            <option value="essay">Essay</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-body-sm font-medium text-on-surface mb-2">
                            Difficulty
                        </label>
                        <select
                            value={data.difficulty}
                            onChange={(e) => setData('difficulty', e.target.value)}
                            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-sm"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={processing || !data.source_file}
                            className="w-full sm:w-auto bg-primary-container text-on-primary font-title-sm text-title-sm px-6 py-3 rounded-lg hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">psychology</span>
                            {processing ? 'Uploading...' : 'Generate questions'}
                        </button>
                    </div>
                </form>
            </div>

            {/* History table */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 md:px-6 py-4 border-b border-outline-variant/60">
                    <h3 className="font-semibold text-title-sm text-on-surface">Generation history</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/60 text-label-caps text-on-surface-variant uppercase tracking-wider">
                                <th className="px-6 py-3 font-semibold">File</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold">Config</th>
                                <th className="px-6 py-3 font-semibold">Provider</th>
                                <th className="px-6 py-3 font-semibold">Created</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-body-sm divide-y divide-outline-variant/40">
                            {generations.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant">
                                        No generations yet. Upload a document above to start.
                                    </td>
                                </tr>
                            ) : (
                                generations.data.map((g) => (
                                    <tr key={g.id} className="hover:bg-surface-container-low/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-on-surface truncate max-w-[220px]">
                                                {g.source_filename}
                                            </div>
                                            {g.test && (
                                                <div className="text-xs text-on-surface-variant">
                                                    Test: {g.test.title}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium uppercase ${statusStyle[g.status] ?? 'bg-surface-container-high text-on-surface-variant'}`}
                                            >
                                                {g.status}
                                            </span>
                                            {g.status === 'failed' && g.error_message && (
                                                <div className="text-xs text-error mt-1 max-w-[220px] truncate" title={g.error_message}>
                                                    {g.error_message}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">
                                            {g.question_count}× {g.question_type === 'multiple_choice' ? 'MCQ' : 'Essay'} • {g.difficulty}
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant font-mono text-xs">
                                            {g.provider}
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">
                                            {new Date(g.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <Link
                                                href={route('ai-generator.show', g.id)}
                                                className="text-primary hover:underline font-medium mr-3"
                                            >
                                                {g.status === 'completed' ? 'Review' : 'Track'}
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Discard this generation?')) {
                                                        router.delete(route('ai-generator.destroy', g.id));
                                                    }
                                                }}
                                                className="text-error hover:underline font-medium"
                                            >
                                                Delete
                                            </button>
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
