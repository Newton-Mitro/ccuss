import { Button } from '@/components/ui/button';
import { appSwal } from '@/lib/appSwal';
import { router } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import { route } from 'ziggy-js';

export default function DeleteUser() {
    const confirmDelete = async () => {
        await appSwal.fire({
            title: 'Are you sure you want to delete your account?',
            text: 'Once your account is deleted, all of its resources and data will also be permanently deleted. Enter your password to confirm.',
            icon: 'warning',
            input: 'password',
            inputLabel: 'Password',
            inputPlaceholder: 'Password',
            inputAttributes: {
                autocomplete: 'current-password',
            },
            inputValidator: (value) =>
                value.trim() ? undefined : 'Password is required.',
            showCancelButton: true,
            confirmButtonText: 'Delete account',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !appSwal.isLoading(),
            customClass: {
                confirmButton:
                    'bg-destructive border border-destructive text-destructive-foreground px-4 min-w-[80px] py-1 rounded-lg hover:opacity-80',
            },
            didOpen: () =>
                appSwal
                    .getConfirmButton()
                    ?.setAttribute('data-test', 'confirm-delete-user-button'),
            preConfirm: (password) =>
                new Promise<boolean>((resolve) => {
                    router.delete(route('profile.destroy'), {
                        data: { password },
                        preserveScroll: true,
                        onSuccess: () => resolve(true),
                        onError: (errors) => {
                            appSwal.showValidationMessage(
                                errors.password ??
                                    'The account could not be deleted. Please try again.',
                            );
                            resolve(false);
                        },
                    });
                }),
        });
    };

    return (
        <section className="overflow-hidden rounded-2xl border border-destructive/25 bg-card shadow-sm">
            <div className="flex items-center gap-3 border-b border-destructive/15 bg-destructive/[0.04] px-5 py-4 sm:px-6">
                <span className="flex size-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                    <ShieldAlert className="size-4" />
                </span>
                <div>
                    <h2 className="text-sm font-semibold">Delete account</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Permanently remove your account and its data.
                    </p>
                </div>
            </div>
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="max-w-xl text-xs leading-5 text-muted-foreground">
                    This action cannot be undone. Your account and associated
                    resources will be permanently deleted after confirmation.
                </p>
                <Button
                    variant="destructive"
                    data-test="delete-user-button"
                    onClick={() => void confirmDelete()}
                    className="shrink-0"
                >
                    Delete account
                </Button>
            </div>
        </section>
    );
}
