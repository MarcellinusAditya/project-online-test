import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';

interface SettingsProps {
    settings: {
        default_duration_minutes: number;
        default_passing_score: number;
        default_show_result: boolean;
        auto_publish: boolean;
        theme: 'light' | 'dark' | 'system';
        notify_new_attempt: boolean;
        notify_daily_summary: boolean;
        notify_weekly_report: boolean;
        webhook_url: string | null;
    };
    profile: {
        name: string;
        email: string;
        avatar_url: string | null;
    };
    themes: string[];
}

const tabs = [
    { key: 'profile', label: 'Profile', icon: 'person' },
    { key: 'defaults', label: 'Test Defaults', icon: 'tune' },
    { key: 'appearance', label: 'Appearance', icon: 'palette' },
    { key: 'notifications', label: 'Notifications', icon: 'notifications' },
    { key: 'integrations', label: 'Integrations', icon: 'webhook' },
    { key: 'danger', label: 'Danger Zone', icon: 'warning' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

function SectionCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-title-sm text-on-surface font-semibold mb-1">{title}</h3>
            <p className="text-body-sm text-on-surface-variant mb-5">{description}</p>
            {children}
        </div>
    );
}

function Toggle({
    id,
    label,
    description,
    checked,
    onChange,
}: {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <label htmlFor={id} className="flex items-start justify-between gap-4 py-3 cursor-pointer">
            <span className="min-w-0">
                <span className="block text-body-sm font-medium text-on-surface">{label}</span>
                <span className="block text-xs text-on-surface-variant mt-0.5">{description}</span>
            </span>
            <button
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    checked ? 'bg-primary-container' : 'bg-surface-container-highest border border-outline-variant'
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </label>
    );
}

const inputClass =
    'w-full rounded-lg bg-surface border border-outline-variant px-3 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all';

export default function SettingsIndex({ settings, profile, themes }: SettingsProps) {
    const [tab, setTab] = useState<TabKey>('profile');

    const profileForm = useForm({
        name: profile.name,
        email: profile.email,
        avatar: null as File | null,
    });

    const defaultsForm = useForm({
        default_duration_minutes: settings.default_duration_minutes,
        default_passing_score: settings.default_passing_score,
        default_show_result: settings.default_show_result,
        auto_publish: settings.auto_publish,
    });

    const appearanceForm = useForm({ theme: settings.theme });

    const notificationsForm = useForm({
        notify_new_attempt: settings.notify_new_attempt,
        notify_daily_summary: settings.notify_daily_summary,
        notify_weekly_report: settings.notify_weekly_report,
    });

    const integrationsForm = useForm({ webhook_url: settings.webhook_url ?? '' });

    const dangerForm = useForm({ password: '' });
    const avatarInput = useRef<HTMLInputElement | null>(null);

    const submitProfile = (e: FormEvent) => {
        e.preventDefault();
        profileForm.post(route('settings.profile'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                profileForm.reset('avatar');
                if (avatarInput.current) avatarInput.current.value = '';
            },
        });
    };

    const onAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        profileForm.setData('avatar', e.target.files?.[0] ?? null);
    };

    const submitDefaults = (e: FormEvent) => {
        e.preventDefault();
        defaultsForm.patch(route('settings.test-defaults'), { preserveScroll: true });
    };

    const submitAppearance = (e: FormEvent) => {
        e.preventDefault();
        appearanceForm.patch(route('settings.appearance'), {
            preserveScroll: true,
            onSuccess: () => {
                const theme = appearanceForm.data.theme;
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && prefersDark));
            },
        });
    };

    const submitNotifications = (e: FormEvent) => {
        e.preventDefault();
        notificationsForm.patch(route('settings.notifications'), { preserveScroll: true });
    };

    const submitIntegrations = (e: FormEvent) => {
        e.preventDefault();
        integrationsForm.patch(route('settings.integrations'), { preserveScroll: true });
    };

    const submitDanger = (e: FormEvent) => {
        e.preventDefault();
        if (confirm('Delete your account permanently? All tests, questions, and results will be removed.')) {
            dangerForm.delete(route('settings.account.destroy'));
        }
    };

    const removeAvatar = () => {
        if (confirm('Remove your avatar?')) {
            router.delete(route('settings.avatar.destroy'), { preserveScroll: true });
        }
    };

    const saveButton = (processing: boolean, label = 'Save changes') => (
        <button
            type="submit"
            disabled={processing}
            className="inline-flex items-center gap-2 bg-primary-container text-on-primary font-body-sm px-4 py-2 rounded-lg hover:bg-primary transition-colors disabled:opacity-50"
        >
            {processing ? 'Saving...' : label}
        </button>
    );

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-headline-md md:text-display-lg text-on-surface mb-1 md:mb-2">Settings</h2>
                    <p className="text-body-sm md:text-body-md text-on-surface-variant max-w-2xl">
                        Manage your profile, defaults for new tests, appearance, and integrations.
                    </p>
                </div>
            }
        >
            <Head title="Settings" />

            <div className="flex gap-1 mb-6 overflow-x-auto pb-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-1.5 shadow-sm">
                {tabs.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setTab(item.key)}
                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-body-sm whitespace-nowrap transition-colors ${
                            tab === item.key
                                ? 'bg-primary-container text-on-primary font-medium shadow-sm'
                                : item.key === 'danger'
                                  ? 'text-error hover:bg-error-container/20'
                                  : 'text-on-surface-variant hover:bg-surface-container'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {item.key === 'danger' ? 'warning' : item.icon}
                        </span>
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {tab === 'profile' && (
                    <SectionCard title="Profile" description="Your name, email address, and avatar. Changing email requires re-verification.">
                        <form onSubmit={submitProfile} className="space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xl font-semibold overflow-hidden shrink-0">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        profile.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 min-w-0">
                                    <input
                                        ref={avatarInput}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={onAvatarChange}
                                        className="block w-full text-body-sm text-on-surface-variant file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-body-sm file:bg-surface-container file:text-on-surface hover:file:bg-surface-container-high"
                                    />
                                    <p className="text-xs text-on-surface-variant">JPG, PNG, or WebP. Max 1 MB.</p>
                                    {settings && profile.avatar_url && (
                                        <button
                                            type="button"
                                            onClick={removeAvatar}
                                            className="self-start text-xs text-error hover:underline"
                                        >
                                            Remove avatar
                                        </button>
                                    )}
                                    {profileForm.errors.avatar && (
                                        <p className="text-xs text-error">{profileForm.errors.avatar}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="name" className="block text-xs font-semibold text-on-surface mb-1">
                                    Name
                                </label>
                                <input
                                    id="name"
                                    value={profileForm.data.name}
                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                {profileForm.errors.name && <p className="text-xs text-error mt-1">{profileForm.errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold text-on-surface mb-1">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={profileForm.data.email}
                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                {profileForm.errors.email && <p className="text-xs text-error mt-1">{profileForm.errors.email}</p>}
                            </div>

                            {saveButton(profileForm.processing)}
                        </form>
                    </SectionCard>
                )}

                {tab === 'defaults' && (
                    <SectionCard
                        title="Test Defaults"
                        description="Pre-filled values when you create a new test. You can still override them per test."
                    >
                        <form onSubmit={submitDefaults} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="default_duration_minutes" className="block text-xs font-semibold text-on-surface mb-1">
                                        Default duration (minutes)
                                    </label>
                                    <input
                                        id="default_duration_minutes"
                                        type="number"
                                        min={1}
                                        max={480}
                                        value={defaultsForm.data.default_duration_minutes}
                                        onChange={(e) => defaultsForm.setData('default_duration_minutes', parseInt(e.target.value) || 0)}
                                        className={inputClass}
                                    />
                                    {defaultsForm.errors.default_duration_minutes && (
                                        <p className="text-xs text-error mt-1">{defaultsForm.errors.default_duration_minutes}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="default_passing_score" className="block text-xs font-semibold text-on-surface mb-1">
                                        Default passing score (%)
                                    </label>
                                    <input
                                        id="default_passing_score"
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={defaultsForm.data.default_passing_score}
                                        onChange={(e) => defaultsForm.setData('default_passing_score', parseInt(e.target.value) || 0)}
                                        className={inputClass}
                                    />
                                    {defaultsForm.errors.default_passing_score && (
                                        <p className="text-xs text-error mt-1">{defaultsForm.errors.default_passing_score}</p>
                                    )}
                                </div>
                            </div>

                            <div className="divide-y divide-outline-variant/50">
                                <Toggle
                                    id="default_show_result"
                                    label="Show results immediately"
                                    description="Participants see their score right after submitting."
                                    checked={defaultsForm.data.default_show_result}
                                    onChange={(v) => defaultsForm.setData('default_show_result', v)}
                                />
                                <Toggle
                                    id="auto_publish"
                                    label="Auto-publish new tests"
                                    description="New tests are published immediately instead of saved as drafts."
                                    checked={defaultsForm.data.auto_publish}
                                    onChange={(v) => defaultsForm.setData('auto_publish', v)}
                                />
                            </div>

                            {saveButton(defaultsForm.processing)}
                        </form>
                    </SectionCard>
                )}

                {tab === 'appearance' && (
                    <SectionCard title="Appearance" description="Choose how TestPro looks on this account.">
                        <form onSubmit={submitAppearance} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {themes.map((theme) => (
                                    <button
                                        key={theme}
                                        type="button"
                                        onClick={() => appearanceForm.setData('theme', theme as 'light' | 'dark' | 'system')}
                                        className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors ${
                                            appearanceForm.data.theme === theme
                                                ? 'border-primary bg-primary-fixed/40'
                                                : 'border-outline-variant hover:bg-surface-container-low'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-primary">
                                            {theme === 'light' ? 'light_mode' : theme === 'dark' ? 'dark_mode' : 'brightness_auto'}
                                        </span>
                                        <span className="text-body-sm font-medium text-on-surface capitalize">{theme}</span>
                                        <span className="text-xs text-on-surface-variant">
                                            {theme === 'light'
                                                ? 'Always light'
                                                : theme === 'dark'
                                                  ? 'Always dark'
                                                  : 'Follow device setting'}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {appearanceForm.errors.theme && <p className="text-xs text-error">{appearanceForm.errors.theme}</p>}

                            {saveButton(appearanceForm.processing)}
                        </form>
                    </SectionCard>
                )}

                {tab === 'notifications' && (
                    <SectionCard title="Notifications" description="Email preferences. Scheduled summaries require the scheduler to be running.">
                        <form onSubmit={submitNotifications} className="space-y-5">
                            <div className="divide-y divide-outline-variant/50">
                                <Toggle
                                    id="notify_new_attempt"
                                    label="New participant"
                                    description="Email me when someone starts one of my tests."
                                    checked={notificationsForm.data.notify_new_attempt}
                                    onChange={(v) => notificationsForm.setData('notify_new_attempt', v)}
                                />
                                <Toggle
                                    id="notify_daily_summary"
                                    label="Daily summary"
                                    description="A daily recap of participants and scores."
                                    checked={notificationsForm.data.notify_daily_summary}
                                    onChange={(v) => notificationsForm.setData('notify_daily_summary', v)}
                                />
                                <Toggle
                                    id="notify_weekly_report"
                                    label="Weekly report"
                                    description="A weekly performance report across your tests."
                                    checked={notificationsForm.data.notify_weekly_report}
                                    onChange={(v) => notificationsForm.setData('notify_weekly_report', v)}
                                />
                            </div>

                            {saveButton(notificationsForm.processing)}
                        </form>
                    </SectionCard>
                )}

                {tab === 'integrations' && (
                    <SectionCard
                        title="Integrations"
                        description="Send graded submissions to your own endpoint as JSON. Useful for LMS or data warehouse sync."
                    >
                        <form onSubmit={submitIntegrations} className="space-y-5">
                            <div>
                                <label htmlFor="webhook_url" className="block text-xs font-semibold text-on-surface mb-1">
                                    Webhook URL
                                </label>
                                <input
                                    id="webhook_url"
                                    type="url"
                                    placeholder="https://example.com/hooks/testpro"
                                    value={integrationsForm.data.webhook_url}
                                    onChange={(e) => integrationsForm.setData('webhook_url', e.target.value)}
                                    className={inputClass}
                                />
                                <p className="text-xs text-on-surface-variant mt-1">
                                    Requests include an <code className="font-mono">X-TestPro-Signature</code> HMAC-SHA256 header.
                                    Leave empty to disable. Requires a running queue worker.
                                </p>
                                {integrationsForm.errors.webhook_url && (
                                    <p className="text-xs text-error mt-1">{integrationsForm.errors.webhook_url}</p>
                                )}
                            </div>

                            {saveButton(integrationsForm.processing)}
                        </form>
                    </SectionCard>
                )}

                {tab === 'danger' && (
                    <SectionCard title="Danger Zone" description="Permanent actions. These cannot be undone.">
                        <form onSubmit={submitDanger} className="space-y-4">
                            <div className="rounded-lg border border-error/30 bg-error-container/20 p-4">
                                <p className="text-body-sm font-medium text-on-surface mb-1">Delete account</p>
                                <p className="text-xs text-on-surface-variant mb-4">
                                    This removes your account, tests, questions, and all collected results.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                                    <div className="flex-1">
                                        <label htmlFor="password" className="block text-xs font-semibold text-on-surface mb-1">
                                            Confirm password
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            value={dangerForm.data.password}
                                            onChange={(e) => dangerForm.setData('password', e.target.value)}
                                            className={inputClass}
                                            autoComplete="current-password"
                                        />
                                        {dangerForm.errors.password && (
                                            <p className="text-xs text-error mt-1">{dangerForm.errors.password}</p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={dangerForm.processing}
                                        className="inline-flex items-center justify-center gap-2 bg-error text-on-error font-body-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                                        Delete account
                                    </button>
                                </div>
                            </div>
                        </form>
                    </SectionCard>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
