function parseDate(value: string): Date {
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (dateOnly) {
        return new Date(
            Number(dateOnly[1]),
            Number(dateOnly[2]) - 1,
            Number(dateOnly[3]),
        );
    }

    return new Date(value);
}

function formatDate(value?: string | null) {
    if (!value) return '—';

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
    }).format(parseDate(value));
}

function formatDateTime(value?: string | null) {
    if (!value) return '—';

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(parseDate(value));
}

export { formatDate, formatDateTime };
