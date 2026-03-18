import { User } from './user';

export type PageProps<T = Record<string, unknown>> = T & {
    auth: {
        user?: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
};
