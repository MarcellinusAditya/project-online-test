import Sidebar from '@/Components/Sidebar';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            <header className="fixed top-0 right-0 left-0 md:left-sidebar-width z-30 h-16 flex justify-between items-center px-4 md:px-gutter bg-surface/80 backdrop-blur-md border-b border-outline-variant">
                {/* Mobile hamburger + Logo */}
                <div className="flex items-center gap-3 md:hidden">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="text-on-surface-variant hover:text-on-surface p-2 rounded-lg hover:bg-surface-container"
                        aria-label="Open menu"
                    >
                        <span className="material-symbols-outlined text-2xl">menu</span>
                    </button>
                    <Link href={route('dashboard')} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-base">analytics</span>
                        </div>
                        <span className="font-bold text-title-sm text-primary">TestPro</span>
                    </Link>
                </div>

                <div className="hidden md:block flex-grow" />

                <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                    <Link
                        href={route('tests.create')}
                        className="bg-primary-container text-on-primary font-body-sm text-body-sm px-3 sm:px-4 py-2 rounded-lg hover:bg-primary transition-colors flex items-center gap-1 sm:gap-2 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        <span className="hidden sm:inline">Create New Test</span>
                        <span className="sm:hidden">New Test</span>
                    </Link>
                    <div className="hidden sm:block w-px h-6 bg-outline-variant mx-1" />
                    <button className="hidden sm:flex text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-high relative">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="hidden sm:flex text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-high">
                        <span className="material-symbols-outlined">help_outline</span>
                    </button>
                    <div className="relative ml-1 sm:ml-2">
                        <Link href={route('profile.edit')} className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-sm font-medium overflow-hidden">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user.name.charAt(0).toUpperCase()
                                )}
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="ml-0 md:ml-sidebar-width pt-20 md:pt-24 px-4 sm:px-6 md:px-container-padding pb-12 min-h-screen">
                {header && (
                    <div className="mb-6 md:mb-8">
                        {header}
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
