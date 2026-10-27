import type { User } from '@/modules/administration-security/types/user';
import type { SharedData } from '@/types';

export interface Props extends SharedData {
    user: User;
}
