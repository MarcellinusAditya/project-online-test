import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

type Theme = 'light' | 'dark' | 'system';

let currentTheme: Theme = 'system';

function applyTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = currentTheme === 'dark' || (currentTheme === 'system' && prefersDark);

    document.documentElement.classList.toggle('dark', shouldUseDark);
}

function syncTheme(props: unknown) {
    const theme = (props as { theme?: Theme } | undefined)?.theme;

    if (theme === 'light' || theme === 'dark' || theme === 'system') {
        currentTheme = theme;
    }

    applyTheme();
}

/**
 * Theme is applied outside React on purpose: calling usePage() before the
 * Inertia <App> provider mounts throws "usePage must be used within an
 * Inertia component" and blanks the whole app.
 */
function initThemeSync(initialProps: unknown) {
    syncTheme(initialProps);

    router.on('navigate', (event) => {
        syncTheme(event.detail.page.props);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (currentTheme === 'system') {
            applyTheme();
        }
    });
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        initThemeSync(props.initialPage.props);

        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
