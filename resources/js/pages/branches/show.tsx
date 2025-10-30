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
        { title: 'Branches', href: '/auth/branches' },
        { title: branch.name, href: '' },
    ];

    const hasCoordinates = branch.latitude && branch.longitude;

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Branch: ${branch.name}`} />

            <div className="space-y-8 text-foreground">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title={`Branch: ${branch.name}`}
                        description="Detailed branch information overview"
                    />
                    <Link
                        href="/auth/branches"
                        className="flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-all hover:bg-muted/20"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Branches
                    </Link>
                </div>

                {/* Overview Card */}
                <div className="rounded-xl border border-border bg-card/50 p-6 shadow-sm backdrop-blur-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight text-primary">
                                {branch.name}
                            </h2>
                            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                <Hash className="h-4 w-4" /> Code: {branch.code}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Created:{' '}
                                {new Date(
                                    branch.created_at,
                                ).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Updated:{' '}
                                {new Date(
                                    branch.updated_at,
                                ).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm md:col-span-2 lg:col-span-3">
                        <h4 className="mb-2 font-semibold text-muted-foreground">
                            Address
                        </h4>
                        <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                            <p className="text-base">{branch.address}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <h4 className="mb-2 font-semibold text-muted-foreground">
                            Latitude
                        </h4>
                        <p>{branch.latitude ?? '-'}</p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <h4 className="mb-2 font-semibold text-muted-foreground">
                            Longitude
                        </h4>
                        <p>{branch.longitude ?? '-'}</p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-transform">
                        <h4 className="mb-2 font-semibold text-muted-foreground">
                            Manager
                        </h4>
                        <p className="text-lg font-medium">
                            {branch?.manager?.name}
                        </p>
                    </div>
                </div>

                {/* Optional Map Section */}
                {hasCoordinates && (
                    <div className="rounded-xl border border-border bg-card/40 p-4 shadow-inner">
                        <h3 className="mb-2 text-lg font-semibold text-muted-foreground">
                            Location Preview
                        </h3>
                        <iframe
                            title="Branch Map"
                            src={`https://maps.google.com/maps?q=${branch.latitude},${branch.longitude}&z=15&output=embed`}
                            className="h-72 w-full rounded-lg border border-border"
                            loading="lazy"
                        />
                    </div>
                )}
            </div>
        </CustomAuthLayout>
    );
}
