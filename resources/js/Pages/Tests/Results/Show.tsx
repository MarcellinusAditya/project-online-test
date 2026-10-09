import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Test } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

interface Option {
    id: number;
    key: string;
    text: string;
    image_url?: string | null;
    is_correct: boolean;
}

interface AnswerDetail {
    id: number;
    question_id: number;
    question: string;
    question_image_url?: string | null;
    type: 'multiple_choice' | 'essay';
    max_points: number;
    points_awarded: number;
    answer_text: string | null;
    selected_option_id: number | null;
    selected_option_text: string | null;
    selected_option_key: string | null;
    is_correct: boolean | null;
    is_graded: boolean;
    feedback: string | null;
    options: Option[];
}

interface AttemptDetail {
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

interface AttemptEvent {
    id: number;
    event_type: string;
    label: string;
    event_data: Record<string, unknown> | null;
    created_at: string;
}

interface ShowProps {
    test: Test;
    attempt: AttemptDetail;
    answers: AnswerDetail[];
    events: AttemptEvent[];
}

const suspiciousEvents = new Set([
    'fullscreen_exited',
    'tab_hidden',
    'window_blur',
    'warning_issued',
]);

export default function ResultsShow({ test, attempt, answers, events = [] }: ShowProps) {
    const suspiciousCount = events.filter((e) => suspiciousEvents.has(e.event_type)).length;
    const { data, setData, post, processing, errors } = useForm({
        grades: answers.map((a) => ({
            answer_id: a.id,
            points_awarded: a.points_awarded,
            feedback: a.feedback || '',
        })),
    });

    const handleGradeChange = (index: number, field: 'points_awarded' | 'feedback', value: any) => {
        const updated = [...data.grades];
        updated[index] = {
            ...updated[index],
            [field]: field === 'points_awarded' ? parseFloat(value) || 0 : value,
        };
        setData('grades', updated);
    };

    const submitGrading = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tests.attempts.grade', [test.id, attempt.id]));
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
                        <Link href={route('tests.results.index', test.id)} className="hover:text-primary">
                            Results
                        </Link>
                        <span>/</span>
                        <span>{attempt.participant_name}</span>
                    </div>
                    <h2 className="text-headline-md md:text-display-lg text-on-surface">
                        Submission Review — {attempt.participant_name}
                    </h2>
                </div>
            }
        >
            <Head title={`Review - ${attempt.participant_name}`} />

            {/* Participant Summary Bar */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-title-sm text-on-surface">{attempt.participant_name}</h3>
                    {attempt.participant_identifier && (
                        <p className="text-body-sm text-on-surface-variant">ID: {attempt.participant_identifier}</p>
                    )}
                    <p className="text-xs text-on-surface-variant mt-1">
                        Submitted: {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : '-'}
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-xs text-on-surface-variant uppercase">Score</p>
                        <p className="text-display-lg-mobile font-bold text-primary">{attempt.score ?? 0}%</p>
                    </div>
                    <div className="text-center border-l border-outline-variant/60 pl-6">
                        <p className="text-xs text-on-surface-variant uppercase">Warnings</p>
                        <p className={`text-title-sm font-bold ${suspiciousCount > 0 ? 'text-error' : 'text-emerald-600'}`}>
                            {suspiciousCount}
                        </p>
                    </div>
                    <div className="text-center border-l border-outline-variant/60 pl-6">
                        <p className="text-xs text-on-surface-variant uppercase">Correct / Wrong</p>
                        <p className="text-title-sm font-semibold">
                            <span className="text-emerald-600">{attempt.total_correct ?? 0}</span> /{' '}
                            <span className="text-error">{attempt.total_wrong ?? 0}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Grading */}
            {events.length > 0 && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm mb-6">
                    <h3 className="font-bold text-title-sm text-on-surface mb-1 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">monitoring</span>
                        Activity Timeline
                    </h3>
                    <p className="text-body-sm text-on-surface-variant mb-4">
                        Full audit of suspicious events during this attempt.
                    </p>
                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                        {events.map((event) => {
                            const isSuspicious = suspiciousEvents.has(event.event_type);
                            return (
                                <div
                                    key={event.id}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm border ${
                                        isSuspicious
                                            ? 'bg-error-container/20 border-error-container text-on-surface'
                                            : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant'
                                    }`}
                                >
                                    <span
                                        className={`material-symbols-outlined text-[18px] ${
                                            isSuspicious ? 'text-error' : 'text-on-surface-variant'
                                        }`}
                                    >
                                        {isSuspicious ? 'warning' : 'info'}
                                    </span>
                                    <span className="font-semibold">{event.label}</span>
                                    {(() => {
                                        const r =
                                            (event.event_data as Record<string, unknown> | null)?.reason ??
                                            (event.event_data as Record<string, unknown> | null)?.warning_number;
                                        return r ? (
                                            <span className="text-on-surface-variant truncate">
                                                — {String(r)}
                                            </span>
                                        ) : null;
                                    })()}
                                    <span className="ml-auto text-xs text-on-surface-variant whitespace-nowrap">
                                        {new Date(event.created_at).toLocaleTimeString()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <form onSubmit={submitGrading} className="space-y-6">
                {answers.map((answer, index) => {
                    const gradeState = data.grades[index];

                    return (
                        <div
                            key={answer.id}
                            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-outline-variant/40">
                                <div>
                                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                        Question {index + 1} • {answer.type === 'multiple_choice' ? 'Multiple Choice' : 'Essay'}
                                    </span>
                                    <h4 className="font-semibold text-title-sm text-on-surface mt-1">
                                        {answer.question}
                                    </h4>
                                    {answer.question_image_url && (
                                        <img
                                            src={answer.question_image_url}
                                            alt={`Question ${index + 1} image`}
                                            className="mt-3 max-h-56 rounded-lg border border-outline-variant object-contain"
                                        />
                                    )}
                                </div>
                                <span className="text-body-sm font-medium text-on-surface-variant whitespace-nowrap">
                                    Max Points: {answer.max_points}
                                </span>
                            </div>

                            {/* Multiple Choice Answers Display */}
                            {answer.type === 'multiple_choice' && (
                                <div className="space-y-2 mb-4">
                                    {answer.options.map((opt) => {
                                        const isSelected = opt.id === answer.selected_option_id;
                                        const isCorrectOpt = opt.is_correct;

                                        let styleClass = 'bg-surface border-outline-variant/60 text-on-surface';
                                        if (isSelected && isCorrectOpt) {
                                            styleClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium';
                                        } else if (isSelected && !isCorrectOpt) {
                                            styleClass = 'bg-red-50 border-red-500 text-red-900 font-medium';
                                        } else if (isCorrectOpt) {
                                            styleClass = 'bg-green-50/50 border-green-300 text-green-800';
                                        }

                                        return (
                                            <div
                                                key={opt.id}
                                                className={`p-3 rounded-lg border flex items-center justify-between text-body-sm ${styleClass}`}
                                            >
                                                <span>
                                                    <span className="font-mono font-bold mr-2">{opt.key}.</span>
                                                    {opt.text}
                                                    {opt.image_url && (
                                                        <img
                                                            src={opt.image_url}
                                                            alt={`Option ${opt.key} image`}
                                                            className="mt-1 max-h-28 rounded-md border border-outline-variant object-contain"
                                                        />
                                                    )}
                                                </span>
                                                {isSelected && (
                                                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-white/80 shadow-xs">
                                                        Selected Answer
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Essay Answer Display */}
                            {answer.type === 'essay' && (
                                <div className="mb-4">
                                    <p className="text-xs font-semibold text-on-surface-variant mb-2">Participant Answer:</p>
                                    <div className="bg-surface-container-low border border-outline-variant/60 rounded-lg p-4 text-body-md text-on-surface whitespace-pre-wrap">
                                        {answer.answer_text || <span className="italic text-on-surface-variant">No answer provided</span>}
                                    </div>
                                </div>
                            )}

                            {/* Grading Input Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-outline-variant/40 bg-surface-container-low/30 -mx-6 -mb-6 p-6 rounded-b-xl">
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface mb-1">
                                        Points Awarded (0 - {answer.max_points})
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max={answer.max_points}
                                        value={gradeState?.points_awarded ?? 0}
                                        onChange={(e) => handleGradeChange(index, 'points_awarded', e.target.value)}
                                        className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-on-surface mb-1">
                                        Feedback / Notes (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={gradeState?.feedback ?? ''}
                                        onChange={(e) => handleGradeChange(index, 'feedback', e.target.value)}
                                        placeholder="Add comments for participant..."
                                        className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="flex justify-end gap-3 sticky bottom-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-lg z-20">
                    <Link
                        href={route('tests.results.index', test.id)}
                        className="px-5 py-2.5 rounded-lg border border-outline-variant text-body-sm font-medium hover:bg-surface-container"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-primary-container text-on-primary font-body-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary transition-colors disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : 'Save Grade & Recalculate'}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
