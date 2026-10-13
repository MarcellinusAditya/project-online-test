import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

interface Bank {
    id: number;
    name: string;
    description: string | null;
}

export default function BankEdit({ bank }: { bank: Bank }) {
    const { data, setData, put, processing, errors } = useForm({
        name: bank.name,
        description: bank.description ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('question-banks.update', bank.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-2">
                        <Link href={route('question-banks.index')} className="hover:text-primary">
                            Question Banks
                        </Link>
                        <span>/</span>
                        <Link href={route('question-banks.show', bank.id)} className="hover:text-primary">
                            {bank.name}
                        </Link>
                        <span>/</span>
                        <span>Edit</span>
                    </div>
                    <h2 className="text-headline-md md:text-display-lg text-on-surface">Edit Question Bank</h2>
                </div>
            }
        >
            <Head title={`Edit - ${bank.name}`} />

            <div className="max-w-2xl">
                <form
                    onSubmit={submit}
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-5"
                >
                    <div>
                        <label className="block font-body-sm font-medium text-on-surface mb-2">Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block font-body-sm font-medium text-on-surface mb-2">
                            Description <span className="text-on-surface-variant font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                        {errors.description && <p className="mt-1 text-sm text-error">{errors.description}</p>}
                    </div>
                    <div className="flex justify-end gap-3">
                        <Link
                            href={route('question-banks.show', bank.id)}
                            className="px-4 py-2 rounded-lg border border-outline-variant text-body-sm font-medium hover:bg-surface-container transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 rounded-lg bg-primary-container text-on-primary text-body-sm font-semibold hover:bg-primary transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
