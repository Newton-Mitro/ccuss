import { User } from '@/modules/administration-security/types/user';

export interface UserSearchBoxProps {
    onSelect: (user: User) => void;
    label?: string;
    selectedUser?: User;
    placeholder?: string;
}
