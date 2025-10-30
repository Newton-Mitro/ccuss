import { Head, Link } from '@inertiajs/react';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Customer } from '../../../types/customer';

interface ShowProps {
    customer: Customer;
}

function Show({ customer }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/auth/customers' },
        { title: 'Customer Details', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Customer - ${customer.name}`} />

            <div className="space-y-8 p-4 text-foreground">
                <HeadingSmall
                    title={`Customer Details`}
                    description="View complete customer information"
                />

                <div className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label>Customer No</Label>
                            <p className="rounded-md border border-border bg-muted/10 p-2">
                                {customer.customer_no}
                            </p>
                        </div>

                        <div>
                            <Label>Customer Type</Label>
                            <p className="rounded-md border border-border bg-muted/10 p-2">
                                {customer.type}
                            </p>
                        </div>

                        <div>
                            <Label>Name</Label>
                            <p className="rounded-md border border-border bg-muted/10 p-2">
                                {customer.name}
                            </p>
                        </div>

                        <div>
                            <Label>Phone</Label>
                            <p className="rounded-md border border-border bg-muted/10 p-2">
                                {customer.phone || '—'}
                            </p>
                        </div>

                        <div>
                            <Label>Email</Label>
                            <p className="rounded-md border border-border bg-muted/10 p-2">
                                {customer.email || '—'}
                            </p>
                        </div>

                        <div>
                            <Label>KYC Level</Label>
                            <p className="rounded-md border border-border bg-muted/10 p-2">
                                {customer.kyc_level}
                            </p>
                        </div>

                        <div>
                            <Label>Status</Label>
                            <p
                                className={`rounded-md border border-border p-2 font-medium ${
                                    customer.status === 'ACTIVE'
                                        ? 'text-green-600'
                                        : customer.status === 'SUSPENDED'
                                          ? 'text-yellow-600'
                                          : 'text-muted-foreground'
                                }`}
                            >
                                {customer.status}
                            </p>
                        </div>

                        <div>
                            <Label>Date of Birth</Label>
                            <p className="rounded-md border border-border bg-muted/10 p-2">
                                {customer.dob || '—'}
                            </p>
                        </div>

                        <div>
                            <Label>Gender</Label>
                            <p className="rounded-md border border-border bg-muted/10 p-2">
                                {customer.gender || '—'}
                            </p>
                        </div>

                        <div>
                            <Label>Religion</Label>
                            <p className="rounded-md border border-border bg-muted/10 p-2">
                                {customer.religion || '—'}
                            </p>
                        </div>

                        <div>
                            <Label>Identification Type</Label>
                            <p className="rounded-md border border-border bg-muted/10 p-2">
                                {customer.identification_type || '—'}
                            </p>
                        </div>

                        <div>
                            <Label>Identification Number</Label>
                            <p className="rounded-md border border-border bg-muted/10 p-2">
                                {customer.identification_number || '—'}
                            </p>
                        </div>

                        <div>
                            <Label>Photo</Label>
                            {customer.photo ? (
                                <img
                                    src={customer.photo.url}
                                    alt={customer.name}
                                    className="mt-2 h-28 w-28 rounded-md border border-border object-cover"
                                />
                            ) : (
                                <p className="rounded-md border border-border bg-muted/10 p-2">
                                    No photo available
                                </p>
                            )}
                        </div>

                        {customer.type === 'Organization' && (
                            <div className="md:col-span-2">
                                <Label>Registration No</Label>
                                <p className="rounded-md border border-border bg-muted/10 p-2">
                                    {customer.registration_no || '—'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="pt-4 text-sm text-muted-foreground">
                        <p>
                            Created:{' '}
                            <span className="text-foreground">
                                {customer.created_at || '—'}
                            </span>
                        </p>
                        <p>
                            Updated:{' '}
                            <span className="text-foreground">
                                {customer.updated_at || '—'}
                            </span>
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6">
                        <Link href={`/auth/customers/${customer.id}/edit`}>
                            <Button
                                variant="outline"
                                className="border-border text-foreground hover:bg-muted"
                            >
                                Edit Customer
                            </Button>
                        </Link>

                        <Link href="/auth/customers">
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                                Back to List
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}

export default Show;
