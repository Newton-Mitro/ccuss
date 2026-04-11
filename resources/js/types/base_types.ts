export type ID = number;
export type Timestamp = string; // ISO 8601

export interface Timestamped {
    created_at: Timestamp;
    updated_at: Timestamp;
}

export type ModalMode = 'create' | 'edit' | 'view';
