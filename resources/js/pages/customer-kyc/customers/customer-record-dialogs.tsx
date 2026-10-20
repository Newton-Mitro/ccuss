import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import {
    ArrowRight,
    ExternalLink,
    FileText,
    FileWarning,
    Globe2,
    Hash,
    MapPin,
    Navigation,
    UserRound,
    UsersRound,
} from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import { Select } from '../../../components/ui/select';
import type {
    Customer,
    CustomerAddress,
    CustomerFamilyRelation,
    CustomerIntroducer,
    KycDocument,
} from '../../../types/customer_kyc_module';
import { addressTypes } from '../addresses/data/address_types';
import ApprovalActions from '../components/approval-actions';
import { getRelations } from '../family-relations/data/family_and_relative_relations';
import { relationshipTypes } from '../introducers/data/relationship_types';
import { documentTypes } from '../kyc-documents/data/document_types';
import { CustomerSearchBox } from './components/customer-search-box';

type RecordAction = 'create' | 'edit' | 'view';

interface DialogProps<T> {
    open: boolean;
    action: RecordAction;
    customer: Customer;
    record: T | null;
    onOpenChange: (open: boolean) => void;
}

function RecordDialogShell({
    open,
    action,
    title,
    description,
    category,
    icon,
    status,
    children,
    footerActions,
    wide = false,
    fitViewport = false,
    processing = false,
    onOpenChange,
}: {
    open: boolean;
    action: RecordAction;
    title: string;
    description: string;
    category: string;
    icon: ReactNode;
    status?: string | null;
    children: React.ReactNode;
    footerActions?: ReactNode;
    wide?: boolean;
    fitViewport?: boolean;
    processing?: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (processing && !nextOpen) return;
                onOpenChange(nextOpen);
            }}
        >
            <DialogContent
                className={`max-h-[92dvh] ${wide ? 'max-w-5xl' : 'max-w-2xl'} ${fitViewport ? 'grid h-[90dvh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden' : 'overflow-y-auto'} gap-0 p-0`}
            >
                <div
                    className={`relative overflow-hidden border-b bg-linear-to-br from-primary/10 via-background to-sky-500/10 ${fitViewport ? 'px-4 py-3 sm:px-6 sm:py-4' : 'px-6 py-6 sm:px-8'}`}
                >
                    <div className="pointer-events-none absolute -top-16 -right-12 size-48 rounded-full bg-primary/10 blur-3xl" />
                    <DialogHeader className="relative gap-4 pr-8 text-left sm:flex-row sm:items-start">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
                            {icon}
                        </div>
                        <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                    {category}
                                </span>
                                <span className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary capitalize">
                                    {action}
                                </span>
                            </div>
                            <DialogTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="max-w-xl text-sm leading-relaxed">
                                {description}
                            </DialogDescription>
                            {status && <StatusBadge status={status} />}
                        </div>
                    </DialogHeader>
                </div>
                <div
                    className={
                        fitViewport
                            ? 'min-h-0 overflow-hidden p-3 sm:p-4'
                            : 'space-y-5 px-6 py-6 sm:px-8'
                    }
                >
                    {children}
                </div>
                {action === 'view' && (
                    <DialogFooter
                        className={`border-t bg-muted/20 sm:justify-between ${fitViewport ? 'px-4 py-2 sm:px-6' : 'px-6 py-4 sm:px-8'}`}
                    >
                        <div className="flex items-center gap-2">
                            {footerActions}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="min-w-24"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}

function IdentityCard({
    customer,
    caption,
}: {
    customer?: Customer | null;
    caption: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
            {customer?.photo?.url ? (
                <img
                    src={customer.photo.url}
                    alt=""
                    className="size-11 shrink-0 rounded-full border object-cover"
                />
            ) : (
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full border bg-muted text-sm font-semibold text-muted-foreground">
                    {customer?.name?.charAt(0).toUpperCase() ?? '?'}
                </div>
            )}
            <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground">
                    {caption}
                </p>
                <p className="truncate text-sm font-semibold">
                    {customer?.name ?? 'Not available'}
                </p>
                {customer?.customer_no && (
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                        {customer.customer_no}
                    </p>
                )}
            </div>
        </div>
    );
}

function CompactRecordField({
    label,
    value,
}: {
    label: string;
    value?: ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
            <dd className="min-w-0 text-right text-sm font-medium wrap-break-word">
                {value || '—'}
            </dd>
        </div>
    );
}

function AddressMeta({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value?: string | null;
}) {
    return (
        <div className="flex min-w-0 flex-1 items-start gap-2.5 rounded-xl border bg-muted/20 p-3 sm:flex-none sm:gap-3 sm:p-4">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {label}
                </p>
                <p className="mt-1 truncate text-sm font-semibold capitalize">
                    {value || '—'}
                </p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const normalized = status.toUpperCase();
    const styles =
        normalized === 'VERIFIED' || normalized === 'APPROVED'
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            : normalized === 'REJECTED'
              ? 'border-destructive/20 bg-destructive/10 text-destructive'
              : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300';

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles}`}
        >
            <span className="size-1.5 rounded-full bg-current" />
            {normalized.charAt(0) + normalized.slice(1).toLowerCase()}
        </span>
    );
}

export function CustomerAddressDialog({
    open,
    action,
    customer,
    record,
    onOpenChange,
}: DialogProps<CustomerAddress>) {
    const address = record;
    const form = useForm({
        customer_id: customer.id,
        line1: address?.line1 ?? '',
        line2: address?.line2 ?? '',
        division: address?.division ?? '',
        district: address?.district ?? '',
        upazila: address?.upazila ?? '',
        union_ward: address?.union_ward ?? '',
        postal_code: address?.postal_code ?? '',
        country: address?.country ?? 'Bangladesh',
        type: address?.type ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };
        if (address) {
            form.put(
                route('customers.addresses.update', [customer.id, address.id]),
                options,
            );
        } else {
            form.post(route('customers.addresses.store', customer.id), options);
        }
    };

    const title =
        action === 'view'
            ? 'Address details'
            : action === 'edit'
              ? 'Edit address'
              : 'Add address';

    return (
        <RecordDialogShell
            open={open}
            action={action}
            title={title}
            category="Customer address"
            icon={<MapPin className="size-6" />}
            status={address?.verification_status}
            description={`${title} for ${customer.name}.`}
            processing={form.processing}
            footerActions={
                address && action === 'view' ? (
                    <ApprovalActions
                        approveUrl={route('customers.addresses.approve', [
                            customer.id,
                            address.id,
                        ])}
                        rejectUrl={route('customers.addresses.reject', [
                            customer.id,
                            address.id,
                        ])}
                        pending={
                            address.verification_status?.toUpperCase() ===
                            'PENDING'
                        }
                        onSuccess={() => onOpenChange(false)}
                    />
                ) : undefined
            }
            onOpenChange={onOpenChange}
        >
            {action === 'view' ? (
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
                    <section className="rounded-2xl border bg-card p-5 sm:p-6">
                        <div className="flex items-center gap-2">
                            <Navigation className="size-4 text-primary" />
                            <h3 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                                Location route
                            </h3>
                        </div>
                        <div className="mt-5">
                            <div className="flex gap-3">
                                <div className="flex w-5 shrink-0 flex-col items-center">
                                    <span className="z-10 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <MapPin className="size-3" />
                                    </span>
                                    <span className="my-1 min-h-5 w-px flex-1 bg-border" />
                                </div>
                                <div className="min-w-0 pb-4">
                                    <p className="text-[11px] font-medium text-muted-foreground">
                                        Street address
                                    </p>
                                    <p className="mt-1 text-sm leading-5 font-semibold wrap-break-word">
                                        {address?.line1 ||
                                            'No street address provided'}
                                    </p>
                                    {address?.line2 && (
                                        <p className="mt-0.5 text-sm leading-5 wrap-break-word text-muted-foreground">
                                            {address.line2}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {[
                                ['Union / Ward', address?.union_ward],
                                ['Upazila', address?.upazila],
                                ['District', address?.district],
                                ['Division', address?.division],
                            ]
                                .filter(([, value]) => Boolean(value))
                                .map(([label, value], index, locations) => (
                                    <div key={label} className="flex gap-3">
                                        <div className="flex w-5 shrink-0 flex-col items-center">
                                            <span className="z-10 mt-1 size-2.5 rounded-full border-2 border-primary/60 bg-background" />
                                            {index < locations.length - 1 && (
                                                <span className="my-1 min-h-5 w-px flex-1 bg-border" />
                                            )}
                                        </div>
                                        <div
                                            className={`min-w-0 ${index < locations.length - 1 ? 'pb-4' : 'pb-1'}`}
                                        >
                                            <p className="text-[11px] font-medium text-muted-foreground">
                                                {label}
                                            </p>
                                            <p className="mt-0.5 text-sm font-medium wrap-break-word">
                                                {value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </section>
                    <aside className="flex flex-row gap-3 sm:flex-col">
                        <AddressMeta
                            icon={<MapPin className="size-4" />}
                            label="Address type"
                            value={address?.type?.toLowerCase()}
                        />
                        <AddressMeta
                            icon={<Hash className="size-4" />}
                            label="Postal code"
                            value={address?.postal_code}
                        />
                        <AddressMeta
                            icon={<Globe2 className="size-4" />}
                            label="Country"
                            value={address?.country}
                        />
                    </aside>
                </div>
            ) : (
                <form className="space-y-4" onSubmit={submit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label>Address type</Label>
                            <Select
                                value={form.data.type}
                                onChange={(value) =>
                                    form.setData('type', value)
                                }
                                options={addressTypes}
                            />
                            <InputError message={form.errors.type} />
                        </div>
                        <TextField
                            label="Country"
                            value={form.data.country}
                            error={form.errors.country}
                            onChange={(value) => form.setData('country', value)}
                        />
                        <TextField
                            label="Address line 1"
                            value={form.data.line1}
                            error={form.errors.line1}
                            onChange={(value) => form.setData('line1', value)}
                        />
                        <TextField
                            label="Address line 2"
                            value={form.data.line2}
                            error={form.errors.line2}
                            onChange={(value) => form.setData('line2', value)}
                        />
                        <TextField
                            label="Division"
                            value={form.data.division}
                            error={form.errors.division}
                            onChange={(value) =>
                                form.setData('division', value)
                            }
                        />
                        <TextField
                            label="District"
                            value={form.data.district}
                            error={form.errors.district}
                            onChange={(value) =>
                                form.setData('district', value)
                            }
                        />
                        <TextField
                            label="Upazila"
                            value={form.data.upazila}
                            error={form.errors.upazila}
                            onChange={(value) => form.setData('upazila', value)}
                        />
                        <TextField
                            label="Union / Ward"
                            value={form.data.union_ward}
                            error={form.errors.union_ward}
                            onChange={(value) =>
                                form.setData('union_ward', value)
                            }
                        />
                        <TextField
                            label="Postal code"
                            value={form.data.postal_code}
                            error={form.errors.postal_code}
                            onChange={(value) =>
                                form.setData('postal_code', value)
                            }
                        />
                    </div>
                    <FormActions
                        action={action}
                        processing={form.processing}
                        onCancel={() => onOpenChange(false)}
                    />
                </form>
            )}
        </RecordDialogShell>
    );
}

export function CustomerFamilyRelationDialog({
    open,
    action,
    customer,
    record,
    onOpenChange,
}: DialogProps<CustomerFamilyRelation>) {
    const relation = record;
    const form = useForm({
        customer_id: customer.id,
        relative_id: relation?.relative_id ?? (null as number | null),
        relation_type: relation?.relation_type ?? '',
    });
    const [selectedRelative, setSelectedRelative] = useState<Customer | null>(
        relation?.relative ?? null,
    );
    const relations = getRelations(
        customer.gender ?? undefined,
        selectedRelative?.gender ?? undefined,
    );
    const title =
        action === 'view'
            ? 'Family relation details'
            : action === 'edit'
              ? 'Edit family relation'
              : 'Add family relation';

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };
        if (relation) {
            form.put(
                route('customers.family-relations.update', [
                    customer.id,
                    relation.id,
                ]),
                options,
            );
        } else {
            form.post(
                route('customers.family-relations.store', customer.id),
                options,
            );
        }
    };

    return (
        <RecordDialogShell
            open={open}
            action={action}
            title={title}
            category="Family & relatives"
            icon={<UsersRound className="size-6" />}
            status={relation?.verification_status}
            description={`${title} for ${customer.name}.`}
            processing={form.processing}
            footerActions={
                relation && action === 'view' ? (
                    <ApprovalActions
                        approveUrl={route(
                            'customers.family-relations.approve',
                            [customer.id, relation.id],
                        )}
                        rejectUrl={route('customers.family-relations.reject', [
                            customer.id,
                            relation.id,
                        ])}
                        pending={
                            relation.verification_status?.toUpperCase() ===
                            'PENDING'
                        }
                        onSuccess={() => onOpenChange(false)}
                    />
                ) : undefined
            }
            onOpenChange={onOpenChange}
        >
            {action === 'view' ? (
                <div className="space-y-4">
                    <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5">
                        <p className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Relationship between
                        </p>
                        <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
                            <IdentityCard
                                customer={customer}
                                caption="Customer"
                            />
                            <div className="flex items-center justify-center gap-2 sm:flex-col">
                                <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700 capitalize dark:text-violet-300">
                                    {relation?.relation_type?.replaceAll(
                                        '_',
                                        ' ',
                                    ) || 'Related'}
                                </span>
                                <ArrowRight className="size-4 text-muted-foreground sm:rotate-90" />
                            </div>
                            <IdentityCard
                                customer={relation?.relative}
                                caption="Relative"
                            />
                        </div>
                    </div>
                    {relation?.remarks && (
                        <div className="rounded-xl border bg-card p-4">
                            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                Remarks
                            </p>
                            <p className="mt-2 text-sm leading-5">
                                {relation.remarks}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <form className="space-y-4" onSubmit={submit}>
                    <div className="space-y-1.5">
                        <Label>Relative</Label>
                        <CustomerSearchBox
                            key={`${open}-${relation?.id ?? 'new'}`}
                            selectedCustomer={selectedRelative ?? undefined}
                            onSelect={(relative) => {
                                setSelectedRelative(relative);
                                form.setData('relative_id', relative.id);
                            }}
                        />
                        <InputError message={form.errors.relative_id} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Relationship</Label>
                        <Select
                            value={form.data.relation_type}
                            onChange={(value) =>
                                form.setData('relation_type', value)
                            }
                            options={relations}
                        />
                        <InputError message={form.errors.relation_type} />
                    </div>
                    <FormActions
                        action={action}
                        processing={form.processing}
                        onCancel={() => onOpenChange(false)}
                    />
                </form>
            )}
        </RecordDialogShell>
    );
}

export function CustomerIntroducerDialog({
    open,
    action,
    customer,
    record,
    onOpenChange,
}: DialogProps<CustomerIntroducer>) {
    const introducer = record;
    const existingIntroducer = introducer?.introducer_customer ?? null;
    const form = useForm({
        introduced_customer_id: customer.id,
        introducer_customer_id:
            introducer?.introducer_customer_id ?? (null as number | null),
        relationship_type: introducer?.relationship_type ?? '',
    });
    const [selectedIntroducer, setSelectedIntroducer] =
        useState<Customer | null>(existingIntroducer);
    const title =
        action === 'view'
            ? 'Introducer details'
            : action === 'edit'
              ? 'Edit introducer'
              : 'Add introducer';

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!form.data.introducer_customer_id) {
            toast.error('Please select an introducer');
            return;
        }
        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };
        if (introducer) {
            form.put(
                route('customers.introducers.update', [
                    customer.id,
                    introducer.id,
                ]),
                options,
            );
        } else {
            form.post(
                route('customers.introducers.store', customer.id),
                options,
            );
        }
    };

    return (
        <RecordDialogShell
            open={open}
            action={action}
            title={title}
            category="Customer introducer"
            icon={<UserRound className="size-6" />}
            status={introducer?.verification_status}
            description={`${title} for ${customer.name}.`}
            processing={form.processing}
            footerActions={
                introducer && action === 'view' ? (
                    <ApprovalActions
                        approveUrl={route('customers.introducers.approve', [
                            customer.id,
                            introducer.id,
                        ])}
                        rejectUrl={route('customers.introducers.reject', [
                            customer.id,
                            introducer.id,
                        ])}
                        pending={
                            introducer.verification_status?.toUpperCase() ===
                            'PENDING'
                        }
                        onSuccess={() => onOpenChange(false)}
                    />
                ) : undefined
            }
            onOpenChange={onOpenChange}
        >
            {action === 'view' ? (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-emerald-500/15 bg-linear-to-br from-emerald-500/5 via-card to-teal-500/10 p-4 sm:p-5">
                        <p className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Introduction
                        </p>
                        <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
                            <IdentityCard
                                customer={existingIntroducer}
                                caption="Introduced by"
                            />
                            <div className="flex items-center justify-center gap-2 sm:flex-col">
                                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 capitalize dark:text-emerald-300">
                                    {introducer?.relationship_type?.toLowerCase() ||
                                        'Introducer'}
                                </span>
                                <ArrowRight className="size-4 text-muted-foreground sm:rotate-90" />
                            </div>
                            <IdentityCard
                                customer={customer}
                                caption="Customer"
                            />
                        </div>
                    </div>
                    {introducer?.remarks && (
                        <div className="rounded-xl border bg-card p-4">
                            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                Remarks
                            </p>
                            <p className="mt-2 text-sm leading-5">
                                {introducer.remarks}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <form className="space-y-4" onSubmit={submit}>
                    <div className="space-y-1.5">
                        <Label>Introducer</Label>
                        <CustomerSearchBox
                            key={`${open}-${introducer?.id ?? 'new'}`}
                            selectedCustomer={selectedIntroducer ?? undefined}
                            onSelect={(selected) => {
                                if (selected.id === customer.id) {
                                    toast.error(
                                        'Customer cannot be their own introducer',
                                    );
                                    return;
                                }
                                setSelectedIntroducer(selected);
                                form.setData(
                                    'introducer_customer_id',
                                    selected.id,
                                );
                            }}
                        />
                        <InputError
                            message={form.errors.introducer_customer_id}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Relationship type</Label>
                        <Select
                            value={form.data.relationship_type}
                            onChange={(value) =>
                                form.setData('relationship_type', value)
                            }
                            options={relationshipTypes}
                        />
                        <InputError message={form.errors.relationship_type} />
                    </div>
                    <FormActions
                        action={action}
                        processing={form.processing}
                        onCancel={() => onOpenChange(false)}
                    />
                </form>
            )}
        </RecordDialogShell>
    );
}

export function CustomerKycDocumentDialog({
    open,
    action,
    customer,
    record,
    onOpenChange,
}: DialogProps<KycDocument>) {
    const document = record;
    const form = useForm({
        _method: 'put',
        customer_id: customer.id,
        document_type: document?.document_type ?? '',
        alt_text: document?.alt_text ?? '',
        file: null as File | null,
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        document?.url ?? null,
    );

    useEffect(
        () => () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        },
        [previewUrl],
    );

    const title =
        action === 'view'
            ? 'KYC document'
            : action === 'edit'
              ? 'Edit KYC document'
              : 'Upload KYC document';

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };
        if (document) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(
                route('customers.kyc-documents.update', [
                    customer.id,
                    document.id,
                ]),
                options,
            );
        } else {
            form.transform((data) => {
                const payload = { ...data };
                Reflect.deleteProperty(payload, '_method');
                return payload;
            });
            form.post(
                route('customers.kyc-documents.store', customer.id),
                options,
            );
        }
    };

    return (
        <RecordDialogShell
            open={open}
            action={action}
            title={title}
            category="KYC document"
            icon={<FileText className="size-6" />}
            status={document?.verification_status}
            wide={action === 'view'}
            fitViewport={action === 'view'}
            description={
                action === 'view'
                    ? `Document details for ${customer.name}.`
                    : `${title} for ${customer.name}.`
            }
            processing={form.processing}
            footerActions={
                document && action === 'view' ? (
                    <ApprovalActions
                        approveUrl={route('customers.kyc-documents.approve', [
                            customer.id,
                            document.id,
                        ])}
                        rejectUrl={route('customers.kyc-documents.reject', [
                            customer.id,
                            document.id,
                        ])}
                        pending={
                            document.verification_status?.toUpperCase() ===
                            'PENDING'
                        }
                        onSuccess={() => onOpenChange(false)}
                    />
                ) : undefined
            }
            onOpenChange={onOpenChange}
        >
            {action === 'view' ? (
                <div className="grid h-full min-h-0 grid-rows-[minmax(0,1.45fr)_minmax(0,1fr)] gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,0.8fr)] lg:grid-rows-1 lg:gap-5">
                    <section className="flex min-h-0 min-w-0 flex-col gap-2">
                        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Document preview
                                </h3>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Review the uploaded file before taking
                                    action.
                                </p>
                            </div>
                            {document?.url && (
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={document.url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <ExternalLink className="mr-2 size-3.5" />
                                        Open original
                                    </a>
                                </Button>
                            )}
                        </div>

                        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border bg-slate-950 p-2 shadow-inner">
                            {document?.mime?.startsWith('image/') ? (
                                <img
                                    src={document.url}
                                    alt={
                                        document.alt_text ||
                                        document.document_type
                                    }
                                    className="max-h-full max-w-full rounded-lg object-contain"
                                />
                            ) : document?.mime === 'application/pdf' ? (
                                <iframe
                                    title={`${document.document_type} preview`}
                                    src={document.url}
                                    className="h-full min-h-0 w-full rounded-lg bg-white"
                                />
                            ) : (
                                <div className="flex max-w-sm flex-col items-center px-6 py-12 text-center text-white">
                                    <div className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                                        <FileWarning className="size-8 text-white/80" />
                                    </div>
                                    <p className="mt-4 text-sm font-semibold">
                                        Preview unavailable
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-white/60">
                                        This file type cannot be previewed here.
                                        Open the original file to review it.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="min-h-0 space-y-3 overflow-y-auto">
                        <div className="rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
                            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                                Document information
                            </p>
                            <dl className="mt-2 divide-y divide-border/70">
                                <CompactRecordField
                                    label="Document type"
                                    value={document?.document_type}
                                />
                                <CompactRecordField
                                    label="File name"
                                    value={document?.file_name}
                                />
                                <CompactRecordField
                                    label="File format"
                                    value={document?.mime
                                        ?.split('/')
                                        .pop()
                                        ?.toUpperCase()}
                                />
                                <CompactRecordField
                                    label="Customer"
                                    value={customer.name}
                                />
                            </dl>
                        </div>

                        {(document?.alt_text || document?.remarks) && (
                            <div className="rounded-2xl border bg-muted/20 p-4">
                                <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                                    Notes
                                </p>
                                {document.alt_text && (
                                    <div className="mt-3">
                                        <p className="text-xs text-muted-foreground">
                                            Alt text
                                        </p>
                                        <p className="mt-1 text-sm leading-5 wrap-break-word">
                                            {document.alt_text}
                                        </p>
                                    </div>
                                )}
                                {document.remarks && (
                                    <div className="mt-3 border-t pt-3">
                                        <p className="text-xs text-muted-foreground">
                                            Remarks
                                        </p>
                                        <p className="mt-1 text-sm leading-5 wrap-break-word">
                                            {document.remarks}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </aside>
                </div>
            ) : (
                <form className="space-y-4" onSubmit={submit}>
                    <div className="space-y-1.5">
                        <Label>Document type</Label>
                        <Select
                            value={form.data.document_type}
                            onChange={(value) =>
                                form.setData('document_type', value)
                            }
                            options={documentTypes.filter(
                                (option) => option.value !== '',
                            )}
                        />
                        <InputError message={form.errors.document_type} />
                    </div>
                    {action === 'edit' && (
                        <div className="space-y-1.5">
                            <Label>Alt text</Label>
                            <Input
                                value={form.data.alt_text}
                                onChange={(event) =>
                                    form.setData('alt_text', event.target.value)
                                }
                            />
                            <InputError message={form.errors.alt_text} />
                        </div>
                    )}
                    {previewUrl &&
                        ((
                            form.data.file?.type ??
                            document?.mime ??
                            ''
                        ).startsWith('image/') ? (
                            <img
                                src={previewUrl}
                                alt={form.data.alt_text || 'Document preview'}
                                className="max-h-48 max-w-full rounded-md border object-contain"
                            />
                        ) : (
                            <iframe
                                title="Document preview"
                                src={previewUrl}
                                className="h-48 w-full rounded-md border"
                            />
                        ))}
                    <div className="space-y-1.5">
                        <Label>
                            {action === 'edit' ? 'Replace file' : 'Upload file'}
                        </Label>
                        <Input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                            onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                form.setData('file', file);
                                if (file) {
                                    setPreviewUrl(URL.createObjectURL(file));
                                }
                            }}
                        />
                        <InputError message={form.errors.file} />
                    </div>
                    <FormActions
                        action={action}
                        processing={form.processing}
                        onCancel={() => onOpenChange(false)}
                    />
                </form>
            )}
        </RecordDialogShell>
    );
}

function TextField({
    label,
    value,
    error,
    onChange,
}: {
    label: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            <Input
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
            <InputError message={error} />
        </div>
    );
}

function FormActions({
    action,
    processing,
    onCancel,
}: {
    action: RecordAction;
    processing: boolean;
    onCancel: () => void;
}) {
    return (
        <DialogFooter>
            <Button
                type="button"
                variant="outline"
                disabled={processing}
                onClick={onCancel}
            >
                Cancel
            </Button>
            <Button type="submit" disabled={processing}>
                {processing
                    ? 'Saving...'
                    : action === 'edit'
                      ? 'Save changes'
                      : 'Create'}
            </Button>
        </DialogFooter>
    );
}
