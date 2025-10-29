import { Customer } from './customer';
import { Media } from './media';

export interface Signature {
    id: number;

    customer_id: number; // FK → customers.id
    signature_id: number; // FK → media.id

    created_at: string;
    updated_at: string;
}

export interface SignatureWithDetails extends Signature {
    customer?: Customer;
    media?: Media; // Corresponds to the 'signature' foreign key
}
