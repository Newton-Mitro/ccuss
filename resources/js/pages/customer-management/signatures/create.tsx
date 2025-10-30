import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CustomerSearch } from '../../../components/customer-search';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { MediaSelector } from '../../../components/media-selector';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import { Media } from '../../../types/media';
import MediaBrowserModal from '../../media/media_browser_modal';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: null as number | null,
        signature_id: null as number | null,
        customer_name: '',
    });

    const [query, setQuery] = useState('');
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleMediaSelect = (media: Media) => {
        setSelectedMedia(media);
        setData('signature_id', media.id);
        setIsModalOpen(false);
    };

    const handleMediaRemove = () => {
        setSelectedMedia(null);
        setData('signature_id', null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/auth/signatures', {
            preserveScroll: true,
            onSuccess: () => toast.success('Signature saved successfully!'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Signatures', href: '/auth/signatures' },
        { title: 'Add Signature', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Signature" />

            <div className="animate-in space-y-8 px-4 py-6 text-foreground fade-in">
                <HeadingSmall
                    title="Add Signature"
                    description="Select a customer and upload or select a signature."
                />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-xl border border-border bg-card/80 p-8 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                >
                    {/* Customer Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary">
                            Customer
                        </h3>
                        <div className="mt-2">
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

                        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <Label>Customer ID</Label>
                                <Input
                                    value={data.customer_id}
                                    disabled
                                    className="bg-disabled mt-1 cursor-not-allowed"
                                />
                                <InputError message={errors.customer_id} />
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
                    </div>

                    {/* Signature Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary">
                            Signature
                        </h3>
                        <div className="mt-2">
                            <MediaSelector
                                label="Select Signature"
                                media={selectedMedia}
                                onSelect={() => setIsModalOpen(true)}
                                onRemove={handleMediaRemove}
                                error={errors.signature_id}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                        >
                            {processing ? 'Saving...' : 'Save Signature'}
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
