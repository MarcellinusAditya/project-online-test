import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Question, QuestionOption, Test } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface QuestionsIndexProps {
    test: Test;
    questions: Question[];
}

export default function QuestionsIndex({ test, questions }: QuestionsIndexProps) {
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
        questions.length > 0 ? questions[0].id : null
    );
    const [questionType, setQuestionType] = useState<'multiple_choice' | 'essay'>('multiple_choice');

    const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

    const { data, setData, post, processing, errors } = useForm({
        question: '',
        type: 'multiple_choice' as 'multiple_choice' | 'essay',
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

    const handleDelete = (question: Question) => {
        if (confirm('Are you sure you want to delete this question?')) {
            router.delete(route('tests.questions.destroy', [test.id, question.id]), {
                onSuccess: () => {
                    if (selectedQuestionId === question.id) {
                        setSelectedQuestionId(questions.length > 1 ? questions[0].id : null);
                    }
                },
            });
        }
    };

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

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    return (
        <AuthenticatedLayout>
            <Head title={`Questions - ${test.title}`} />

            {/* Workspace Context Header */}
            <div className="bg-surface border-b border-outline-variant px-gutter py-3 flex items-center justify-between shrink-0 -m-container-padding mb-0">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('tests.show', test.id)}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container text-on-surface-variant transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-headline-md font-semibold text-on-surface">{test.title}</h2>
                            <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps border border-outline-variant capitalize">
                                {test.status}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-secondary-container text-primary font-label-caps text-label-caps">
                                {questions.length} Questions
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-on-surface-variant mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">cloud_done</span>
                            <span className="font-body-sm text-[12px]">Saved just now</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded border border-outline-variant text-on-surface font-body-sm hover:bg-surface-container transition-colors">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                        Preview
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container transition-colors">
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                    </button>
                </div>
            </div>

            {/* 3-Column Workspace */}
            <div className="flex-1 flex overflow-hidden bg-surface-container-low -mx-container-padding mt-4" style={{ height: 'calc(100vh - 250px)' }}>
                {/* Column 1: Question Navigation (Left) */}
                <aside className="w-[280px] bg-surface border-r border-outline-variant flex flex-col shrink-0">
                    <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-bright">
                        <h3 className="font-title-sm text-title-sm text-on-surface">Questions</h3>
                        <Link
                            href={route('tests.questions.create', test.id)}
                            className="flex items-center gap-1 text-primary hover:text-primary-fixed-dim transition-colors font-body-sm font-medium"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span> Add
                        </Link>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {questions.length === 0 ? (
                            <div className="p-4 text-center text-on-surface-variant font-body-sm">
                                No questions yet. Click "Add" to create one.
                            </div>
                        ) : (
                            questions.map((question, index) => (
                                <div
                                    key={question.id}
                                    onClick={() => {
                                        setSelectedQuestionId(question.id);
                                        setQuestionType(question.type as 'multiple_choice' | 'essay');
                                    }}
                                    className={`group flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                        selectedQuestionId === question.id
                                            ? 'bg-surface-container border border-primary'
                                            : 'hover:bg-surface-container border border-transparent'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-outline cursor-grab hover:text-on-surface text-[18px] opacity-0 group-hover:opacity-100 transition-opacity">
                                        drag_indicator
                                    </span>
                                    <span className="font-mono-label text-mono-label text-on-surface-variant w-5">
                                        {index + 1}.
                                    </span>
                                    <div className="flex-1 flex items-center gap-2 truncate">
                                        <span className={`material-symbols-outlined text-[16px] ${
                                            question.type === 'multiple_choice' ? 'text-primary' : 'text-on-surface-variant'
                                        }`}>
                                            {question.type === 'multiple_choice' ? 'radio_button_checked' : 'subject'}
                                        </span>
                                        <span className={`font-body-sm text-body-sm truncate ${
                                            selectedQuestionId === question.id ? 'text-on-surface font-medium' : 'text-on-surface-variant'
                                        }`}>
                                            {question.question.length > 30
                                                ? question.question.substring(0, 30) + '...'
                                                : question.question}
                                        </span>
                                    </div>
                                    <span className={`material-symbols-outlined text-[16px] ${
                                        selectedQuestionId === question.id ? 'text-primary' : 'text-outline'
                                    }`} title="Complete">
                                        check_circle
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Column 2: Active Editor (Center) */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex justify-center">
                    {selectedQuestion ? (
                        <div className="w-full max-w-[800px] flex flex-col gap-6">
                            {/* Editor Card */}
                            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
                                {/* Card Header */}
                                <div className="px-6 py-4 border-b border-outline-variant flex flex-wrap items-center justify-between gap-4 bg-surface-bright">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-title-sm text-[18px] font-semibold text-on-surface">
                                            Question {questions.findIndex((q) => q.id === selectedQuestionId) + 1}
                                        </h3>
                                        <span className="px-2 py-1 rounded-md bg-secondary-container text-on-secondary-container font-label-caps text-[11px] flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">
                                                {selectedQuestion.type === 'multiple_choice' ? 'radio_button_checked' : 'subject'}
                                            </span>
                                            {selectedQuestion.type === 'multiple_choice' ? 'MULTIPLE CHOICE' : 'ESSAY'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-on-surface-variant">
                                        <button className="p-1.5 rounded hover:bg-surface-container transition-colors" title="Duplicate">
                                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selectedQuestion)}
                                            className="p-1.5 rounded hover:bg-error-container hover:text-error transition-colors"
                                            title="Delete"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
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
                                            value={selectedQuestion.question}
                                            readOnly
                                        />
                                    </div>

                                    {/* Answers Section - Only for MCQ */}
                                    {selectedQuestion.type === 'multiple_choice' && selectedQuestion.options && (
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
                                                {selectedQuestion.options.map((option) => (
                                                    <div
                                                        key={option.id}
                                                        className={`group flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                                                            option.is_correct
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
                                                                name={`question_${selectedQuestion.id}`}
                                                                checked={option.is_correct}
                                                                readOnly
                                                                className="w-5 h-5 text-primary border-outline-variant focus:ring-primary cursor-pointer"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className="font-body-md text-on-surface">
                                                                {option.text}
                                                            </span>
                                                        </div>
                                                        {option.is_correct && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2 py-0.5 bg-primary text-on-primary font-label-caps text-[10px] rounded-full">
                                                                    CORRECT
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Essay indicator */}
                                    {selectedQuestion.type === 'essay' && (
                                        <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                                            <div className="flex items-center gap-2 text-on-surface-variant">
                                                <span className="material-symbols-outlined">subject</span>
                                                <span className="font-body-sm">This is an essay question. Participants will type their answer in a text area.</span>
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
                                                value={selectedQuestion.points}
                                                readOnly
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-body-sm font-medium text-on-surface mb-2">
                                                Question Type
                                            </label>
                                            <div className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 font-body-md text-on-surface capitalize">
                                                {selectedQuestion.type === 'multiple_choice' ? 'Multiple Choice' : 'Essay'}
                                            </div>
                                        </div>
                                    </div>

                                    {selectedQuestion.explanation && (
                                        <div>
                                            <label className="block font-body-sm font-medium text-on-surface mb-2">
                                                Explanation
                                            </label>
                                            <div className="w-full bg-surface-bright border border-outline-variant rounded-lg p-3 font-body-sm text-on-surface">
                                                {selectedQuestion.explanation}
                                            </div>
                                            <p className="text-[12px] text-on-surface-variant mt-1">
                                                Shown to students after test completion if enabled in settings.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Edit Button */}
                            <div className="flex justify-center">
                                <Link
                                    href={route('tests.questions.edit', [test.id, selectedQuestion.id])}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary font-body-sm text-body-sm rounded-lg hover:bg-primary transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                    Edit Question
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                            <span className="material-symbols-outlined text-[48px] mb-4">quiz</span>
                            <p className="font-body-md">Select a question to view or edit</p>
                            <Link
                                href={route('tests.questions.create', test.id)}
                                className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary font-body-sm text-body-sm rounded-lg hover:bg-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Add Question
                            </Link>
                        </div>
                    )}
                </main>

                {/* Column 3: Question Bank (Right) */}
                <aside className="w-[320px] bg-surface border-l border-outline-variant flex flex-col shrink-0">
                    <div className="p-4 border-b border-outline-variant bg-surface-bright">
                        <h3 className="font-title-sm text-title-sm text-on-surface mb-3">Question Bank</h3>
                        <div className="relative mb-3">
                            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                search
                            </span>
                            <input
                                className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                placeholder="Search questions..."
                                type="text"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            <button className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface font-body-sm text-[12px] whitespace-nowrap border border-outline-variant">
                                All
                            </button>
                            <button className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-body-sm text-[12px] whitespace-nowrap hover:bg-surface-container-high transition-colors">
                                MCQ
                            </button>
                            <button className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-body-sm text-[12px] whitespace-nowrap hover:bg-surface-container-high transition-colors">
                                Essay
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-surface-container-low">
                        {questions.length === 0 ? (
                            <div className="text-center text-on-surface-variant font-body-sm py-8">
                                No questions in bank yet.
                            </div>
                        ) : (
                            questions.map((question) => (
                                <div
                                    key={question.id}
                                    onClick={() => {
                                        setSelectedQuestionId(question.id);
                                        setQuestionType(question.type as 'multiple_choice' | 'essay');
                                    }}
                                    className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant hover:border-primary/50 transition-colors group cursor-pointer shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <p className="font-body-sm text-on-surface line-clamp-2 leading-tight">
                                            {question.question}
                                        </p>
                                        <button className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors shrink-0">
                                            <span className="material-symbols-outlined text-[16px]">add</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-1.5 py-0.5 rounded font-label-caps text-[10px] ${
                                            question.type === 'multiple_choice'
                                                ? 'bg-secondary-container text-on-secondary-container'
                                                : 'bg-surface-container text-on-surface-variant'
                                        }`}>
                                            {question.type === 'multiple_choice' ? 'MCQ' : 'ESSAY'}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-caps text-[10px]">
                                            {question.points} PTS
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </div>

            {/* Sticky Footer */}
            <div className="bg-surface border-t border-outline-variant px-gutter py-3 flex items-center justify-between shrink-0 -mx-container-padding mt-4">
                <div className="flex items-center gap-6 text-on-surface-variant font-body-sm">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
                        <span className="font-medium text-on-surface">{questions.length}</span> Questions
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                        <span className="font-medium text-on-surface">{totalPoints}</span> Total Points
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 rounded border border-transparent text-on-surface font-title-sm text-[14px] hover:bg-surface-container transition-colors">
                        Save Draft
                    </button>
                    <Link
                        href={route('tests.show', test.id)}
                        className="px-6 py-2 rounded bg-primary-container text-on-primary-container font-title-sm text-[14px] shadow-sm hover:bg-primary transition-colors flex items-center gap-2"
                    >
                        Done <span className="material-symbols-outlined text-[18px]">check</span>
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
