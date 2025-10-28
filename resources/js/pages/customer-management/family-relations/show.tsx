import { Head } from '@inertiajs/react';
import HeadingSmall from '../../../components/heading-small';
import { Card, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

interface Customer {
    id: number;
    name: string;
    customer_no: string;
}

interface FamilyRelation {
    id: number;
    customer: Customer;
    relative: Customer;
    relation_type: string;
}

interface ViewFamilyRelationProps {
    relation: FamilyRelation;
}

export default function View({ relation }: ViewFamilyRelationProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Family Relations', href: '/auth/family-relations' },
        { title: 'View Relation', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="View Family Relation" />

            <div className="animate-in space-y-8 px-4 py-6 text-foreground fade-in">
                <HeadingSmall
                    title="Family Relation Details"
                    description="View details of the customer-family relation."
                />

                <Card className="rounded-xl border border-border bg-card/80 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                    <CardContent className="space-y-6 p-8">
                        <div>
                            <Label>Customer</Label>
                            <div className="mt-1 text-sm text-foreground">
                                {relation.customer.name} (
                                {relation.customer.customer_no})
                            </div>
                        </div>

                        <div>
                            <Label>Relative</Label>
                            <div className="mt-1 text-sm text-foreground">
                                {relation.relative.name} (
                                {relation.relative.customer_no})
                            </div>
                        </div>

                        <div>
                            <Label>Relation Type</Label>
                            <div className="mt-1 text-sm text-foreground">
                                {relation.relation_type.replaceAll('_', ' ')}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomAuthLayout>
    );
}
