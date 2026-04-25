import { Head } from '@inertiajs/react';
import { ArrowLeft, Clock, Hash, MapPin } from 'lucide-react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { Branch } from '../../../types/branch';

interface ShowProps extends SharedData {
    branch: Branch;
}

export default function Show({ branch }: ShowProps) {
    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'System Administration', href: '' },
        { title: 'Branches', href: route('branches.index') },
        { title: branch.name, href: '' },
    ];

    const hasCoordinates = branch.latitude && branch.longitude;

    const handleBack = () => window.history.back();

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
                    <div className="">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1 rounded border border-border bg-card px-3 py-1.5 text-sm text-card-foreground transition-all hover:bg-card/50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                    </div>
                </div>

                {/* Overview Card */}
                <div className="rounded-md border border-border bg-card p-2 backdrop-blur-sm">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-muted-foreground">
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
                    <div className="rounded-md border border-border bg-card p-2 md:col-span-2 lg:col-span-3">
                        <div className="flex items-start gap-1">
                            <MapPin className="mt-0.5 h-3 w-3 text-info" />
                            <p>{branch.address}</p>
                        </div>
                    </div>

                    <div className="rounded-md border border-border bg-card p-2">
                        <p>Latitude: {branch.latitude ?? '-'}</p>
                    </div>
                    <div className="rounded-md border border-border bg-card p-2">
                        <p>Longitude: {branch.longitude ?? '-'}</p>
                    </div>
                    <div className="rounded-md border border-border bg-card p-2">
                        <p>Manager: {branch?.manager?.name ?? '-'}</p>
                    </div>
                </div>

                {/* Optional Map */}
                {hasCoordinates && (
                    <div className="rounded-md border bg-card p-2">
                        <iframe
                            title="Branch Map"
                            src={`https://maps.google.com/maps?q=${branch.latitude},${branch.longitude}&z=15&output=embed`}
                            className="h-96 w-full rounded-sm border"
                            loading="lazy"
                        />
                    </div>
                )}
            </div>
        </CustomAuthLayout>
    );
}
