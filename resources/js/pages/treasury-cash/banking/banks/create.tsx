import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function CreateBank() {
    const { organization } = usePage<{
        organization?: { id: number; name: string };
    }>().props;
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        short_name: '',
        status: true,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Banking', href: '' },
        { title: 'Banks', href: route('banks.index') },
        { title: 'Create', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Bank" />
            <div className="mx-auto max-w-2xl space-y-4">
                <div>
                    <h1 className="text-lg font-semibold">Create bank</h1>
                    <p className="text-sm text-muted-foreground">
                        Add a bank and its short code for the{' '}
                        {organization?.name ?? 'active organization'}.
                    </p>
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        post(route('banks.store'), {
                            preserveScroll: true,
                            preserveState: true,
                        });
                    }}
                    className="space-y-4 rounded-md border bg-card p-4"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="code">Bank code</Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(event) =>
                                    setData('code', event.target.value)
                                }
                            />
                            <InputError message={errors.code} />
                        </div>
                        <div>
                            <Label htmlFor="short_name">Short name</Label>
                            <Input
                                id="short_name"
                                value={data.short_name}
                                onChange={(event) =>
                                    setData('short_name', event.target.value)
                                }
                                placeholder="CB"
                            />
                            <InputError message={errors.short_name} />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="name">Bank name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="status"
                            type="checkbox"
                            checked={Boolean(data.status)}
                            onChange={(event) =>
                                setData('status', event.target.checked)
                            }
                        />
                        <Label htmlFor="status">Active</Label>
                    </div>

                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button asChild type="button" variant="outline">
                            <Link href={route('banks.index')}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Create bank'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
