import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock, Hash, MapPin } from 'lucide-react';
import HeadingSmall from '../../components/heading-small';
import CustomAuthLayout from '../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../types';
import { Branch } from '../../types/branch';

interface ShowProps {
    branch: Branch;
}

export default function Show({ branch }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Branches', href: '/branches' },
        { title: branch.name, href: '' },
    ];

    const hasCoordinates = branch.latitude && branch.longitude;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Branch: ${branch.name}`} />

            <div className="space-y-2 text-sm text-foreground">
                {/* Header */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title="Branch Details"
                        description="View and manage branch details."
                    />
                    <Link
                        href="/branches"
                        className="flex items-center gap-1 rounded border border-border bg-background px-2 py-0.5 hover:bg-muted/20"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Back
                    </Link>
                </div>

                {/* Overview Card */}
                <div className="rounded-md border border-border bg-card/50 p-2 shadow-sm backdrop-blur-sm">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-primary">
                                {branch.name}
                            </h2>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                <Hash className="h-3 w-3" /> {branch.code}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(
                                    branch.created_at,
                                ).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(
                                    branch.updated_at,
                                ).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-md border border-border bg-card p-2 shadow-sm md:col-span-2 lg:col-span-3">
                        <div className="flex items-start gap-1">
                            <MapPin className="mt-0.5 h-3 w-3 text-primary" />
                            <p>{branch.address}</p>
                        </div>
                    </div>

                    <div className="rounded-md border border-border bg-card p-2 shadow-sm">
                        <p>Latitude: {branch.latitude ?? '-'}</p>
                    </div>
                    <div className="rounded-md border border-border bg-card p-2 shadow-sm">
                        <p>Longitude: {branch.longitude ?? '-'}</p>
                    </div>
                    <div className="rounded-md border border-border bg-card p-2 shadow-sm">
                        <p>Manager: {branch?.manager?.name ?? '-'}</p>
                    </div>
                </div>

                {/* Optional Map */}
                {hasCoordinates && (
                    <div className="rounded-md border border-border bg-card/40 p-2 shadow-inner">
                        <iframe
                            title="Branch Map"
                            src={`https://maps.google.com/maps?q=${branch.latitude},${branch.longitude}&z=15&output=embed`}
                            className="h-96 w-full rounded-sm border border-border"
                            loading="lazy"
                        />
                    </div>
                )}
            </div>
        </CustomAuthLayout>
    );
}
