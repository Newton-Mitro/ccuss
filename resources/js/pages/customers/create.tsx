import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import HeadingSmall from '../../components/heading-small';
import InputError from '../../components/input-error';
import { MediaSelector } from '../../components/media-selector';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/text-area';
import AppLayout from '../../layouts/app-layout';
import { BreadcrumbItem } from '../../types';
import { Media } from '../../types/media';
import { PaginatedData } from '../../types/paginated_meta';
import MediaBrowserModal from '../media/media_browser_modal';

interface CreateProps {
    media: PaginatedData<Media>;
}

const Create: React.FC<CreateProps> = ({ media }) => {
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        slug: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        content: '',
        excerpt: '',
        json_array: '',
        button_text: '',
        button_link: '',
        media_id: null as number | null,
        gallery_ids: [] as number[], // ✅ Added gallery images array
        predefined: false,
    });

    const [errors, setErrors] = useState<any>({});
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const [galleryItems, setGalleryMedia] = useState<Media[]>([]); // ✅ Added for gallery
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'featured' | 'gallery'>('featured'); // ✅ Mode toggle

    // --- Handle Change ---
    const handleChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    // --- Handle Submit with SweetAlert ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let jsonString = '';

        // ✅ Validate JSON syntax (but send as string)
        if (formData.json_array && typeof formData.json_array === 'string' && formData.json_array.trim() !== '') {
            try {
                JSON.parse(formData.json_array); // ✅ validation only
                jsonString = formData.json_array.trim(); // ✅ send raw JSON string
            } catch (error) {
                console.error('Invalid JSON string:', error);
                toast.error('Invalid JSON format in "JSON Array" field.');
                return; // stop submission
            }
        }

        router.post(
            '/admin/pages',
            {
                ...formData,
                json_array: jsonString, // ✅ send JSON string (not parsed)
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Page created successfully!');
                    router.visit('/admin/pages');
                },
                onError: (err) => {
                    setErrors(err);
                    toast.error('Error creating page. Please try again.');
                },
            },
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pages', href: '/admin/pages' },
        { title: 'Create Page', href: '' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Page" />
            <div className="h-[calc(100vh-100px)] space-y-8 overflow-auto p-6">
                <HeadingSmall title="Create Page" description="Fill out details to create a new page" />

                <form onSubmit={handleSubmit} className="space-y-6 md:w-4xl">
                    <div className="space-y-6 rounded-lg border bg-white p-6 dark:bg-gray-900">
                        {/* --- Basic Info --- */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => {
                                        handleChange('title', e.target.value);
                                        handleChange('slug', e.target.value.replace(/\s+/g, '-').toLowerCase());
                                    }}
                                    placeholder="Page title"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div>
                                <Label>Slug</Label>
                                <Input value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} placeholder="unique-page-slug" />
                                <InputError message={errors.slug} />
                            </div>

                            <div>
                                <Label>Subtitle</Label>
                                <Input
                                    value={formData.subtitle}
                                    onChange={(e) => handleChange('subtitle', e.target.value)}
                                    placeholder="Optional subtitle"
                                />
                                <InputError message={errors.subtitle} />
                            </div>

                            <div>
                                <Label>Meta Title</Label>
                                <Input
                                    value={formData.meta_title}
                                    onChange={(e) => handleChange('meta_title', e.target.value)}
                                    placeholder="SEO title"
                                />
                                <InputError message={errors.meta_title} />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Meta Description</Label>
                                <Textarea
                                    value={formData.meta_description}
                                    onChange={(e) => handleChange('meta_description', e.target.value)}
                                    rows={3}
                                />
                                <InputError message={errors.meta_description} />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Meta Keywords</Label>
                                <Input
                                    value={formData.meta_keywords}
                                    onChange={(e) => handleChange('meta_keywords', e.target.value)}
                                    placeholder="keyword1, keyword2, keyword3"
                                />
                                <InputError message={errors.meta_keywords} />
                            </div>
                        </div>

                        {/* --- Content --- */}
                        <div className="mt-4">
                            <Label>Content</Label>
                            <CKEditor
                                editor={ClassicEditor as any}
                                data={formData.content}
                                onChange={(_, editor) => handleChange('content', editor.getData())}
                            />
                            <InputError message={errors.content} />
                        </div>

                        {/* --- Excerpt --- */}
                        <div className="mt-4">
                            <Label>Excerpt</Label>
                            <Textarea rows={3} value={formData.excerpt} onChange={(e) => handleChange('excerpt', e.target.value)} />
                            <InputError message={errors.excerpt} />
                        </div>

                        {/* --- JSON Array --- */}
                        <div className="mt-4">
                            <Label>JSON Array</Label>
                            <Textarea
                                rows={5}
                                value={formData.json_array}
                                onChange={(e) => handleChange('json_array', e.target.value)}
                                placeholder='[{"title":"Example","subtitle":"Example Subtitle"}]'
                            />
                            <InputError message={errors.json_array} />
                        </div>

                        {/* --- Button --- */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label>Button Text</Label>
                                <Input
                                    value={formData.button_text}
                                    onChange={(e) => handleChange('button_text', e.target.value)}
                                    placeholder="e.g. Learn More"
                                />
                                <InputError message={errors.button_text} />
                            </div>
                            <div>
                                <Label>Button Link</Label>
                                <Input
                                    value={formData.button_link}
                                    onChange={(e) => handleChange('button_link', e.target.value)}
                                    placeholder="https://example.com"
                                />
                                <InputError message={errors.button_link} />
                            </div>
                        </div>

                        {/* --- Featured Image --- */}
                        <div className="mt-4">
                            <MediaSelector
                                label="Featured Image"
                                media={selectedMedia}
                                onSelect={() => {
                                    setModalMode('featured');
                                    setIsModalOpen(true);
                                }}
                                onRemove={() => {
                                    setSelectedMedia(null);
                                    handleChange('media_id', null);
                                }}
                                error={errors.media_id}
                            />
                        </div>

                        {/* --- Gallery Images --- */}
                        <div className="mt-6">
                            <Label>Gallery Images</Label>
                            <div className="mt-2 flex flex-wrap gap-3">
                                {galleryItems.map((item) => (
                                    <div key={item.id} className="group relative">
                                        <img src={item.url} alt={item.alt_text || 'media'} className="h-24 w-24 rounded-md border object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = galleryItems.filter((m) => m.id !== item.id);
                                                setGalleryMedia(updated);
                                                handleChange(
                                                    'gallery_ids',
                                                    updated.map((i) => i.id),
                                                );
                                            }}
                                            className="absolute -top-2 -right-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setModalMode('gallery');
                                        setIsModalOpen(true);
                                    }}
                                >
                                    + Add Images
                                </Button>
                            </div>
                            <InputError message={errors.gallery_ids} />
                        </div>

                        {/* --- Submit --- */}
                        <div className="mt-6 flex gap-4">
                            <Button type="submit">Create Page</Button>
                        </div>
                    </div>
                </form>
            </div>

            <MediaBrowserModal
                actionType="create"
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                media={media}
                onSelect={(m) => {
                    if (modalMode === 'featured') {
                        setSelectedMedia(m);
                        handleChange('media_id', m.id);
                    } else {
                        const updated = [...galleryItems, m];
                        setGalleryMedia(updated);
                        handleChange(
                            'gallery_ids',
                            updated.map((i) => i.id),
                        );
                    }
                    setIsModalOpen(false);
                }}
            />
        </AppLayout>
    );
};

export default Create;
