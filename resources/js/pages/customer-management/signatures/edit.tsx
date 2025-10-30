import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CustomerSearch } from '../../../components/customer-search';
import HeadingSmall from '../../../components/heading-small';
import { MediaSelector } from '../../../components/media-selector';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Media } from '../../../types/media';
import { SignatureWithDetails } from '../../../types/signature';
import MediaBrowserModal from '../../media/media_browser_modal';

interface SignatureEditProps {
    signature: SignatureWithDetails;
}

interface SignatureFormData {
    customer_id: number | null;
    customer_name: string | null;
    signature_id: number | null;
}

export default function EditSignature({ signature }: SignatureEditProps) {
    console.log('Signature:', signature);
    const { data, setData, put, processing, errors } =
        useForm<SignatureFormData>({
            customer_id: signature.customer_id,
            customer_name: signature?.customer?.name || '',
            signature_id: signature.signature?.id || null,
        });

    const [selectedMedia, setSelectedMedia] = useState<Media | null>(
        signature.signature || null,
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [query, setQuery] = useState(signature.customer?.name || '');

    const handleMediaSelect = (media: Media) => {
        setSelectedMedia(media);
        setData('signature_id', media.id);
        setIsModalOpen(false);
    };

    const handleMediaRemove = () => {
        setSelectedMedia(null);
        setData('signature_id', null);
    };

    // inside your component
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/auth/signatures/${signature.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Signature updated successfully!');
            },
            onError: (errors) => {
                toast.error('Failed to update the signature.');
                console.error(errors);
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Signatures', href: '/auth/signatures' },
        { title: 'Edit Signature', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Signature" />
            <div className="animate-in space-y-8 text-foreground fade-in">
                <HeadingSmall
                    title="Edit Signature"
                    description="Update the customer or signature file."
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-xl border border-border bg-card/80 p-8 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                >
                    {/* Customer Autocomplete */}
                    <div className="">
                        <Label>Customer</Label>
                        <CustomerSearch
                            query={query}
                            onQueryChange={setQuery}
                            onSelect={(customer) => {
                                setData('customer_id', customer.id);
                                setData('customer_name', customer.name);
                                setQuery(customer.name);
                            }}
                        />
                    </div>

                    {/* Disabled Inputs for Selected Customer */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <Label>Customer ID</Label>
                            <Input
                                value={data.customer_id}
                                disabled
                                className="bg-disabled mt-1 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <Label>Customer Name</Label>
                            <Input
                                value={data.customer_name}
                                disabled
                                className="bg-disabled mt-1 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Media Selector */}
                    <div>
                        <MediaSelector
                            label="Signature"
                            media={selectedMedia}
                            onSelect={() => setIsModalOpen(true)}
                            onRemove={handleMediaRemove}
                            error={errors.signature_id}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                        >
                            {processing ? 'Saving...' : 'Update Signature'}
                        </Button>
                    </div>
                </form>

                {/* Media Browser Modal */}
                <MediaBrowserModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSelect={handleMediaSelect}
                />
            </div>
        </CustomAuthLayout>
    );
}
