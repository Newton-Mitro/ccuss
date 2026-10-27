import { User } from '@/modules/administration-security/types/user';
import { Branch } from '@/modules/branch-operations/types/branch';
import { SharedData } from '@/types';

export interface Props extends SharedData {
    user: User;
    branches: Branch[];
}
