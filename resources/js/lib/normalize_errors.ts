export function normalizeErrors(errors: Record<string, string>) {
    const result: any = {};
    const lines: any[] = [];

    Object.entries(errors || {}).forEach(([key, message]) => {
        const lineMatch = key.match(/^lines\.(\d+)\.(.+)$/);
        if (lineMatch) {
            const index = Number(lineMatch[1]);
            const field = lineMatch[2];
            lines[index] = lines[index] || {};
            lines[index][field] = message;
        } else {
            result[key] = message;
        }
    });

    if (lines.length > 0) result.lines = lines;
    return result;
}
