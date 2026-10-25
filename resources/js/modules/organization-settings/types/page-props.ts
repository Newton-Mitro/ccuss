import type { Branch } from '@/modules/branch-operations/types/branch';
import type { Organization } from '@/modules/organization-settings/types/organization';
import type { SharedData } from '@/types';

export interface OrganizationShowPageProps extends Omit<
    SharedData,
    'organization'
> {
    organization: Organization & { branches: Branch[] };
}
