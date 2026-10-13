import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface BankQuestion {
    id: number;
    question: string;
    image_url?: string | null;
    type: 'multiple_choice' | 'essay';
    points: number;
    options?: { id: number; key: string; text: string; image_url?: string | null; is_correct: boolean }[];
}

interface Bank {
    id: number;
    name: string;
    description: string | null;
    questions_count: number;
}

interface TestOption {
    id: number;
    title: string;
}

interface ShowProps {
    bank: Bank;
    questions: {
        data: BankQuestion[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    tests: TestOption[];
}

export default function BankShow({ bank, questions, tests }: ShowProps) {
    const [selected, setSelected] = useState<number[]>([]);
    const [targetTestId, setTargetTestId] = useState<string>('');
    const [importing, setImporting] = useState(false);

    const toggle = (id: number) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const toggleAll = () => {
        if (selected.length === questions.data.length) {
            setSelected([]);
        } else {
            setSelected(questions.data.map((q) => q.id));
        }
    };

    const handleImport = () => {
        if (!targetTestId) {
            alert('Choose a target test first.');
            return;
        }
        if (selected.length === 0) {
            alert('Select at least one question.');
            return;
        }
        setImporting(true);
        (router.post as (...args: unknown[]) => void)(
            route('tests.questions.import', parseInt(targetTestId)),
            { question_ids: selected },
            { onFinish: () => setImporting(false) }
        );
    };

    const handleDelete = () => {
        if (
            confirm(
                `Delete bank "${bank.name}"? Its ${bank.questions_count} question(s) will be deleted too. Questions already used in tests are kept as copies.`
            )
        ) {
            router.delete(route('question-banks.destroy', bank.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-2">
                        <Link href={route('question-banks.index')} className="hover:text-primary">
                            Question Banks
                        </Link>
                        <span>/</span>
                        <span>{bank.name}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h2 className="text-headline-md md:text-display-lg text-on-surface">{bank.name}</h2>
                            {bank.description && (
                                <p className="text-body-sm md:text-body-md text-on-surface-variant mt-1 max-w-2xl">
                                    {bank.description}
                                </p>
                            )}
                            <p className="text-body-sm text-on-surface-variant mt-1">
                                {bank.questions_count} question{bank.questions_count === 1 ? '' : 's'}
                            </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Link
                                href={route('question-banks.edit', bank.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-body-sm font-medium hover:bg-surface-container transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                Edit
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-body-sm font-medium text-error hover:bg-error-container/30 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={bank.name} />

            {/* Import bar */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center">
                <label className="flex items-center gap-2 text-body-sm font-medium whitespace-nowrap cursor-pointer">
                    <input
                        type="checkbox"
                        checked={questions.data.length > 0 && selected.length === questions.data.length}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                    />
                    Select all ({selected.length} selected)
                </label>
                <select
                    value={targetTestId}
                    onChange={(e) => setTargetTestId(e.target.value)}
                    className="flex-1 bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-sm"
                >
                    <option value="">Add selected to test...</option>
                    {tests.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.title}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleImport}
                    disabled={importing}
                    className="bg-primary-container text-on-primary text-body-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-[18px]">library_add</span>
                    {importing ? 'Adding...' : 'Add to Test'}
                </button>
            </div>

            {/* Questions list */}
            <div className="space-y-4">
                {questions.data.length === 0 ? (
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center text-on-surface-variant shadow-sm">
                        <span className="material-symbols-outlined text-[48px] mb-3 block">quiz</span>
                        <p>No questions in this bank yet.</p>
                        <p className="text-body-sm mt-1">
                            Questions you create inside a test are stored in its auto-bank. Use AI Generator or create
                            questions in a test to grow this library.
                        </p>
                    </div>
                ) : (
                    questions.data.map((q, i) => (
                        <div
                            key={q.id}
                            className={`bg-surface-container-lowest border rounded-xl p-5 shadow-sm transition-colors ${
                                selected.includes(q.id) ? 'border-primary' : 'border-outline-variant'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(q.id)}
                                    onChange={() => toggle(q.id)}
                                    className="mt-1 w-5 h-5 rounded border-outline text-primary focus:ring-primary shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                        #{(questions.current_page - 1) * questions.per_page + i + 1} •{' '}
                                        {q.type === 'multiple_choice' ? 'Multiple choice' : 'Essay'} • {q.points} pts
                                    </span>
                                    <p className="font-medium text-body-md text-on-surface mt-1">
                                        {q.question || <span className="italic text-on-surface-variant">(Image question)</span>}
                                    </p>
                                    {q.image_url && (
                                        <img
                                            src={q.image_url}
                                            alt="Question image"
                                            className="mt-2 max-h-40 rounded-lg border border-outline-variant object-contain"
                                        />
                                    )}
                                    {q.type === 'multiple_choice' && q.options && (
                                        <div className="mt-2 space-y-1">
                                            {q.options.map((opt) => (
                                                <div key={opt.id} className="flex items-center gap-2 text-body-sm">
                                                    <span
                                                        className={`font-mono font-bold ${opt.is_correct ? 'text-emerald-600' : 'text-on-surface-variant'}`}
                                                    >
                                                        {opt.key}.
                                                    </span>
                                                    <span className={opt.is_correct ? 'font-medium' : 'text-on-surface-variant'}>
                                                        {opt.text || <span className="italic">(image)</span>}
                                                    </span>
                                                    {opt.image_url && (
                                                        <img
                                                            src={opt.image_url}
                                                            alt={`Option ${opt.key}`}
                                                            className="max-h-12 rounded border border-outline-variant object-contain"
                                                        />
                                                    )}
                                                    {opt.is_correct && (
                                                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                                                            CORRECT
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {questions.last_page > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-body-sm text-on-surface-variant">
                        Page {questions.current_page} of {questions.last_page} ({questions.total} total)
                    </p>
                    <div className="flex gap-2">
                        {questions.current_page > 1 && (
                            <Link
                                href={route('question-banks.show', { question_bank: bank.id, page: questions.current_page - 1 })}
                                className="px-3 py-1.5 text-sm font-medium bg-surface border border-outline-variant rounded-md hover:bg-surface-container"
                            >
                                Previous
                            </Link>
                        )}
                        {questions.current_page < questions.last_page && (
                            <Link
                                href={route('question-banks.show', { question_bank: bank.id, page: questions.current_page + 1 })}
                                className="px-3 py-1.5 text-sm font-medium bg-surface border border-outline-variant rounded-md hover:bg-surface-container"
                            >
                                Next
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
