export interface Media {
    id?: number | string;
    url: string;
    file_type?: string | null;
    alt_text?: string | null;
    name?: string | null;
    mime_type?: string | null;
    size?: number | string | null;
    created_at?: string | null;
    updated_at?: string | null;
}
