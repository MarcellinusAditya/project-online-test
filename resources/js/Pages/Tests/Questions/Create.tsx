import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Test } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface QuestionsCreateProps {
    test: Test;
}

export default function QuestionsCreate({ test }: QuestionsCreateProps) {
    const [questionType, setQuestionType] = useState<'multiple_choice' | 'essay'>('multiple_choice');

    const { data, setData, post, processing, errors } = useForm({
        question: '',
        type: 'multiple_choice',
        points: 5,
        explanation: '',
        options: [
            { key: 'A', text: '' },
            { key: 'B', text: '' },
            { key: 'C', text: '' },
            { key: 'D', text: '' },
        ],
        correct_option: 0,
    });

    const handleTypeChange = (type: 'multiple_choice' | 'essay') => {
        setQuestionType(type);
        setData('type', type);
    };

    const addOption = () => {
        const nextKey = String.fromCharCode(65 + data.options.length);
        setData('options', [...data.options, { key: nextKey, text: '' }]);
    };

    const removeOption = (index: number) => {
        if (data.options.length <= 2) return;
        const newOptions = data.options.filter((_, i) => i !== index);
        setData('options', newOptions);
        if (data.correct_option >= newOptions.length) {
            setData('correct_option', 0);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tests.questions.store', test.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Add Question" />

            {/* Workspace Context Header */}
            <div className="bg-surface border-b border-outline-variant px-gutter py-3 flex items-center justify-between shrink-0 -m-container-padding mb-0">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('tests.questions.index', test.id)}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container text-on-surface-variant transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-headline-md font-semibold text-on-surface">Add Question</h2>
                            <span className="px-2 py-0.5 rounded bg-secondary-container text-primary font-label-caps text-label-caps">
                                {test.title}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex justify-center -mx-container-padding mt-4" style={{ minHeight: 'calc(100vh - 250px)' }}>
                <main className="w-full max-w-[800px] p-6 lg:p-8">
                    <form onSubmit={submit} className="flex flex-col gap-6">
                        {/* Editor Card */}
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
                            {/* Card Header */}
                            <div className="px-6 py-4 border-b border-outline-variant flex flex-wrap items-center justify-between gap-4 bg-surface-bright">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-title-sm text-[18px] font-semibold text-on-surface">New Question</h3>
                                    <span
                                        className="px-2 py-1 rounded-md bg-secondary-container text-on-secondary-container font-label-caps text-[11px] flex items-center gap-1 cursor-pointer hover:bg-surface-container transition-colors"
                                        onClick={() => handleTypeChange(questionType === 'multiple_choice' ? 'essay' : 'multiple_choice')}
                                    >
                                        <span className="material-symbols-outlined text-[14px]">
                                            {questionType === 'multiple_choice' ? 'radio_button_checked' : 'subject'}
                                        </span>
                                        {questionType === 'multiple_choice' ? 'MULTIPLE CHOICE' : 'ESSAY'}
                                    </span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 space-y-8">
                                {/* Question Text */}
                                <div>
                                    <label className="block font-body-sm font-medium text-on-surface mb-2">
                                        Question Text
                                    </label>
                                    <textarea
                                        className="w-full bg-surface-bright border border-outline-variant rounded-lg p-4 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all placeholder:text-outline"
                                        placeholder="Enter your question here..."
                                        rows={3}
                                        value={data.question}
                                        onChange={(e) => setData('question', e.target.value)}
                                        required
                                    />
                                    {errors.question && (
                                        <p className="mt-1 text-sm text-error">{errors.question}</p>
                                    )}
                                </div>

                                {/* Answers Section - Only for MCQ */}
                                {questionType === 'multiple_choice' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="block font-body-sm font-medium text-on-surface">
                                                Answer Options
                                            </label>
                                            <span className="font-body-sm text-on-surface-variant text-[13px]">
                                                Select the correct answer
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {data.options.map((option, index) => (
                                                <div
                                                    key={index}
                                                    className={`group flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                                                        data.correct_option === index
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-outline-variant hover:border-outline bg-surface-bright'
                                                    }`}
                                                >
                                                    <div className="mt-1 cursor-grab text-outline hover:text-on-surface">
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            drag_indicator
                                                        </span>
                                                    </div>
                                                    <div className="mt-1">
                                                        <input
                                                            type="radio"
                                                            name="correct_option"
                                                            checked={data.correct_option === index}
                                                            onChange={() => setData('correct_option', index)}
                                                            className="w-5 h-5 text-primary border-outline-variant focus:ring-primary cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            className="w-full bg-transparent border-none p-0 font-body-md text-on-surface focus:ring-0"
                                                            value={option.text}
                                                            onChange={(e) => {
                                                                const newOptions = [...data.options];
                                                                newOptions[index].text = e.target.value;
                                                                setData('options', newOptions);
                                                            }}
                                                            placeholder={`Option ${option.key}`}
                                                            required
                                                        />
                                                    </div>
                                                    {data.correct_option === index && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 bg-primary text-on-primary font-label-caps text-[10px] rounded-full">
                                                                CORRECT
                                                            </span>
                                                        </div>
                                                    )}
                                                    {data.options.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOption(index)}
                                                            className="text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addOption}
                                            className="mt-3 flex items-center gap-1 text-primary text-sm font-medium hover:underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">add</span> Add Option
                                        </button>
                                        {errors.options && (
                                            <p className="mt-1 text-sm text-error">{errors.options}</p>
                                        )}
                                    </div>
                                )}

                                {/* Essay indicator */}
                                {questionType === 'essay' && (
                                    <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                                        <div className="flex items-center gap-2 text-on-surface-variant">
                                            <span className="material-symbols-outlined">subject</span>
                                            <span className="font-body-sm">Participants will type their answer in a text area.</span>
                                        </div>
                                    </div>
                                )}

                                {/* Divider */}
                                <hr className="border-outline-variant" />

                                {/* Configuration */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block font-body-sm font-medium text-on-surface mb-2">
                                            Points
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                            value={data.points}
                                            onChange={(e) => setData('points', parseInt(e.target.value))}
                                            min={1}
                                            max={100}
                                            required
                                        />
                                        {errors.points && (
                                            <p className="mt-1 text-sm text-error">{errors.points}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block font-body-sm font-medium text-on-surface mb-2">
                                            Difficulty
                                        </label>
                                        <select className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                                            <option>Easy</option>
                                            <option selected>Medium</option>
                                            <option>Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-body-sm font-medium text-on-surface mb-2">
                                        Explanation (Optional)
                                    </label>
                                    <textarea
                                        className="w-full bg-surface-bright border border-outline-variant rounded-lg p-3 font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all placeholder:text-outline"
                                        placeholder="Explain why the answer is correct..."
                                        rows={2}
                                        value={data.explanation}
                                        onChange={(e) => setData('explanation', e.target.value)}
                                    />
                                    <p className="text-[12px] text-on-surface-variant mt-1">
                                        Shown to students after test completion if enabled in settings.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3">
                            <Link
                                href={route('tests.questions.index', test.id)}
                                className="px-4 py-2 rounded border border-outline-variant text-on-surface font-title-sm text-[14px] hover:bg-surface-container transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 rounded bg-primary-container text-on-primary-container font-title-sm text-[14px] shadow-sm hover:bg-primary transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {processing ? 'Adding...' : 'Add Question'}
                                <span className="material-symbols-outlined text-[18px]">add</span>
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
