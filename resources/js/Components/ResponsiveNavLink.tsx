import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-primary bg-primary-fixed/40 text-primary focus:border-primary focus:bg-primary-fixed/60 focus:text-primary'
                    : 'border-transparent text-on-surface-variant hover:border-outline-variant hover:bg-surface-container hover:text-on-surface focus:border-outline-variant focus:bg-surface-container focus:text-on-surface'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
