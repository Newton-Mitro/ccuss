import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Building2, ChevronsUpDown, Plus } from 'lucide-react';
import { route } from 'ziggy-js';

export function OrganizationSwitcher() {
    const { organization } = usePage<SharedData>().props;
    const { state } = useSidebar();

    const activeOrganization = organization.active;
    const availableOrganizations = organization.available ?? [];

    const selectOrganization = (value: string) => {
        router.post(
            route('organizations.select.store'),
            { organization_id: Number(value) },
            { preserveScroll: true },
        );
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group data-[state=open]:bg-sidebar-accent"
                            tooltip="Switch organization"
                        >
                            <Building2 className="size-4 shrink-0" />
                            <span className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
                                <span className="block truncate text-xs text-muted-foreground">
                                    Organization
                                </span>
                                <span className="block truncate font-medium">
                                    {activeOrganization?.name ??
                                        'Select organization'}
                                </span>
                            </span>
                            <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        side={state === 'collapsed' ? 'right' : 'bottom'}
                        className="w-64"
                    >
                        <DropdownMenuLabel>
                            Active organization
                        </DropdownMenuLabel>
                        {availableOrganizations.length > 0 ? (
                            <DropdownMenuRadioGroup
                                value={activeOrganization?.id?.toString()}
                                onValueChange={selectOrganization}
                            >
                                {availableOrganizations.map(
                                    (organizationOption) => (
                                        <DropdownMenuRadioItem
                                            key={organizationOption.id}
                                            value={organizationOption.id.toString()}
                                        >
                                            <span className="min-w-0">
                                                <span className="block truncate">
                                                    {organizationOption.name}
                                                </span>
                                                <span className="block text-xs text-muted-foreground">
                                                    {organizationOption.code}
                                                </span>
                                            </span>
                                        </DropdownMenuRadioItem>
                                    ),
                                )}
                            </DropdownMenuRadioGroup>
                        ) : (
                            <DropdownMenuItem asChild>
                                <Link href={route('organizations.create')}>
                                    <Plus className="size-4" />
                                    Create organization
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {availableOrganizations.length > 0 && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={route('organizations.create')}>
                                        <Plus className="size-4" />
                                        Create organization
                                    </Link>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
