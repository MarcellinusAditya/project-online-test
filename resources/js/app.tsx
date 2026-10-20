import '../css/app.css';
import './bootstrap';

import { createInertiaApp, usePage } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

type Theme = 'light' | 'dark' | 'system';

function applyTheme(theme: Theme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = theme === 'dark' || (theme === 'system' && prefersDark);

    document.documentElement.classList.toggle('dark', shouldUseDark);
}

/**
 * Keeps <html class="dark"> in sync with the saved theme after Inertia
 * navigations (the inline script in app.blade.php only covers first paint).
 */
function ThemeSync() {
    const theme = ((usePage().props as { theme?: Theme }).theme ?? 'system') as Theme;

    useEffect(() => {
        applyTheme(theme);

        if (theme !== 'system') {
            return;
        }

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => applyTheme('system');

        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [theme]);

    return null;
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <ThemeSync />
                <App {...props} />
            </>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
