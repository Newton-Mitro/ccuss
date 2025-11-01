import { Head } from '@inertiajs/react';
import HeadingSmall from '../../../components/heading-small';
import { Card, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { FamilyRelation } from '../../../types/family_relation';

interface ViewFamilyRelationProps {
    familyRelation: FamilyRelation;
}

export default function View({ familyRelation }: ViewFamilyRelationProps) {
    console.log(familyRelation);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Family Relations', href: '/auth/family-relations' },
        { title: 'View Relation', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="View Family Relation" />

            <div className="animate-in space-y-8 text-foreground fade-in">
                <HeadingSmall
                    title="Family Relation Details"
                    description="View details of the customer-family relation."
                />

                <Card className="rounded-xl border border-border bg-card/80 shadow backdrop-blur-sm transition-all duration-300">
                    <CardContent className="space-y-6 p-8">
                        <div>
                            <Label>Customer</Label>
                            <div className="mt-1 text-sm text-foreground">
                                {familyRelation.customer.name} (
                                {familyRelation.customer.customer_no})
                            </div>
                        </div>

                        <div>
                            <Label>Relative</Label>
                            <div className="mt-1 text-sm text-foreground">
                                {familyRelation.relative.name} (
                                {familyRelation.relative.customer_no})
                            </div>
                        </div>

                        <div>
                            <Label>Relation Type</Label>
                            <div className="mt-1 text-sm text-foreground">
                                {familyRelation.relation_type.replaceAll(
                                    '_',
                                    ' ',
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomAuthLayout>
    );
}
