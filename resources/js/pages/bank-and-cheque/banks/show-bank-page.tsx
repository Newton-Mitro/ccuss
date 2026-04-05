import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Building2, CheckCircle2, XCircle } from 'lucide-react';

const ShowBankPage = ({ bank }) => {
    const handleBack = () => window.history.back();

    return (
        <CustomAuthLayout>
            <Head title={`Bank: ${bank.name}`} />

            {/* Header */}
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <HeadingSmall
                    title={bank.name}
                    description="Bank details and associated branches."
                />

                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back
                    </Button>

                    <Link href={`/banks/${bank.id}/edit`}>
                        <Button>Edit</Button>
                    </Link>
                </div>
            </div>

            {/* Bank Info */}
            <div className="space-y-4 rounded-md border bg-card p-4 sm:p-6">
                <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Bank Information</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Info label="Name" value={bank.name} />
                    <Info label="Short Name" value={bank.short_name} />
                    <Info label="SWIFT Code" value={bank.swift_code} />
                    <Info label="Routing Number" value={bank.routing_number} />

                    <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <div className="mt-1 flex items-center gap-1 text-sm">
                            {bank.status === 'active' ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    Active
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    Inactive
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Branches */}
            <div className="mt-6 rounded-md border bg-card p-4 sm:p-6">
                <h2 className="mb-4 text-sm font-semibold">Branches</h2>

                {bank.branches.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No branches found.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {bank.branches.map((branch) => (
                            <div
                                key={branch.id}
                                className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:justify-between"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {branch.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {branch.address || 'No address'}
                                    </p>
                                </div>

                                <div className="text-right text-xs text-muted-foreground">
                                    <p>
                                        Routing: {branch.routing_number || '-'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CustomAuthLayout>
    );
};

const Info = ({ label, value }) => (
    <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || '-'}</p>
    </div>
);

export default ShowBankPage;
