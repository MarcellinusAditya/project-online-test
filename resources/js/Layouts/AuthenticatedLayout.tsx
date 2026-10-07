import Sidebar from '@/Components/Sidebar';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />

            <header className="fixed top-0 right-0 left-sidebar-width z-30 h-16 flex justify-between items-center px-gutter bg-surface/80 backdrop-blur-md border-b border-outline-variant">
                <div className="flex-grow" />
                <div className="flex items-center gap-4">
                    <Link
                        href={route('tests.create')}
                        className="bg-primary-container text-on-primary font-body-sm text-body-sm px-4 py-2 rounded-lg hover:bg-primary transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Create New Test
                    </Link>
                    <div className="w-px h-6 bg-outline-variant mx-1" />
                    <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-high relative">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-high">
                        <span className="material-symbols-outlined">help_outline</span>
                    </button>
                    <div className="relative ml-2">
                        <Link href={route('profile.edit')} className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="ml-sidebar-width pt-16 p-container-padding min-h-screen">
                {header && (
                    <div className="mb-8">
                        {header}
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
