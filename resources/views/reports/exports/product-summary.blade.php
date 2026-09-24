<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Product summary</title>
    <style>
        @page { margin: 106px 36px 48px; }
        body { color: #172554; font: 9px DejaVu Sans, sans-serif; }
        .header { border-bottom: 2px solid #134686; height: 88px; left: 0; position: fixed; right: 0; text-align: center; top: -88px; }
        .logo { display: block; height: 22px; margin: 0 auto 2px; max-width: 90px; }
        .brand { background: #134686; border-radius: 4px; color: #fff; display: inline-block; font-weight: bold; height: 22px; line-height: 22px; width: 22px; }
        .org { color: #172554; font-size: 12px; font-weight: bold; }
        .info { color: #64748b; font-size: 8px; margin-top: 2px; }
        .report-heading { margin: 10px auto 12px; padding: 2px 0 6px; text-align: center; width: 88%; }
        .eyebrow { color: #134686; font-size: 8px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
        h1 { color: #172554; font-size: 18px; margin: 3px 0; }
        p { color: #64748b; margin: 2px 0; }
        table { border-collapse: collapse; width: 100%; }
        .page-gap th { background: transparent; border: 0; height: 14px; padding: 0; }
        th { background: #134686; color: #fff; text-align: left; }
        th, td { border: 1px solid #dbe3ee; padding: 6px 8px; }
        tbody tr:nth-child(even) { background: #f8fafc; }
        th:first-child { width: 38%; }
        th:nth-child(2) { width: 27%; }
        th:nth-child(3), th:nth-child(4) { text-align: right; }
        .number { text-align: right; }
        .product { font-weight: bold; }
        .footer { border-top: 1px solid #dbe3ee; bottom: -28px; color: #64748b; font-size: 8px; left: 0; padding-top: 5px; position: fixed; right: 0; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        @if($organizationLogoPath && file_exists($organizationLogoPath))
            <img class="logo" src="{{ $organizationLogoPath }}" alt="{{ $organizationName }}">
        @else
            <div class="brand">{{ strtoupper(substr($organizationName, 0, 1)) }}</div>
        @endif
        <div class="org">{{ $organizationName }}</div>
        @if($organizationAddress)<div class="info">{{ $organizationAddress }}</div>@endif
        @if($organizationContact)<div class="info">{{ $organizationContact }}</div>@endif
    </div>

    <div class="report-heading">
        <div class="eyebrow">Financial Services · Product Analysis</div>
        <h1>Product summary</h1>
        <p>Accounts and balances grouped by financial product.</p>
        <p>Generated {{ $generatedAt }}</p>
    </div>

    <table>
        <thead>
            <tr class="page-gap"><th colspan="4"></th></tr>
            <tr><th>Product</th><th>Category</th><th class="number">Accounts</th><th class="number">Balance</th></tr>
        </thead>
        <tbody>
            @forelse($rows as $row)
                <tr>
                    <td class="product">{{ $row[0] }} · {{ $row[1] }}</td>
                    <td>{{ $row[2] }}</td>
                    <td class="number">{{ number_format((int) $row[3]) }}</td>
                    <td class="number">{{ number_format((float) $row[4], 4) }}</td>
                </tr>
            @empty
                <tr><td colspan="4">No products found.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">{{ $organizationFooter ? $organizationFooter . ' · ' : '' }}Product summary · Generated {{ $generatedAt }}</div>
    <script type="text/php">if (isset($pdf)) { $pdf->page_text(540, 570, "Page {PAGE_NUM} of {PAGE_COUNT}", null, 8, [0.4, 0.4, 0.4]); }</script>
</body>
</html>
