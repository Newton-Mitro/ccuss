import { BadgeCheck, Eye } from 'lucide-react';

type AccountPreviewDetail = {
    label: string;
    value: string;
};

type AccountEditPreviewProps = {
    accountType: string;
    accountNumber: string;
    accountName: string;
    productName: string;
    accountStatus: string;
    featuredLabel: string;
    featuredValue: string;
    details: AccountPreviewDetail[];
};

export default function AccountEditPreview({
    accountType,
    accountNumber,
    accountName,
    productName,
    accountStatus,
    featuredLabel,
    featuredValue,
    details,
}: AccountEditPreviewProps) {
    return (
        <section
            aria-label={`${accountType} live preview`}
            className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-xl ring-1 shadow-primary/[0.05] ring-foreground/[0.02]"
        >
            <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-5 py-5">
                <div className="pointer-events-none absolute -top-12 right-0 size-36 rounded-full bg-primary/10 blur-3xl" />
                <div className="relative flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                        <Eye className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
                            Account summary
                        </p>
                        <h2 className="text-base font-semibold">
                            Live preview
                        </h2>
                    </div>
                    <span className="rounded-full border border-primary/15 bg-background/80 px-2.5 py-1 text-[10px] font-semibold text-primary">
                        LIVE
                    </span>
                </div>
            </div>

            <div className="space-y-3 p-4">
                <div className="rounded-2xl bg-gradient-to-br from-primary/[0.08] to-muted/30 p-4 ring-1 ring-primary/10">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                Account display name
                            </p>
                            <p className="mt-1 text-lg font-semibold tracking-tight break-words">
                                {accountName || 'Account name'}
                            </p>
                            <p className="mt-1 font-mono text-xs text-muted-foreground">
                                {accountNumber}
                            </p>
                        </div>
                        <span className="shrink-0 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[10px] font-semibold">
                            {accountType}
                        </span>
                    </div>
                </div>

                <div className="rounded-2xl border border-primary/15 bg-primary/[0.06] p-4">
                    <p className="text-xs text-muted-foreground">
                        {featuredLabel}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight break-words text-primary tabular-nums">
                        {featuredValue}
                    </p>
                </div>

                <div className="space-y-2">
                    {[
                        { label: 'Product', value: productName },
                        ...details,
                        { label: 'Account status', value: accountStatus },
                    ].map((detail) => (
                        <div
                            key={detail.label}
                            className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5"
                        >
                            <span className="min-w-0 text-xs text-muted-foreground">
                                {detail.label}
                            </span>
                            <span className="min-w-0 text-right text-xs font-medium break-words">
                                {detail.value || 'Not set'}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-3.5 py-3 text-[11px] text-muted-foreground">
                    <BadgeCheck className="size-4 shrink-0 text-primary" />
                    Preview updates as you change the form.
                </div>
            </div>
        </section>
    );
}
