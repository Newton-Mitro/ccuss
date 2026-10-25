import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { FolderTree, Landmark } from 'lucide-react';

type Detail = {
    label: string;
    value: string | number | boolean | null | undefined;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    kind: 'ledger' | 'group';
    title: string;
    description: string;
    details: Detail[];
};

export default function AccountDetailsDialog({
    open,
    onOpenChange,
    kind,
    title,
    description,
    details,
}: Props) {
    const Icon = kind === 'ledger' ? Landmark : FolderTree;
    const code = details.find((detail) => detail.label === 'Code')?.value;
    const type = details.find((detail) => detail.label === 'Type')?.value;
    const status = details.find((detail) => detail.label === 'Status')?.value;
    const isActive = status === true || status === 'Active';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-3xl gap-0 overflow-y-auto p-0">
                <div
                    className={`relative overflow-hidden border-b px-6 py-7 sm:px-8 ${
                        kind === 'ledger'
                            ? 'bg-linear-to-br from-sky-500/10 via-background to-indigo-500/10'
                            : 'bg-linear-to-br from-violet-500/10 via-background to-fuchsia-500/10'
                    }`}
                >
                    <div
                        className={`pointer-events-none absolute -top-16 -right-12 size-52 rounded-full blur-3xl ${
                            kind === 'ledger'
                                ? 'bg-sky-500/10'
                                : 'bg-violet-500/10'
                        }`}
                    />
                    <DialogHeader className="relative gap-4 pr-8 text-left sm:flex-row sm:items-start">
                        <div
                            className={`flex size-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm ${
                                kind === 'ledger'
                                    ? 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300'
                                    : 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300'
                            }`}
                        >
                            <Icon className="size-7" />
                        </div>
                        <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                    {kind === 'ledger'
                                        ? 'Ledger account'
                                        : 'Account group'}
                                </span>
                                {code !== undefined && (
                                    <span className="rounded-md border bg-background/80 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                                        {code}
                                    </span>
                                )}
                            </div>
                            <DialogTitle className="text-2xl font-semibold tracking-tight">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="max-w-xl text-sm leading-relaxed">
                                {description}
                            </DialogDescription>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                {type !== undefined && (
                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                            kind === 'ledger'
                                                ? 'border-sky-500/20 bg-sky-500/10 text-sky-800 dark:text-sky-200'
                                                : 'border-violet-500/20 bg-violet-500/10 text-violet-800 dark:text-violet-200'
                                        }`}
                                    >
                                        {type}
                                    </span>
                                )}
                                {status !== undefined && (
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                                            isActive
                                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                : 'border-muted bg-muted/60 text-muted-foreground'
                                        }`}
                                    >
                                        <span
                                            className={`size-1.5 rounded-full ${
                                                isActive
                                                    ? 'bg-emerald-500'
                                                    : 'bg-muted-foreground'
                                            }`}
                                        />
                                        {typeof status === 'boolean'
                                            ? isActive
                                                ? 'Active'
                                                : 'Inactive'
                                            : status}
                                    </span>
                                )}
                            </div>
                        </div>
                    </DialogHeader>
                </div>
                <div className="space-y-4 px-6 py-6 sm:px-8">
                    <div className="flex items-center gap-2">
                        <span
                            className={`h-5 w-1 rounded-full ${
                                kind === 'ledger'
                                    ? 'bg-sky-500'
                                    : 'bg-violet-500'
                            }`}
                        />
                        <h3 className="text-sm font-semibold">
                            Configuration details
                        </h3>
                    </div>
                    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {details
                            .filter(
                                (detail) =>
                                    detail.label !== 'Code' &&
                                    detail.label !== 'Name' &&
                                    detail.label !== 'Type' &&
                                    detail.label !== 'Status',
                            )
                            .map((detail) => (
                                <div
                                    key={detail.label}
                                    className="group rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30"
                                >
                                    <dt className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                        {detail.label}
                                    </dt>
                                    <dd className="mt-2 text-sm font-medium wrap-break-word">
                                        {detail.value === null ||
                                        detail.value === undefined ||
                                        detail.value === ''
                                            ? '—'
                                            : typeof detail.value === 'boolean'
                                              ? detail.value
                                                  ? 'Yes'
                                                  : 'No'
                                              : detail.value}
                                    </dd>
                                </div>
                            ))}
                    </dl>
                </div>
            </DialogContent>
        </Dialog>
    );
}
