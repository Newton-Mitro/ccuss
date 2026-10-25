import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { appSwal } from '@/lib/appSwal';
import { router } from '@inertiajs/react';
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
        <div className="space-y-6">
            <HeadingSmall
                title="Delete account"
                description="Delete your account and all of its resources"
            />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4">
                <div className="relative space-y-0.5 text-red-600">
                    <p className="font-medium">Warning</p>
                    <p className="text-sm">
                        Please proceed with caution, this cannot be undone.
                    </p>
                </div>

                <Button
                    variant="destructive"
                    data-test="delete-user-button"
                    onClick={() => void confirmDelete()}
                >
                    Delete account
                </Button>
            </div>
        </div>
    );
}
