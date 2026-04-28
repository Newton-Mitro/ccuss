export interface Subledger {
    id: number;
    code: string;
    name: string;
    short_name?: string;
    subledger_type: string;
    subledger_sub_type: string;
    is_active: boolean;
    gl_account?: {
        id: number;
        name: string;
    };
}
