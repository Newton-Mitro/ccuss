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
import { Customer, CustomerFamilyRelation } from '../../../types/customer';

import { ModalMode } from '../../../types/base_types';
import { CustomerSearchBox } from '../customers/customer-search-box';
import FamilyRelationModal from './family_relation_modal';
import { useCustomerFamilyRelations } from './hooks/useCustomerFamilyRelations';
import { confirmDelete } from './utils/confirmDelete';

/* =========================================================
 * Component
 * =======================================================*/
export default function CustomerFamilyRelationIndex() {
    /* ----------------------------- Form ----------------------------- */
    const { data, setData } = useForm<Customer | null>(null);

    /* ----------------------------- State ----------------------------- */
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [selectedRelation, setSelectedRelation] =
        useState<CustomerFamilyRelation | null>(null);

    /* ----------------------------- Data ------------------------------ */
    const { relations, loading, fetchRelations, deleteRelation } =
        useCustomerFamilyRelations();

    /* --------------------------- Breadcrumb -------------------------- */
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Family Relations', href: '/family-relations' },
        {
            title: 'Customer Family Relations',
            href: '/family-relations/customer',
        },
    ];

    /* =========================================================
     * Handlers
     * =======================================================*/
    const handleCustomerSelect = (customer: Customer) => {
        setData(customer);
        fetchRelations(customer.id);
    };

    const handleDelete = async (relationId: number) => {
        const result = await confirmDelete();
        if (!result.isConfirmed || !data?.id) return;

        try {
            await deleteRelation(relationId);
            toast.success('Family relation deleted successfully');
        } catch {
            toast.error('Failed to delete family relation');
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedRelation(null);
        setIsModalOpen(true);
    };

    const openViewModal = (relation: CustomerFamilyRelation) => {
        setModalMode('view');
        setSelectedRelation(relation);
        setIsModalOpen(true);
    };

    const openEditModal = (relation: CustomerFamilyRelation) => {
        setModalMode('edit');
        setSelectedRelation(relation);
        setIsModalOpen(true);
    };

    /* =========================================================
     * Render
     * =======================================================*/
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Family Relations" />

            <div className="space-y-6 text-foreground">
                {/* ================= Customer Search ================= */}
                <CustomerSearchBox onSelect={handleCustomerSelect} />

                {/* ================= Header ================= */}
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Family Relations"
                        description="Manage customer family and relative relationships"
                    />

                    <button
                        disabled={!data?.id}
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
                    >
                        <Plus className="h-4 w-4" />
                        Add Relation
                    </button>
                </div>

                {/* ================= Relation List ================= */}
                {relations.length ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {relations.map((relation) => (
                            <div
                                key={relation.id}
                                className="rounded-md border bg-card p-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    {/* Left: Photo + Info */}
                                    <div className="flex gap-3">
                                        {/* Avatar */}
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border bg-muted">
                                            {relation.photo?.url ? (
                                                <img
                                                    src={relation.photo.url}
                                                    alt={relation.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                                    {relation.name?.charAt(0) ??
                                                        '-'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="space-y-1 text-sm">
                                            <p className="leading-tight font-semibold">
                                                {relation.name}
                                            </p>

                                            {/* Relation Type Chip */}
                                            {relation.relation_type && (
                                                <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                                                    {relation.relation_type.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </span>
                                            )}

                                            <p className="text-xs text-muted-foreground">
                                                {relation.phone || '—'} •{' '}
                                                {relation.email || '—'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <TooltipProvider>
                                        <div className="flex shrink-0 gap-2">
                                            <Action
                                                label="View"
                                                onClick={() =>
                                                    openViewModal(relation)
                                                }
                                            >
                                                <Eye className="h-5 w-5 text-primary" />
                                            </Action>

                                            <Action
                                                label="Edit"
                                                onClick={() =>
                                                    openEditModal(relation)
                                                }
                                            >
                                                <Pencil className="h-5 w-5 text-green-600" />
                                            </Action>

                                            <Action
                                                label="Delete"
                                                onClick={() =>
                                                    handleDelete(relation.id)
                                                }
                                            >
                                                <Trash2 className="h-5 w-5 text-destructive" />
                                            </Action>
                                        </div>
                                    </TooltipProvider>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="py-6 text-center text-muted-foreground">
                        {loading
                            ? 'Loading family relations…'
                            : 'No family relations found'}
                    </p>
                )}

                {/* ================= Modal ================= */}
                {data?.id && (
                    <FamilyRelationModal
                        open={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        mode={modalMode}
                        customerId={data.id}
                        relation={selectedRelation}
                        onSaved={() => {
                            fetchRelations(data.id);
                            setIsModalOpen(false);
                        }}
                    />
                )}
            </div>
        </CustomAuthLayout>
    );
}

/* =========================================================
 * Action Button
 * =======================================================*/
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
                <button
                    onClick={onClick}
                    className="transition hover:scale-105"
                >
                    {children}
                </button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}
