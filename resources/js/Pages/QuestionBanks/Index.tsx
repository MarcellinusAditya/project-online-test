import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface Bank {
    id: number;
    name: string;
    description: string | null;
    questions_count: number;
    updated_at: string;
}

interface PaginatedBanks {
    data: Bank[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface IndexProps {
    banks: PaginatedBanks;
    filters: { search?: string | null };
}

export default function BanksIndex({ banks, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            router.get(route('question-banks.index'), { search: value }, { preserveState: true, replace: true });
        }, 400);
    };

    useEffect(() => {
        return () => {
            if (searchTimer.current) clearTimeout(searchTimer.current);
        };
    }, []);

    const handleDelete = (bank: Bank) => {
        if (
            confirm(
                `Delete bank "${bank.name}"? Its ${bank.questions_count} question(s) will be deleted too. Questions already used in tests are kept as copies.`
            )
        ) {
            router.delete(route('question-banks.destroy', bank.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h2 className="text-headline-md md:text-display-lg text-on-surface mb-1 md:mb-2">
                            Question Banks
                        </h2>
                        <p className="text-body-sm md:text-body-md text-on-surface-variant max-w-2xl">
                            Reusable collections of questions. Add any bank question to a test as a copy.
                        </p>
                    </div>
                    <Link
                        href={route('question-banks.create')}
                        className="inline-flex items-center gap-2 bg-primary-container text-on-primary font-body-sm text-body-sm px-4 py-2 rounded-lg hover:bg-primary transition-colors shrink-0"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        New Bank
                    </Link>
                </div>
            }
        >
            <Head title="Question Banks" />

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-6 shadow-sm">
                <div className="relative w-full md:w-80">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                        search
                    </span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search banks by name..."
                        className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder-on-surface-variant/60"
                    />
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/60 text-label-caps text-on-surface-variant uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Bank</th>
                                <th className="px-6 py-4 font-semibold">Questions</th>
                                <th className="px-6 py-4 font-semibold">Updated</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-body-sm divide-y divide-outline-variant/40">
                            {banks.data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">
                                        <p className="mb-2">No question banks found.</p>
                                        <Link href={route('question-banks.create')} className="text-primary hover:underline">
                                            Create your first bank
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                banks.data.map((bank) => (
                                    <tr key={bank.id} className="hover:bg-surface-container-low/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 w-8 h-8 rounded-md bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-[18px]">database</span>
                                                </div>
                                                <div>
                                                    <Link
                                                        href={route('question-banks.show', bank.id)}
                                                        className="font-medium text-on-surface hover:text-primary transition-colors"
                                                    >
                                                        {bank.name}
                                                    </Link>
                                                    {bank.description && (
                                                        <div className="text-on-surface-variant text-[13px] mt-0.5 line-clamp-1">
                                                            {bank.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">
                                            {bank.questions_count} question{bank.questions_count === 1 ? '' : 's'}
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">
                                            {new Date(bank.updated_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={route('question-banks.show', bank.id)}
                                                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md transition-colors"
                                                    title="View"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </Link>
                                                <Link
                                                    href={route('question-banks.edit', bank.id)}
                                                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md transition-colors"
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(bank)}
                                                    className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-md transition-colors"
                                                    title="Delete"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {banks.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-outline-variant/40 bg-surface flex items-center justify-between">
                        <p className="text-body-sm text-on-surface-variant">
                            Page <span className="font-medium text-on-surface">{banks.current_page}</span> of{' '}
                            <span className="font-medium text-on-surface">{banks.last_page}</span> ({banks.total} total)
                        </p>
                        <div className="flex gap-2">
                            {banks.current_page > 1 && (
                                <Link
                                    href={route('question-banks.index', { page: banks.current_page - 1, search })}
                                    className="px-3 py-1.5 text-sm font-medium text-on-surface-variant bg-surface border border-outline-variant rounded-md hover:bg-surface-container transition-colors"
                                >
                                    Previous
                                </Link>
                            )}
                            {banks.current_page < banks.last_page && (
                                <Link
                                    href={route('question-banks.index', { page: banks.current_page + 1, search })}
                                    className="px-3 py-1.5 text-sm font-medium text-on-surface-variant bg-surface border border-outline-variant rounded-md hover:bg-surface-container transition-colors"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
