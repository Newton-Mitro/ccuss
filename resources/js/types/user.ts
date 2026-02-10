import { AuditFields } from './base_types';

export interface User extends AuditFields {
    id: number;

    name: string;
    email: string;
    email_verified_at: string | null;

    password: string;

    two_factor_secret: string | null;
    two_factor_recovery_codes: string | null;
    two_factor_confirmed_at: string | null;

    created_at: string;
    updated_at: string;
}
