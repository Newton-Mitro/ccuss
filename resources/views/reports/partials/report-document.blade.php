<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        @page { margin: 86px 30px 52px; }
        body { color: #1f2937; font-family: DejaVu Sans, sans-serif; font-size: 10px; }
        .page-header { border-bottom: 2px solid #0f766e; height: 58px; left: 0; position: fixed; right: 0; top: -58px; }
        .brand { background: #0f3d56; border-radius: 4px; color: #fff; float: left; font-size: 18px; font-weight: bold; height: 34px; line-height: 34px; margin-right: 10px; text-align: center; width: 34px; }
        .company { color: #0f3d56; font-size: 12px; font-weight: bold; margin-top: 1px; }
        .company-info { color: #64748b; font-size: 8px; margin-top: 3px; }
        .meta { background: #f0fdfa; border: 1px solid #99f6e4; border-left: 4px solid #0f766e; margin-bottom: 14px; padding: 9px 11px; }
        .meta-label { color: #0f766e; font-size: 8px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
        h1 { color: #0f3d56; font-size: 18px; margin: 3px 0; }
        p { color: #4b5563; margin: 2px 0; }
        .purpose { color: #475569; font-size: 9px; margin-top: 4px; }
        .summary { margin: 0 0 14px; width: 100%; }
        .summary td { background: #f8fafc; border: 1px solid #cbd5e1; padding: 7px 9px; width: 33%; }
        .summary-label { color: #64748b; font-size: 8px; text-transform: uppercase; }
        .summary-value { color: #0f3d56; font-size: 12px; font-weight: bold; margin-top: 2px; }
        table.detail { border-collapse: collapse; page-break-inside: auto; width: 100%; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; page-break-after: auto; }
        th { background: #0f3d56; color: #fff; font-weight: bold; text-align: left; }
        th, td { border: 1px solid #d1d5db; padding: 5px 6px; }
        .number { text-align: right; }
        .group { background: #dff7f3; color: #0f3d56; font-weight: bold; }
        .footer { border-top: 1px solid #cbd5e1; bottom: -32px; color: #64748b; font-size: 8px; left: 0; padding-top: 6px; position: fixed; right: 0; }
    </style>
</head>
<body>
    <div class="page-header">
        <div class="brand">{{ strtoupper(substr($organizationName, 0, 1)) }}</div>
        <div class="company">{{ $organizationName }}</div>
        @if($organizationInfo)<div class="company-info">{{ $organizationInfo }}</div>@endif
    </div>

    <div class="meta">
        <div class="meta-label">{{ $reportLabel }}</div>
        <h1>{{ $title }}</h1>
        <p class="purpose">{{ $purpose }}</p>
        <p>Generated {{ $generatedAt }}</p>
        @if($filters)<p><strong>Filters:</strong> {{ $filters }}</p>@endif
    </div>

    @if(count($summary ?? []))
        <table class="summary">
            <tr>
                @foreach($summary as $item)
                    <td><div class="summary-label">{{ $item['label'] }}</div><div class="summary-value">{{ $item['value'] }}</div></td>
                @endforeach
            </tr>
        </table>
    @endif

    <table class="detail">
        <thead>
            <tr>
                @foreach($headings as $heading)
                    <th>{{ $heading }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $row)
                <tr>
                    @foreach($row as $value)
                        <td class="{{ is_numeric($value) ? 'number' : '' }}">{{ $value }}</td>
                    @endforeach
                </tr>
            @empty
                <tr><td colspan="{{ count($headings) }}">No records found.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">{{ $title }} · Generated {{ $generatedAt }}</div>
    <script type="text/php">
        if (isset($pdf)) {
            $pdf->page_text(760, 570, "Page {PAGE_NUM} of {PAGE_COUNT}", null, 8, [0.4, 0.4, 0.4]);
        }
    </script>
</body>
</html>
