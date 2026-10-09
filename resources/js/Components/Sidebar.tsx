import { Link, usePage } from '@inertiajs/react';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const navigation = [
    { name: 'Dashboard', href: 'dashboard', icon: 'dashboard' },
    { name: 'Tests', href: 'tests.index', icon: 'quiz' },
    { name: 'Question Bank', href: '#', icon: 'database' },
    { name: 'AI Generator', href: 'ai-generator.index', icon: 'psychology' },
    { name: 'Results', href: '#', icon: 'analytics' },
    { name: 'Settings', href: '#', icon: 'settings' },
];

const bottomNavigation = [
    { name: 'Help Center', href: '#', icon: 'help' },
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const { url } = usePage();

    const isActive = (href: string) => {
        if (href === 'dashboard') {
            return url === '/dashboard';
        }
        if (href === 'tests.index') {
            return url.startsWith('/tests');
        }
        if (href === 'ai-generator.index') {
            return url.startsWith('/ai-generator');
        }
        return false;
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-surface border-r border-outline-variant w-sidebar-width">
            <div className="p-gutter border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-lg">analytics</span>
                    </div>
                    <div>
                        <h1 className="text-headline-md font-bold text-primary leading-none">TestPro</h1>
                        <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Admin Console</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="md:hidden text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
                        aria-label="Close menu"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                )}
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto text-body-sm">
                {navigation.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href === '#' ? '#' : route(item.href)}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                active
                                    ? 'bg-secondary-container text-primary border-l-2 border-primary scale-98'
                                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                            }`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className={active ? 'font-medium' : ''}>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 mt-auto border-t border-outline-variant/30 text-body-sm">
                {bottomNavigation.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span>{item.name}</span>
                    </Link>
                ))}
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-error-container/30 hover:text-error rounded-lg transition-colors w-full"
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span>Log Out</span>
                </Link>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop fixed sidebar */}
            <aside className="fixed left-0 top-0 h-screen z-40 hidden md:block">
                {sidebarContent}
            </aside>

            {/* Mobile drawer with backdrop */}
            {isOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={onClose}
                    />
                    <div className="relative z-10 w-sidebar-width max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
}
