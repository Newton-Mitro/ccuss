export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page?: number;
    per_page?: number;
    last_page?: number;
    total?: number;
    links?: PaginationLink[];
}
