import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCheck,
    FileText,
    Globe,
    ImagePlus,
    Loader2,
    MapPin,
    Trash2,
    Upload,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import InputError from '../../../components/input-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

function EditOrganization() {
    const { organization } = usePage<any>().props;

    useFlashToastHandler();

    const { data, setData, processing, errors, setError } = useForm({
        code: organization.code || '',
        name: organization.name || '',
        short_name: organization.short_name || '',
        registration_no: organization.registration_no || '',
        tax_id: organization.tax_id || '',
        phone: organization.phone || '',
        email: organization.email || '',
        website: organization.website || '',
        address_line1: organization.address_line1 || '',
        address_line2: organization.address_line2 || '',
        city: organization.city || '',
        state: organization.state || '',
        postal_code: organization.postal_code || '',
        country: organization.country || '',
        logo_url: organization.logo_url || '',
        report_footer: organization.report_footer || '',
        logo: null as File | null,
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(
        organization.logo_url || null,
    );

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (photoPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, [photoPreview]);

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            window.alert('Please select a valid image file.');
            event.target.value = '';
            return;
        }

        if (file.size > 3 * 1024 * 1024) {
            window.alert('The logo must be smaller than 3 MB.');
            event.target.value = '';
            return;
        }

        setData('logo', file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const removeLogo = () => {
        setData('logo', null);
        setData('logo_url', '');
        setPhotoPreview(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post(
            route('organizations.update', organization.id),
            {
                ...data,
                _method: 'put',
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onError: (validationErrors) => {
                    setError(validationErrors);
                },
            },
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administrative Tasks', href: '' },
        { title: 'Organizations', href: route('organizations.index') },
        {
            title: organization.name,
            href: route('organizations.show', organization.id),
        },
        { title: 'Edit Organization', href: '' },
    ];

    type TextField = Exclude<keyof typeof data, 'logo'>;

    const renderField = (
        name: TextField,
        label: string,
        placeholder: string,
        options?: {
            type?: string;
            className?: string;
        },
    ) => (
        <div className={`min-w-0 space-y-1.5 ${options?.className ?? ''}`}>
            <Label
                htmlFor={name}
                className="text-xs font-semibold text-foreground/80"
            >
                {label}
            </Label>

            <Input
                id={name}
                type={options?.type ?? 'text'}
                value={data[name] as string}
                onChange={(event) => setData(name, event.target.value)}
                placeholder={placeholder}
                className="h-9 rounded-lg border-border/80 bg-background text-sm shadow-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/20"
            />

            <InputError message={errors[name]} />
        </div>
    );

    const sectionClass = 'rounded-xl border border-border/70 bg-card shadow-sm';

    const sectionHeaderClass =
        'flex items-center gap-3 border-b border-border/60 px-4 py-3 sm:px-5';

    const sectionBodyClass =
        'grid grid-cols-1 gap-x-4 gap-y-4 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-3';

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${organization.name}`} />

            <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-24 text-foreground">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <HeadingSmall
                        title="Edit Organization"
                        description="Update your organization's identity, contact details, branding, and reporting preferences."
                    />

                    <Button
                        type="button"
                        variant="outline"
                        className="h-9 w-fit gap-2 rounded-lg"
                        onClick={() =>
                            router.visit(
                                route('organizations.show', organization.id),
                            )
                        }
                    >
                        <ArrowLeft className="size-4" />
                        Back to Details
                    </Button>
                </div>

                {/* Organization summary */}
                <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center">
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-card">
                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt={`${organization.name} logo`}
                                className="size-full object-contain p-1.5"
                            />
                        ) : (
                            <Building2 className="size-5 text-muted-foreground" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                            {data.name || organization.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {data.code || 'Organization'}
                            {data.short_name ? ` · ${data.short_name}` : ''}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary sm:self-center">
                        <span className="size-1.5 rounded-full bg-primary" />
                        Editing organization
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Organization details */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Building2 className="size-4.5" />
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold">
                                    Organization Details
                                </h3>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Identity and registration information
                                </p>
                            </div>
                        </div>

                        <div className={sectionBodyClass}>
                            {renderField(
                                'name',
                                'Organization Name',
                                'e.g. Acme Corporation',
                                { className: 'md:col-span-2' },
                            )}

                            {renderField(
                                'short_name',
                                'Short Name',
                                'e.g. Acme',
                            )}

                            {renderField(
                                'code',
                                'Organization Code',
                                'e.g. ORG-001',
                            )}

                            {renderField(
                                'registration_no',
                                'Registration Number',
                                'Enter registration number',
                            )}

                            {renderField(
                                'tax_id',
                                'Tax Identification Number',
                                'Enter tax ID',
                            )}
                        </div>
                    </section>

                    {/* Branding */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <ImagePlus className="size-4.5" />
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold">
                                    Organization Branding
                                </h3>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Manage your logo and branding image
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 md:grid-cols-[180px_minmax(0,1fr)]">
                            <div className="space-y-2">
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === 'Enter' ||
                                            event.key === ' '
                                        ) {
                                            event.preventDefault();
                                            fileInputRef.current?.click();
                                        }
                                    }}
                                    className="group relative flex h-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 transition-colors hover:border-primary/60 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                                >
                                    {photoPreview ? (
                                        <>
                                            <img
                                                src={photoPreview}
                                                alt="Organization logo preview"
                                                className="size-full object-contain p-3"
                                            />

                                            <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                                                <span className="flex items-center gap-2 text-xs font-semibold">
                                                    <Upload className="size-4" />
                                                    Change logo
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Upload className="size-5" />
                                            </div>
                                            <span className="text-xs font-semibold">
                                                Upload logo
                                            </span>
                                            <span className="mt-1 text-[11px] text-muted-foreground">
                                                PNG, JPG or WebP
                                            </span>
                                        </>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    id="photoInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />

                                <p className="text-center text-[11px] text-muted-foreground">
                                    Maximum file size: 3 MB
                                </p>

                                <InputError message={errors.logo} />

                                {photoPreview && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={removeLogo}
                                        className="h-8 w-full gap-2 text-xs text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="size-3.5" />
                                        Remove logo
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
                                            <ImagePlus className="size-4" />
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold">
                                                Branding guidelines
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                Use a high-quality logo with
                                                clear edges. A transparent
                                                background is recommended for
                                                consistent display across
                                                reports and application screens.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {renderField(
                                    'logo_url',
                                    'Logo URL',
                                    'https://example.com/logo.png',
                                    { type: 'url' },
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Contact information */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Globe className="size-4.5" />
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold">
                                    Contact Information
                                </h3>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Official communication channels
                                </p>
                            </div>
                        </div>

                        <div className={sectionBodyClass}>
                            {renderField(
                                'phone',
                                'Phone Number',
                                '+880 1XXX-XXXXXX',
                                { type: 'tel' },
                            )}

                            {renderField(
                                'email',
                                'Email Address',
                                'contact@example.com',
                                { type: 'email' },
                            )}

                            {renderField(
                                'website',
                                'Website',
                                'https://example.com',
                                { type: 'url' },
                            )}
                        </div>
                    </section>

                    {/* Address */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <MapPin className="size-4.5" />
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold">
                                    Registered Address
                                </h3>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Official mailing and business address
                                </p>
                            </div>
                        </div>

                        <div className={sectionBodyClass}>
                            {renderField(
                                'address_line1',
                                'Address Line 1',
                                'Street address, building',
                                { className: 'md:col-span-2' },
                            )}

                            {renderField(
                                'address_line2',
                                'Address Line 2',
                                'Floor, suite, landmark (optional)',
                                { className: 'md:col-span-2' },
                            )}

                            {renderField('city', 'City', 'e.g. Dhaka')}

                            {renderField(
                                'state',
                                'State / Division',
                                'e.g. Dhaka Division',
                            )}

                            {renderField(
                                'postal_code',
                                'Postal Code',
                                'e.g. 1207',
                            )}

                            {renderField(
                                'country',
                                'Country',
                                'e.g. Bangladesh',
                            )}
                        </div>
                    </section>

                    {/* Report settings */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <FileText className="size-4.5" />
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold">
                                    Report Configuration
                                </h3>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Customize report footer information
                                </p>
                            </div>
                        </div>

                        <div className="p-4 sm:p-5">
                            {renderField(
                                'report_footer',
                                'Report Footer Text',
                                '© 2026 Your Organization. All rights reserved.',
                            )}

                            <p className="mt-2 text-xs text-muted-foreground">
                                This text can appear at the bottom of printed
                                reports and statements.
                            </p>
                        </div>
                    </section>

                    {/* Sticky actions */}
                    <div className="sticky bottom-0 z-20 -mx-3 border-t border-border/70 bg-background/95 px-3 py-3 backdrop-blur-md sm:-mx-5 sm:px-5 lg:-mx-6 lg:px-6">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-muted-foreground">
                                Changes will be saved to this organization.
                            </p>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={processing}
                                    onClick={() =>
                                        router.visit(
                                            route(
                                                'organizations.show',
                                                organization.id,
                                            ),
                                        )
                                    }
                                    className="h-10 gap-2 rounded-lg"
                                >
                                    <ArrowLeft className="size-4" />
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-10 gap-2 rounded-lg px-5 shadow-sm"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Saving changes...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCheck className="size-4" />
                                            Update Organization
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}

export default EditOrganization;
