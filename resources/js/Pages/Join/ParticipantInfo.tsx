import { Head, useForm } from '@inertiajs/react';

interface ParticipantInfoProps {
    test: {
        id: number;
        title: string;
        description: string | null;
        duration_minutes: number;
        questions_count: number;
        token: string;
    };
}

export default function ParticipantInfo({ test }: ParticipantInfoProps) {
    const { data, setData, post, processing, errors } = useForm({
        token: test.token,
        participant_name: '',
        participant_identifier: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('join.store'));
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Head title={`Join - ${test.title}`} />

            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-on-primary text-3xl">quiz</span>
                    </div>
                    <h1 className="text-headline-md font-bold text-on-surface">{test.title}</h1>
                    {test.description && (
                        <p className="text-body-md text-on-surface-variant mt-1">{test.description}</p>
                    )}
                </div>

                {/* Test Info Card */}
                <div className="bg-surface-container-low rounded-xl border border-outline-variant p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">help_outline</span>
                            <div>
                                <p className="text-body-sm text-on-surface-variant">Questions</p>
                                <p className="text-title-sm font-semibold text-on-surface">{test.questions_count}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">timer</span>
                            <div>
                                <p className="text-body-sm text-on-surface-variant">Duration</p>
                                <p className="text-title-sm font-semibold text-on-surface">{test.duration_minutes} minutes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Participant Info Card */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-6">
                    <h2 className="font-title-sm text-title-sm font-semibold text-on-surface mb-4">Your Information</h2>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block font-body-sm font-medium text-on-surface mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={data.participant_name}
                                onChange={(e) => setData('participant_name', e.target.value)}
                                className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
                                placeholder="Enter your full name"
                                required
                            />
                            {errors.participant_name && (
                                <p className="mt-1 text-sm text-error">{errors.participant_name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block font-body-sm font-medium text-on-surface mb-2">
                                Student ID / Identifier (Optional)
                            </label>
                            <input
                                type="text"
                                value={data.participant_identifier}
                                onChange={(e) => setData('participant_identifier', e.target.value)}
                                className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
                                placeholder="e.g., NIM, Employee ID"
                            />
                            {errors.participant_identifier && (
                                <p className="mt-1 text-sm text-error">{errors.participant_identifier}</p>
                            )}
                        </div>

                        {/* Rules */}
                        <div className="bg-surface-container-low rounded-lg p-4 mt-4">
                            <h3 className="font-title-sm text-title-sm font-semibold text-on-surface mb-2">Test Rules</h3>
                            <ul className="space-y-2 text-body-sm text-on-surface-variant">
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-[18px] mt-0.5">check_circle</span>
                                    <span>The test will start immediately after you click "Start Test"</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-[18px] mt-0.5">check_circle</span>
                                    <span>You have {test.duration_minutes} minutes to complete the test</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-[18px] mt-0.5">check_circle</span>
                                    <span>The test will auto-submit when time runs out</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-[18px] mt-0.5">warning</span>
                                    <span>Do not switch tabs or exit fullscreen during the test</span>
                                </li>
                            </ul>
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !data.participant_name}
                            className="w-full bg-primary-container text-on-primary font-title-sm text-title-sm px-6 py-3 rounded-lg hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {processing ? 'Starting...' : 'Start Test'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
