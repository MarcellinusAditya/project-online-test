import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface DraftOption {
    key: string;
    text: string;
    is_correct: boolean;
}

interface DraftItem {
    question: string;
    type: 'multiple_choice' | 'essay';
    points: number;
    explanation: string | null;
    options: DraftOption[];
}

interface Generation {
    id: number;
    source_filename: string;
    status: string;
    source_mode?: string | null;
    question_count: number;
    question_type: string;
    difficulty: string;
    provider: string;
    error_message: string | null;
    draft_questions: DraftItem[] | null;
    test_id: number | null;
    test: { id: number; title: string } | null;
    created_at: string;
}

interface ShowProps {
    generation: Generation;
    tests: { id: number; title: string }[];
}

export default function AiGeneratorShow({ generation, tests }: ShowProps) {
    const [status, setStatus] = useState(generation.status);
    const [errorMessage, setErrorMessage] = useState<string | null>(generation.error_message);
    const [items, setItems] = useState<DraftItem[]>(generation.draft_questions ?? []);
    const [selected, setSelected] = useState<boolean[]>(
        (generation.draft_questions ?? []).map(() => true),
    );
    const [targetTestId, setTargetTestId] = useState<string>(
        generation.test_id ? String(generation.test_id) : '',
    );
    const [saving, setSaving] = useState(false);

    const finished = status === 'completed' || status === 'failed';

    useEffect(() => {
        if (generation.status === 'completed' || generation.status === 'failed') return;

        const timer = setInterval(async () => {
            try {
                const res = await fetch(route('ai-generator.status', generation.id), {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });
                const json = await res.json();
                setStatus(json.status);
                setErrorMessage(json.error_message ?? null);
                if (json.status === 'completed' || json.status === 'failed') {
                    clearInterval(timer);
                    router.reload({ only: ['generation'] });
                }
            } catch {
                /* keep polling */
            }
        }, 3000);

        return () => clearInterval(timer);
    }, [generation.id, generation.status]);

    useEffect(() => {
        if (generation.draft_questions) {
            setItems(generation.draft_questions);
            setSelected(generation.draft_questions.map(() => true));
        }
    }, [generation.draft_questions]);

    const toggle = (i: number) => {
        setSelected((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
    };

    const updateItem = (i: number, patch: Partial<DraftItem>) => {
        setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
    };

    const approve = () => {
        if (!targetTestId) {
            alert('Please choose a target test first.');
            return;
        }
        const chosen = items.filter((_, i) => selected[i]);
        if (chosen.length === 0) {
            alert('Select at least one question to approve.');
            return;
        }
        setSaving(true);
        (router.post as (...args: unknown[]) => void)(
            route('ai-generator.approve', generation.id),
            { test_id: parseInt(targetTestId), items: chosen },
            { onFinish: () => setSaving(false) },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-2">
                        <Link href={route('ai-generator.index')} className="hover:text-primary">
                            AI Generator
                        </Link>
                        <span>/</span>
                        <span className="truncate max-w-[300px]">{generation.source_filename}</span>
                    </div>
                    <h2 className="text-headline-md md:text-display-lg text-on-surface">
                        Review generated questions
                    </h2>
                </div>
            }
        >
            <Head title="Review AI questions" />

            {/* Status card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <p className="text-body-sm text-on-surface-variant">
                        Source file: <span className="font-medium text-on-surface">{generation.source_filename}</span>
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                        Provider: <span className="font-mono text-xs">{generation.provider}</span>
                    </p>
                    {generation.source_mode && (
                        <p className="text-body-sm text-on-surface-variant mt-1">
                            Detected:{' '}
                            <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    generation.source_mode === 'exam_convert'
                                        ? 'bg-primary-fixed text-on-primary-fixed'
                                        : 'bg-surface-container-high text-on-surface-variant'
                                }`}
                            >
                                {generation.source_mode === 'exam_convert' ? 'Exam sheet — converted as-is' : 'Study material — new questions'}
                            </span>
                        </p>
                    )}
                    {errorMessage && (
                        <p className="text-body-sm text-error mt-1">{errorMessage}</p>
                    )}
                </div>
                <span
                    className={`inline-flex self-start px-3 py-1.5 rounded-full text-xs font-semibold uppercase ${
                        status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                    }`}
                >
                    {status === 'processing' || status === 'pending' ? 'Generating…' : status}
                </span>
            </div>

            {!finished && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-10 mb-6 text-center shadow-sm">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-outline-variant border-t-primary animate-spin" />
                    <p className="text-body-md text-on-surface-variant">
                        Generating questions in the background… this page updates automatically.
                    </p>
                </div>
            )}

            {status === 'failed' && (
                <div className="bg-error-container/30 border border-error-container rounded-xl p-6 mb-6">
                    <p className="text-body-md text-on-surface">
                        Generation failed. Try uploading a clearer document or check the AI provider settings.
                    </p>
                    <Link
                        href={route('ai-generator.index')}
                        className="inline-block mt-3 text-primary font-medium hover:underline"
                    >
                        Back to AI Generator
                    </Link>
                </div>
            )}

            {status === 'completed' && items.length > 0 && (
                <>
                    {/* Target test + approve bar */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center sticky top-20 z-20">
                        <select
                            value={targetTestId}
                            onChange={(e) => setTargetTestId(e.target.value)}
                            className="flex-1 bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-sm"
                        >
                            <option value="">Choose target test…</option>
                            {tests.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.title}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={approve}
                            disabled={saving}
                            className="bg-primary-container text-on-primary font-title-sm px-6 py-2.5 rounded-lg hover:bg-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">check</span>
                            {saving ? 'Saving…' : `Approve selected (${selected.filter(Boolean).length})`}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, i) => (
                            <div
                                key={i}
                                className={`bg-surface-container-lowest border rounded-xl p-5 shadow-sm transition-colors ${
                                    selected[i] ? 'border-primary' : 'border-outline-variant opacity-60'
                                }`}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <input
                                        type="checkbox"
                                        checked={selected[i]}
                                        onChange={() => toggle(i)}
                                        className="mt-1 w-5 h-5 rounded border-outline text-primary focus:ring-primary"
                                    />
                                    <div className="flex-1">
                                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                            Draft {i + 1} • {item.type === 'multiple_choice' ? 'Multiple choice' : 'Essay'} •{' '}
                                            {item.points} pts
                                        </span>
                                        <textarea
                                            value={item.question}
                                            onChange={(e) => updateItem(i, { question: e.target.value })}
                                            rows={2}
                                            className="w-full mt-1 bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-md font-medium"
                                        />
                                    </div>
                                </div>

                                {item.type === 'multiple_choice' && (
                                    <div className="space-y-2 ml-8">
                                        {item.options.map((opt, oi) => (
                                            <div key={oi} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`draft_${i}`}
                                                    checked={opt.is_correct}
                                                    onChange={() =>
                                                        updateItem(i, {
                                                            options: item.options.map((o, k) => ({
                                                                ...o,
                                                                is_correct: k === oi,
                                                            })),
                                                        })
                                                    }
                                                    className="w-4 h-4 text-primary"
                                                />
                                                <span className="font-mono font-bold text-body-sm w-5">{opt.key}.</span>
                                                <input
                                                    value={opt.text}
                                                    onChange={(e) =>
                                                        updateItem(i, {
                                                            options: item.options.map((o, k) =>
                                                                k === oi ? { ...o, text: e.target.value } : o,
                                                            ),
                                                        })
                                                    }
                                                    className="flex-1 bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-body-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-3 mt-3 ml-8">
                                    <label className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                                        Points
                                        <input
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={item.points}
                                            onChange={(e) =>
                                                updateItem(i, { points: parseInt(e.target.value) || 1 })
                                            }
                                            className="w-20 bg-surface border border-outline-variant rounded-lg px-2 py-1 text-body-sm"
                                        />
                                    </label>
                                    <input
                                        value={item.explanation ?? ''}
                                        onChange={(e) => updateItem(i, { explanation: e.target.value })}
                                        placeholder="Explanation (optional)"
                                        className="flex-1 bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-body-sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
}
