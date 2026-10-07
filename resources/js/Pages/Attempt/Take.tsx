import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Question {
    id: number;
    question: string;
    type: 'multiple_choice' | 'essay';
    points: number;
    options: {
        id: number;
        key: string;
        text: string;
    }[];
    selected_option_id: number | null;
    answer_text: string | null;
}

interface TakeProps {
    attempt: {
        id: number;
        test_id: number;
        test_title: string;
        participant_name: string;
        started_at: string;
        expires_at: string;
        remaining_seconds: number;
        status: string;
    };
    questions: Question[];
    current_question_index: number;
}

export default function Take({ attempt, questions, current_question_index }: TakeProps) {
    const [currentIndex, setCurrentIndex] = useState(current_question_index);
    const [answers, setAnswers] = useState<Record<number, { option_id: number | null; text: string | null }>>(() => {
        const initial: Record<number, { option_id: number | null; text: string | null }> = {};
        questions.forEach((q) => {
            initial[q.id] = {
                option_id: q.selected_option_id,
                text: q.answer_text,
            };
        });
        return initial;
    });
    const [remainingSeconds, setRemainingSeconds] = useState(attempt.remaining_seconds);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const currentQuestion = questions[currentIndex];

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getQuestionStatus = (questionId: number) => {
        const answer = answers[questionId];
        if (!answer) return 'unanswered';
        if (answer.option_id !== null) return 'answered';
        if (answer.text && answer.text.trim() !== '') return 'answered';
        return 'unanswered';
    };

    const answeredCount = questions.filter((q) => getQuestionStatus(q.id) === 'answered').length;

    const saveAnswer = useCallback(async (questionId: number, optionId: number | null, text: string | null) => {
        try {
            await fetch(`/attempt/${attempt.id}/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    question_id: questionId,
                    question_option_id: optionId,
                    answer_text: text,
                }),
            });
        } catch (error) {
            console.error('Failed to save answer:', error);
        }
    }, [attempt.id]);

    const handleOptionSelect = (optionId: number) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: { option_id: optionId, text: null },
        }));

        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = setTimeout(() => {
            saveAnswer(currentQuestion.id, optionId, null);
        }, 500);
    };

    const handleTextChange = (text: string) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: { option_id: null, text },
        }));

        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = setTimeout(() => {
            saveAnswer(currentQuestion.id, null, text);
        }, 1000);
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            router.post(route('attempt.submit', attempt.id));
        } catch (error) {
            console.error('Failed to submit:', error);
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (remainingSeconds <= 0) {
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [remainingSeconds]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                fetch(`/attempt/${attempt.id}/answer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({
                        question_id: -1,
                        event_type: 'tab_hidden',
                    }),
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [attempt.id]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Head title={`${attempt.test_title} - Taking Test`} />

            {/* Header */}
            <header className="bg-surface-container-lowest border-b border-outline-variant h-16 flex justify-between items-center px-6 shrink-0 z-20 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <h1 className="font-title-sm text-title-sm font-bold text-on-surface">{attempt.test_title}</h1>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Question {currentIndex + 1} of {questions.length}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/50">
                        <span className="material-symbols-outlined text-primary-container">timer</span>
                        <span className={`font-mono-label text-mono-label font-medium ${
                            remainingSeconds < 300 ? 'text-error' : 'text-primary-container'
                        }`}>
                            {formatTime(remainingSeconds)}
                        </span>
                    </div>
                    <button
                        onClick={() => setShowSubmitConfirm(true)}
                        className="bg-primary-container text-on-primary font-body-sm text-body-sm px-4 py-2 rounded-lg hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        Submit Test
                    </button>
                </div>
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-[2px] bg-surface-container-high w-full">
                    <div
                        className="h-full bg-primary-container transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-8 flex justify-center pb-32">
                    <div className="w-full max-w-[800px] flex flex-col gap-6">
                        {/* Status Banner */}
                        <div className="flex justify-between items-center">
                            {answers[currentQuestion.id]?.option_id !== null && (
                                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    <span className="font-body-sm text-body-sm font-medium">Answer saved</span>
                                </div>
                            )}
                            <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container px-3 py-1 rounded-md">
                                {currentQuestion.points} points
                            </span>
                        </div>

                        {/* Question Card */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            <h2 className="font-title-sm text-title-sm text-on-surface-variant mb-4">
                                Question {currentIndex + 1}
                            </h2>
                            <p className="font-display-lg-mobile text-display-lg-mobile text-on-surface mb-8">
                                {currentQuestion.question}
                            </p>

                            {/* MCQ Options */}
                            {currentQuestion.type === 'multiple_choice' && (
                                <div className="flex flex-col gap-4">
                                    {currentQuestion.options.map((option) => {
                                        const isSelected = answers[currentQuestion.id]?.option_id === option.id;
                                        return (
                                            <label
                                                key={option.id}
                                                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                                                    isSelected
                                                        ? 'border-primary-container bg-surface-container-low'
                                                        : 'border-outline-variant hover:bg-surface-container-low'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question_${currentQuestion.id}`}
                                                    checked={isSelected}
                                                    onChange={() => handleOptionSelect(option.id)}
                                                    className="w-5 h-5 text-primary-container border-outline focus:ring-primary-container mr-4"
                                                />
                                                <span className={`font-body-md text-body-md ${
                                                    isSelected ? 'text-on-surface font-medium' : 'text-on-surface'
                                                }`}>
                                                    {option.text}
                                                </span>
                                                {isSelected && (
                                                    <span className="absolute right-4 text-primary-container material-symbols-outlined">
                                                        check
                                                    </span>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Essay Input */}
                            {currentQuestion.type === 'essay' && (
                                <div>
                                    <textarea
                                        value={answers[currentQuestion.id]?.text || ''}
                                        onChange={(e) => handleTextChange(e.target.value)}
                                        className="w-full bg-surface-bright border border-outline-variant rounded-lg p-4 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all placeholder:text-outline"
                                        placeholder="Type your answer here..."
                                        rows={8}
                                    />
                                    <p className="mt-2 text-[12px] text-on-surface-variant">
                                        Your answer will be saved automatically.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Question Navigator */}
                <aside className="w-[320px] bg-surface-container-lowest border-l border-outline-variant h-full hidden lg:flex flex-col shrink-0 shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">
                    <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
                        <h3 className="font-title-sm text-title-sm font-semibold text-on-surface">Question Navigator</h3>
                    </div>
                    <div className="p-6 overflow-y-auto">
                        <div className="flex gap-4 mb-6 text-sm">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-primary-container"></div>
                                Current
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-surface-container-low border border-outline-variant flex items-center justify-center">
                                    <span className="block w-1.5 h-1.5 bg-outline rounded-full"></span>
                                </div>
                                Answered
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full border border-outline-variant"></div>
                                Unanswered
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {questions.map((q, idx) => {
                                const status = getQuestionStatus(q.id);
                                const isCurrent = idx === currentIndex;
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`w-full aspect-square rounded-lg flex items-center justify-center font-mono-label text-mono-label transition-colors relative ${
                                            isCurrent
                                                ? 'bg-primary-container text-on-primary font-bold shadow-md ring-2 ring-primary-container ring-offset-2 ring-offset-surface-container-lowest'
                                                : status === 'answered'
                                                ? 'border border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-primary-container'
                                                : 'border border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary-container hover:bg-surface'
                                        }`}
                                    >
                                        {idx + 1}
                                        {status === 'answered' && !isCurrent && (
                                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-outline rounded-full"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                {/* Bottom Action Bar */}
                <div className="absolute bottom-0 left-0 right-0 lg:right-[320px] bg-surface-container-lowest border-t border-outline-variant p-4 flex justify-between items-center shadow-[0_-4px_12px_rgba(0,0,0,0.02)] z-10">
                    <button
                        onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-sm text-body-sm px-6 py-2.5 rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                        disabled={currentIndex === questions.length - 1}
                        className="flex items-center gap-2 bg-primary-container text-on-primary font-body-sm text-body-sm px-6 py-2.5 rounded-lg hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        Next
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            {showSubmitConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl p-6 max-w-md mx-4">
                        <h3 className="font-title-sm text-title-sm font-semibold text-on-surface mb-2">Submit Test?</h3>
                        <p className="font-body-md text-on-surface-variant mb-4">
                            Are you sure you want to submit? You have answered {answeredCount} of {questions.length} questions.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowSubmitConfirm(false)}
                                className="px-4 py-2 rounded border border-outline-variant text-on-surface font-body-sm hover:bg-surface-container transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-4 py-2 rounded bg-primary-container text-on-primary font-body-sm hover:bg-primary transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
