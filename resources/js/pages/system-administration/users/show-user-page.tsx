import { Head, usePage } from '@inertiajs/react';
import HeadingSmall from '../../../components/heading-small';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '../../../components/ui/avatar';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import { useInitials } from '../../../hooks/use-initials';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';
import InfoItem from '../organizations/info-item';

function ShowUser() {
    const { user } = usePage<any>().props;
    useFlashToastHandler();

    const getInitials = useInitials();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Users', href: '/users' },
        { title: 'User Details', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="User Details" />

            <div className="space-y-4 text-foreground">
                <HeadingSmall
                    title="User Details"
                    description="Comprehensive overview of the user profile."
                />

                {/* 🔹 Header Card */}
                <div className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
                    <Avatar className="h-18 w-18 overflow-hidden rounded-full">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="rounded-lg bg-muted text-sm text-muted-foreground">
                            {getInitials(user?.name)}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <h2 className="text-lg font-semibold">{user.name}</h2>
                        <p className="text-xs text-muted-foreground">
                            {user.email}
                        </p>
                        <div className="mt-1 text-xs text-muted-foreground">
                            <div className="flex flex-wrap gap-2">
                                {user.roles.length > 0
                                    ? user.roles.map((role) => (
                                          <span
                                              key={role.id}
                                              className="py-.5 rounded-full bg-warning px-2 text-xs font-medium text-warning-foreground"
                                          >
                                              {role.name}
                                          </span>
                                      ))
                                    : '-'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🔹 Basic Info */}
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                    <h3 className="text-md mb-2 font-semibold text-info">
                        Basic Info
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <InfoItem label="Name" value={user.name} />
                        <InfoItem label="Email" value={user.email} />
                        <InfoItem
                            label="Email Verified"
                            value={user.email_verified_at ? 'Yes' : 'No'}
                        />
                        <InfoItem
                            label="Organization"
                            value={user.organization?.name || '-'}
                        />
                        <InfoItem
                            label="Branch"
                            value={user.branch?.name || '-'}
                        />
                    </div>
                </div>

                {/* 🔹 Permissions */}
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                    <h3 className="text-md mb-2 font-semibold text-info">
                        Permissions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {user.permissions && user.permissions.length > 0
                            ? user.permissions.map((perm) => (
                                  <span
                                      key={perm.id}
                                      className="rounded bg-accent/30 px-2 py-1 text-xs font-medium text-accent-foreground"
                                  >
                                      {perm.name}
                                  </span>
                              ))
                            : '-'}
                    </div>
                </div>
            </div>
        </CustomAuthLayout>
    );
}

export default ShowUser;
