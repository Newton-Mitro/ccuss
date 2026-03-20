import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '../../../types';
import { KycProfile } from '../../../types/customer_kyc_module';

export default function KycProfilesShow() {
    const { props } = usePage<
        SharedData & {
            profile: KycProfile;
            kyc_documents: any[];
        }
    >();

    const { profile, kyc_documents } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'KYC Profiles', href: '/kyc-profiles' },
        {
            title: `Profile #${profile.id}`,
            href: `/kyc-profiles/${profile.id}`,
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`KYC Profile #${profile.id}`} />

            <div className="space-y-4 p-2">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title={`KYC Profile #${profile.id}`}
                        description="View full customer KYC profile details."
                    />
                    <Link
                        href="/kyc-profiles"
                        className="flex items-center gap-2 rounded bg-muted px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/80"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                </div>

                {/* Customer Info */}
                <div className="space-y-2 rounded-md border bg-card p-4">
                    <h3 className="text-lg font-semibold">Customer Info</h3>
                    <p>
                        <span className="font-medium">Name:</span>{' '}
                        {profile.customer?.name ?? '—'}
                    </p>
                    <p>
                        <span className="font-medium">Email:</span>{' '}
                        {profile.customer?.email ?? '—'}
                    </p>
                    <p>
                        <span className="font-medium">Phone:</span>{' '}
                        {profile.customer?.phone ?? '—'}
                    </p>
                </div>

                {/* KYC Info */}
                <div className="space-y-2 rounded-md border bg-card p-4">
                    <h3 className="text-lg font-semibold">KYC Details</h3>
                    <p>
                        <span className="font-medium">KYC Level:</span>{' '}
                        {profile.kyc_level}
                    </p>
                    <p>
                        <span className="font-medium">Risk Level:</span>{' '}
                        {profile.risk_level}
                    </p>
                    <p>
                        <span className="font-medium">
                            Verification Status:
                        </span>{' '}
                        {profile.verification_status}
                    </p>
                    <p>
                        <span className="font-medium">Verified By:</span>{' '}
                        {profile.verifier?.name ?? '—'}
                    </p>
                    <p>
                        <span className="font-medium">Verified At:</span>{' '}
                        {profile.verified_at ?? '—'}
                    </p>
                    {profile.remarks && (
                        <p>
                            <span className="font-medium">Remarks:</span>{' '}
                            {profile.remarks}
                        </p>
                    )}
                </div>

                {/* Documents */}
                {kyc_documents.length > 0 && (
                    <div className="space-y-2 rounded-md border bg-card p-4">
                        <h3 className="text-lg font-semibold">Documents</h3>
                        <ul className="list-disc space-y-1 pl-5">
                            {kyc_documents.map((doc) => (
                                <li key={doc.id}>
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        className="text-primary underline"
                                    >
                                        {doc.document_type} ({doc.file_name})
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <Link
                        href={`/kyc-profiles/${profile.id}/edit`}
                        className="rounded bg-accent px-3 py-2 text-sm text-primary-foreground hover:bg-accent/90"
                    >
                        Edit Profile
                    </Link>
                    <Link
                        href="/kyc-profiles"
                        className="rounded border px-3 py-2 text-sm text-muted-foreground hover:bg-muted/80"
                    >
                        Back to List
                    </Link>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
