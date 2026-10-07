import { Head } from '@inertiajs/react';

interface Answer {
    id: number;
    question_id: number;
    question: string;
    type: 'multiple_choice' | 'essay';
    points: number;
    options: {
        id: number;
        key: string;
        text: string;
        is_correct: boolean;
    }[];
    selected_option_id: number | null;
    selected_option_key: string | null;
    answer_text: string | null;
    is_correct: boolean | null;
    points_awarded: number;
    feedback: string | null;
    is_graded: boolean;
}

interface ResultProps {
    attempt: {
        id: number;
        test_title: string;
        participant_name: string;
        participant_identifier: string | null;
        status: string;
        score: number | null;
        total_correct: number | null;
        total_wrong: number | null;
        total_unanswered: number | null;
        time_spent_seconds: number | null;
        started_at: string;
        submitted_at: string | null;
        show_result: boolean;
    };
    answers: Answer[];
}

export default function Result({ attempt, answers }: ResultProps) {
    const formatTime = (seconds: number | null) => {
        if (!seconds) return '0m';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const totalPoints = answers.reduce((sum, a) => sum + a.points, 0);
    const earnedPoints = answers.reduce((sum, a) => sum + a.points_awarded, 0);

    return (
        <div className="min-h-screen bg-background">
            <Head title={`Result - ${attempt.test_title}`} />

            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-on-primary text-3xl">emoji_events</span>
                    </div>
                    <h1 className="text-headline-md font-bold text-on-surface">Test Completed</h1>
                    <p className="text-body-md text-on-surface-variant mt-1">{attempt.test_title}</p>
                </div>

                {/* Score Card */}
                {attempt.show_result && attempt.score !== null && (
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-6 mb-6">
                        <div className="text-center">
                            <p className="text-body-sm text-on-surface-variant mb-2">Your Score</p>
                            <p className="text-display-lg font-bold text-primary">{attempt.score}%</p>
                            <p className="text-body-md text-on-surface-variant mt-1">
                                {earnedPoints} / {totalPoints} points
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 text-center">
                        <span className="material-symbols-outlined text-primary mb-2">person</span>
                        <p className="text-body-sm text-on-surface-variant">Participant</p>
                        <p className="text-title-sm font-semibold text-on-surface">{attempt.participant_name}</p>
                    </div>
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 text-center">
                        <span className="material-symbols-outlined text-primary mb-2">timer</span>
                        <p className="text-body-sm text-on-surface-variant">Time Spent</p>
                        <p className="text-title-sm font-semibold text-on-surface">{formatTime(attempt.time_spent_seconds)}</p>
                    </div>
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 text-center">
                        <span className="material-symbols-outlined text-green-600 mb-2">check_circle</span>
                        <p className="text-body-sm text-on-surface-variant">Correct</p>
                        <p className="text-title-sm font-semibold text-on-surface">{attempt.total_correct}</p>
                    </div>
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 text-center">
                        <span className="material-symbols-outlined text-red-600 mb-2">cancel</span>
                        <p className="text-body-sm text-on-surface-variant">Wrong</p>
                        <p className="text-title-sm font-semibold text-on-surface">{attempt.total_wrong}</p>
                    </div>
                </div>

                {/* Answer Review */}
                {attempt.show_result && (
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-outline-variant bg-surface-bright">
                            <h2 className="font-title-sm text-title-sm font-semibold text-on-surface">Answer Review</h2>
                        </div>
                        <div className="divide-y divide-outline-variant">
                            {answers.map((answer, index) => (
                                <div key={answer.id} className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-sm font-medium text-on-surface-variant">
                                                {index + 1}
                                            </span>
                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                                                answer.type === 'multiple_choice'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {answer.type === 'multiple_choice' ? 'MCQ' : 'Essay'}
                                            </span>
                                            <span className="text-sm text-on-surface-variant">
                                                {answer.points_awarded} / {answer.points} pts
                                            </span>
                                        </div>
                                        <span className={`material-symbols-outlined ${
                                            answer.is_correct ? 'text-green-600' : answer.is_correct === false ? 'text-red-600' : 'text-yellow-600'
                                        }`}>
                                            {answer.is_correct ? 'check_circle' : answer.is_correct === false ? 'cancel' : 'pending'}
                                        </span>
                                    </div>
                                    <p className="text-on-surface mb-3">{answer.question}</p>

                                    {answer.type === 'multiple_choice' && (
                                        <div className="space-y-2 ml-11">
                                            {answer.options.map((option) => {
                                                const isSelected = option.id === answer.selected_option_id;
                                                return (
                                                    <div
                                                        key={option.id}
                                                        className={`flex items-center space-x-2 rounded-md px-3 py-2 ${
                                                            option.is_correct
                                                                ? 'bg-green-50 text-green-800'
                                                                : isSelected
                                                                ? 'bg-red-50 text-red-800'
                                                                : 'bg-surface-container-low text-on-surface-variant'
                                                        }`}
                                                    >
                                                        <span className="font-medium">{option.key}.</span>
                                                        <span>{option.text}</span>
                                                        {option.is_correct && (
                                                            <span className="ml-auto text-xs text-green-600">✓ Correct</span>
                                                        )}
                                                        {isSelected && !option.is_correct && (
                                                            <span className="ml-auto text-xs text-red-600">Your answer</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {answer.type === 'essay' && answer.answer_text && (
                                        <div className="ml-11 p-3 bg-surface-container-low rounded-lg">
                                            <p className="text-body-sm text-on-surface">{answer.answer_text}</p>
                                        </div>
                                    )}

                                    {answer.feedback && (
                                        <div className="ml-11 mt-3 p-3 bg-blue-50 rounded-lg">
                                            <p className="text-body-sm text-blue-800">
                                                <span className="font-medium">Feedback: </span>{answer.feedback}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!attempt.show_result && (
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 text-center">
                        <span className="material-symbols-outlined text-on-surface-variant text-[48px] mb-4">visibility_off</span>
                        <p className="text-body-md text-on-surface-variant">
                            Results will be available after the test is graded.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
