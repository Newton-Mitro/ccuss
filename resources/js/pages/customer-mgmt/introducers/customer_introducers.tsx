import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Head, useForm } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { CustomerIntroducer } from '../../../types/customer';

import { ModalMode } from '../../../types/base_types';
import { CustomerSearchBox } from '../customers/customer-search-box';
import { useCustomerIntroducers } from './hooks/useCustomerIntroducers';
import IntroducerModal from './introducer_modal';
import { confirmDelete } from './utils/confirmDelete';

/* =========================================================
 * Component
 * =======================================================*/
export default function CustomerIntroducers() {
    /* ----------------------------- Form ----------------------------- */
    const { data, setData } = useForm<CustomerIntroducer | null>(null);

    /* ----------------------------- State ----------------------------- */
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [selectedIntroducer, setSelectedIntroducer] =
        useState<CustomerIntroducer | null>(null);

    /* ----------------------------- Data ------------------------------ */
    const { introducers, loading, fetchIntroducers, deleteIntroducer } =
        useCustomerIntroducers();

    /* --------------------------- Breadcrumb -------------------------- */
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer Introducers', href: '/introducers' },
    ];

    /* =========================================================
     * Handlers
     * =======================================================*/
    const handleCustomerSelect = (customer: any) => {
        setData(customer);
        fetchIntroducers(customer.id);
    };

    const handleDelete = async (id: number) => {
        const result = await confirmDelete();
        if (!result.isConfirmed || !data.id) return;

        try {
            await deleteIntroducer(id);
            toast.success('Introducer deleted successfully');
            fetchIntroducers(data.id);
        } catch {
            toast.error('Failed to delete introducer');
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedIntroducer(null);
        setIsModalOpen(true);
    };

    const openViewModal = (introducer: CustomerIntroducer) => {
        setModalMode('view');
        setSelectedIntroducer(introducer);
        setIsModalOpen(true);
    };

    const openEditModal = (introducer: CustomerIntroducer) => {
        setModalMode('edit');
        setSelectedIntroducer(introducer);
        setIsModalOpen(true);
    };

    /* =========================================================
     * Render
     * =======================================================*/
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Introducers" />

            <div className="space-y-6 text-foreground">
                {/* ================= Customer Search ================= */}
                <CustomerSearchBox onSelect={handleCustomerSelect} />

                {/* ================= Header ================= */}
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Customer Introducers"
                        description="Manage all customer introducers"
                    />

                    <button
                        disabled={!data.id}
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
                    >
                        <Plus className="h-4 w-4" />
                        Add Introducer
                    </button>
                </div>

                {/* ================= Introducer List ================= */}
                {introducers.length ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {introducers.map((intro) => (
                            <div
                                key={intro.id}
                                className="flex items-center justify-center gap-3 rounded-md border bg-card p-3"
                            >
                                {/* Photo */}
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border bg-muted">
                                    {intro.introducer_customer?.photo?.url ? (
                                        <img
                                            src={
                                                intro.introducer_customer.photo
                                                    .url
                                            }
                                            alt={intro.introducer_customer.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                            {intro.introducer_customer?.name?.charAt(
                                                0,
                                            ) ?? '-'}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 space-y-1 text-sm">
                                    <p className="font-semibold">
                                        {intro.introducer_customer?.name ?? '—'}
                                    </p>

                                    <div className="flex flex-wrap gap-1">
                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                            {intro.relationship_type?.replace(
                                                '_',
                                                ' ',
                                            )}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                intro.verification_status ===
                                                'VERIFIED'
                                                    ? 'bg-green-100 text-green-800'
                                                    : intro.verification_status ===
                                                        'REJECTED'
                                                      ? 'bg-red-100 text-red-800'
                                                      : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                        >
                                            {intro.verification_status}
                                        </span>
                                    </div>

                                    {intro.remarks && (
                                        <p className="text-xs text-muted-foreground">
                                            {intro.remarks}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <TooltipProvider>
                                    <div className="flex gap-2">
                                        <Action
                                            label="View"
                                            onClick={() => openViewModal(intro)}
                                        >
                                            <Eye className="h-5 w-5 text-primary" />
                                        </Action>

                                        <Action
                                            label="Edit"
                                            onClick={() => openEditModal(intro)}
                                        >
                                            <Pencil className="h-5 w-5 text-green-600" />
                                        </Action>

                                        <Action
                                            label="Delete"
                                            onClick={() =>
                                                handleDelete(intro.id)
                                            }
                                        >
                                            <Trash2 className="h-5 w-5 text-destructive" />
                                        </Action>
                                    </div>
                                </TooltipProvider>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="py-6 text-center text-muted-foreground">
                        {loading
                            ? 'Loading introducers…'
                            : 'No introducers found'}
                    </p>
                )}

                {/* ================= Modal ================= */}
                {data.id && (
                    <IntroducerModal
                        open={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        mode={modalMode}
                        customerId={data.id}
                        introducer={selectedIntroducer}
                        onSaved={() => {
                            fetchIntroducers(data.id);
                            setIsModalOpen(false);
                        }}
                    />
                )}
            </div>
        </CustomAuthLayout>
    );
}

function Action({
    label,
    onClick,
    children,
}: {
    label: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button onClick={onClick}>{children}</button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}
