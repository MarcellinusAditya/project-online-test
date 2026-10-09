import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Test } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface QuestionsCreateProps {
    test: Test;
}

interface OptionForm {
    key: string;
    text: string;
    image: File | null;
    preview: string | null;
}

export default function QuestionsCreate({ test }: QuestionsCreateProps) {
    const [questionType, setQuestionType] = useState<'multiple_choice' | 'essay'>('multiple_choice');
    const [questionPreview, setQuestionPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        question: '',
        question_image: null as File | null,
        type: 'multiple_choice',
        points: 5,
        explanation: '',
        options: [
            { key: 'A', text: '', image: null, preview: null },
            { key: 'B', text: '', image: null, preview: null },
            { key: 'C', text: '', image: null, preview: null },
            { key: 'D', text: '', image: null, preview: null },
        ] as OptionForm[],
        correct_option: 0,
    });

    const handleTypeChange = (type: 'multiple_choice' | 'essay') => {
        setQuestionType(type);
        setData('type', type);
    };

    const handleQuestionImage = (file: File | undefined) => {
        if (!file) return;
        setData('question_image', file);
        setQuestionPreview(URL.createObjectURL(file));
    };

    const clearQuestionImage = () => {
        setData('question_image', null);
        setQuestionPreview(null);
    };

    const handleOptionImage = (index: number, file: File | undefined) => {
        if (!file) return;
        const newOptions = [...data.options];
        newOptions[index] = { ...newOptions[index], image: file, preview: URL.createObjectURL(file) };
        setData('options', newOptions);
    };

    const clearOptionImage = (index: number) => {
        const newOptions = [...data.options];
        newOptions[index] = { ...newOptions[index], image: null, preview: null };
        setData('options', newOptions);
    };

    const addOption = () => {
        const nextKey = String.fromCharCode(65 + data.options.length);
        setData('options', [...data.options, { key: nextKey, text: '', image: null, preview: null }]);
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
        post(route('tests.questions.store', test.id), { forceFormData: true });
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
                                        placeholder="Enter your question here... (optional if an image is provided)"
                                        rows={3}
                                        value={data.question}
                                        onChange={(e) => setData('question', e.target.value)}
                                    />
                                    {errors.question && (
                                        <p className="mt-1 text-sm text-error">{errors.question}</p>
                                    )}
                                </div>

                                {/* Question Image */}
                                <div>
                                    <label className="block font-body-sm font-medium text-on-surface mb-2">
                                        Question Image <span className="text-on-surface-variant font-normal">(optional, max 1 MB)</span>
                                    </label>
                                    {questionPreview ? (
                                        <div className="relative inline-block">
                                            <img
                                                src={questionPreview}
                                                alt="Question preview"
                                                className="max-h-56 rounded-lg border border-outline-variant"
                                            />
                                            <button
                                                type="button"
                                                onClick={clearQuestionImage}
                                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-error transition-colors"
                                                title="Remove image"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-outline-variant bg-surface-bright cursor-pointer hover:border-primary transition-colors">
                                            <span className="material-symbols-outlined text-on-surface-variant">image</span>
                                            <span className="font-body-sm text-on-surface-variant">
                                                Click to upload an image (JPG, PNG, WebP)
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                className="hidden"
                                                onChange={(e) => handleQuestionImage(e.target.files?.[0])}
                                            />
                                        </label>
                                    )}
                                    {errors.question_image && (
                                        <p className="mt-1 text-sm text-error">{errors.question_image}</p>
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
                                                    <div className="flex-1 space-y-2">
                                                        <input
                                                            type="text"
                                                            className="w-full bg-transparent border-none p-0 font-body-md text-on-surface focus:ring-0"
                                                            value={option.text}
                                                            onChange={(e) => {
                                                                const newOptions = [...data.options];
                                                                newOptions[index].text = e.target.value;
                                                                setData('options', newOptions);
                                                            }}
                                                            placeholder={`Option ${option.key} (optional if image provided)`}
                                                        />
                                                        {option.preview ? (
                                                            <div className="relative inline-block">
                                                                <img
                                                                    src={option.preview}
                                                                    alt={`Option ${option.key} preview`}
                                                                    className="max-h-28 rounded-lg border border-outline-variant"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => clearOptionImage(index)}
                                                                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-error transition-colors"
                                                                    title="Remove image"
                                                                >
                                                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <label className="inline-flex items-center gap-1.5 text-[13px] text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
                                                                <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                                                                Add image
                                                                <input
                                                                    type="file"
                                                                    accept="image/jpeg,image/png,image/webp"
                                                                    className="hidden"
                                                                    onChange={(e) => handleOptionImage(index, e.target.files?.[0])}
                                                                />
                                                            </label>
                                                        )}
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
