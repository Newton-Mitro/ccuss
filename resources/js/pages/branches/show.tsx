import { Head } from '@inertiajs/react';
import HeadingSmall from '../../components/heading-small';
import CustomAuthLayout from '../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../types';

interface ShowProps {
    branch: {
        id: number;
        code: string;
        name: string;
        address: string;
        latitude: string | null;
        longitude: string | null;
        manager_id: string | null;
        created_at: string;
        updated_at: string;
    };
}

function Show({ branch }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Branches', href: '/auth/branches' },
        { title: `Branch ${branch.code}`, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Branch: ${branch.name}`} />

            <div className="animate-in space-y-8 px-4 py-6 text-foreground fade-in">
                <HeadingSmall
                    title={`Branch: ${branch.name}`}
                    description="Branch details are displayed below."
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h4 className="mb-2 font-semibold text-muted-foreground">
                            Code
                        </h4>
                        <p>{branch.code}</p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h4 className="mb-2 font-semibold text-muted-foreground">
                            Name
                        </h4>
                        <p>{branch.name}</p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm md:col-span-2 lg:col-span-3">
                        <h4 className="mb-2 font-semibold text-muted-foreground">
                            Address
                        </h4>
                        <p>{branch.address}</p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h4 className="mb-2 font-semibold text-muted-foreground">
                            Latitude
                        </h4>
                        <p>{branch.latitude ?? '-'}</p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h4 className="mb-2 font-semibold text-muted-foreground">
                            Longitude
                        </h4>
                        <p>{branch.longitude ?? '-'}</p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h4 className="mb-2 font-semibold text-muted-foreground">
                            Manager ID
                        </h4>
                        <p>{branch.manager_id ?? '-'}</p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h4 className="mb-2 font-semibold text-muted-foreground">
                            Created At
                        </h4>
                        <p>{new Date(branch.created_at).toLocaleString()}</p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h4 className="mb-2 font-semibold text-muted-foreground">
                            Last Updated
                        </h4>
                        <p>{new Date(branch.updated_at).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}

export default Show;
