import { User } from '@/modules/administration-security/types/user';
import { Organization } from '@/modules/organization-settings/types/organization';
import { SharedData } from '@/types';

export interface Props extends SharedData {
    user: User;
    organizations: Organization[];
}
