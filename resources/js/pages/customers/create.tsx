import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import HeadingSmall from '../../components/heading-small';
import InputError from '../../components/input-error';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/text-area';
import CustomAuthLayout from '../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../types';

function Create() {
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
        gallery_ids: [] as number[],
        predefined: false,
    });

    const [errors] = useState<any>({});

    const handleChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/auth/customers' },
        { title: 'Add Customer', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Customer" />
            <div className="h-[calc(100vh-100px)] space-y-8 overflow-auto p-2 text-foreground md:p-4">
                <HeadingSmall
                    title="Create Customer"
                    description="Fill out details to create a new page"
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
                        {/* --- Basic Info --- */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label className="text-foreground">Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => {
                                        handleChange('title', e.target.value);
                                        handleChange(
                                            'slug',
                                            e.target.value
                                                .replace(/\s+/g, '-')
                                                .toLowerCase(),
                                        );
                                    }}
                                    placeholder="Customer title"
                                    className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div>
                                <Label className="text-foreground">Slug</Label>
                                <Input
                                    value={formData.slug}
                                    onChange={(e) =>
                                        handleChange('slug', e.target.value)
                                    }
                                    placeholder="unique-page-slug"
                                    className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div>
                                <Label className="text-foreground">
                                    Subtitle
                                </Label>
                                <Input
                                    value={formData.subtitle}
                                    onChange={(e) =>
                                        handleChange('subtitle', e.target.value)
                                    }
                                    placeholder="Optional subtitle"
                                    className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                                />
                                <InputError message={errors.subtitle} />
                            </div>

                            <div>
                                <Label className="text-foreground">
                                    Meta Title
                                </Label>
                                <Input
                                    value={formData.meta_title}
                                    onChange={(e) =>
                                        handleChange(
                                            'meta_title',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="SEO title"
                                    className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                                />
                                <InputError message={errors.meta_title} />
                            </div>

                            <div className="md:col-span-2">
                                <Label className="text-foreground">
                                    Meta Description
                                </Label>
                                <Textarea
                                    value={formData.meta_description}
                                    onChange={(e) =>
                                        handleChange(
                                            'meta_description',
                                            e.target.value,
                                        )
                                    }
                                    rows={3}
                                    className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                                />
                                <InputError message={errors.meta_description} />
                            </div>

                            <div className="md:col-span-2">
                                <Label className="text-foreground">
                                    Meta Keywords
                                </Label>
                                <Input
                                    value={formData.meta_keywords}
                                    onChange={(e) =>
                                        handleChange(
                                            'meta_keywords',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="keyword1, keyword2, keyword3"
                                    className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                                />
                                <InputError message={errors.meta_keywords} />
                            </div>
                        </div>

                        {/* --- Content --- */}
                        <div className="mt-4">
                            <Label className="text-foreground">Content</Label>
                            <div className="rounded-md border border-border bg-muted/10">
                                <CKEditor
                                    editor={ClassicEditor as any}
                                    data={formData.content}
                                    onChange={(_, editor) =>
                                        handleChange(
                                            'content',
                                            editor.getData(),
                                        )
                                    }
                                />
                            </div>
                            <InputError message={errors.content} />
                        </div>

                        {/* --- Excerpt --- */}
                        <div className="mt-4">
                            <Label className="text-foreground">Excerpt</Label>
                            <Textarea
                                rows={3}
                                value={formData.excerpt}
                                onChange={(e) =>
                                    handleChange('excerpt', e.target.value)
                                }
                                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                            />
                            <InputError message={errors.excerpt} />
                        </div>

                        {/* --- JSON Array --- */}
                        <div className="mt-4">
                            <Label className="text-foreground">
                                JSON Array
                            </Label>
                            <Textarea
                                rows={5}
                                value={formData.json_array}
                                onChange={(e) =>
                                    handleChange('json_array', e.target.value)
                                }
                                placeholder='[{"title":"Example","subtitle":"Example Subtitle"}]'
                                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                            />
                            <InputError message={errors.json_array} />
                        </div>

                        {/* --- Button --- */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label className="text-foreground">
                                    Button Text
                                </Label>
                                <Input
                                    value={formData.button_text}
                                    onChange={(e) =>
                                        handleChange(
                                            'button_text',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. Learn More"
                                    className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                                />
                                <InputError message={errors.button_text} />
                            </div>
                            <div>
                                <Label className="text-foreground">
                                    Button Link
                                </Label>
                                <Input
                                    value={formData.button_link}
                                    onChange={(e) =>
                                        handleChange(
                                            'button_link',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="https://example.com"
                                    className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                                />
                                <InputError message={errors.button_link} />
                            </div>
                        </div>

                        {/* --- Gallery Images --- */}
                        <div className="mt-6">
                            <Label className="text-foreground">
                                Gallery Images
                            </Label>
                            <div className="mt-2 flex flex-wrap gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-border text-foreground hover:bg-muted"
                                    onClick={() => {}}
                                >
                                    + Add Images
                                </Button>
                            </div>
                            <InputError message={errors.gallery_ids} />
                        </div>

                        {/* --- Submit --- */}
                        <div className="mt-6 flex gap-4">
                            <Button
                                type="submit"
                                className="bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Create Customer
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}

export default Create;
