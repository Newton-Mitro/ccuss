import { FileDown, FileSpreadsheet, Printer } from 'lucide-react';
import { route } from 'ziggy-js';

interface Props {
    report: string;
    query?: Record<string, string | number | undefined | null>;
}

function exportUrl(report: string, format: string, query: Props['query']) {
    const params = new URLSearchParams();
    Object.entries(query ?? {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
        }
    });
    const queryString = params.toString();
    return `${route('reports.export', { report, format })}${queryString ? `?${queryString}` : ''}`;
}

export default function ReportExportActions({ report, query }: Props) {
    return (
        <div className="flex flex-wrap items-center gap-2 print:hidden">
            <a
                href={exportUrl(report, 'pdf', query)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1 rounded-md border bg-card px-3 text-xs font-medium hover:bg-muted"
            >
                <Printer className="h-4 w-4" /> PDF
            </a>
            <a
                href={exportUrl(report, 'xlsx', query)}
                className="inline-flex h-8 items-center gap-1 rounded-md border bg-card px-3 text-xs font-medium hover:bg-muted"
            >
                <FileSpreadsheet className="h-4 w-4" /> Excel
            </a>
            <a
                href={exportUrl(report, 'csv', query)}
                className="inline-flex h-8 items-center gap-1 rounded-md border bg-card px-3 text-xs font-medium hover:bg-muted"
            >
                <FileDown className="h-4 w-4" /> CSV
            </a>
        </div>
    );
}
