export interface Paginated<T> {
    data: T[];
    current_page: number;
    per_page: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}
