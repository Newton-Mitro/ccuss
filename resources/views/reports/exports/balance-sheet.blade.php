<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Balance Sheet Report</title>
    <style>
        @page { margin: 106px 42px 48px; }
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
        th, td { border: 1px solid #dbe3ee; padding: 5px 6px; }
        tbody tr.account:nth-child(even) { background: #f8fafc; }
        .group { background: #eef4fb; color: #172554; font-weight: bold; }
        .total, .grand-total { background: #f8fafc; font-weight: bold; }
        .number { text-align: right; }
        th:first-child { width: 28%; }
        th:nth-child(2) { width: 52%; }
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
        <div class="eyebrow">General Accounting · Financial Position</div>
        <h1>Balance Sheet Report</h1>
        <p>Assets = Liabilities + Equity</p>
        <p>Generated {{ $generatedAt }}@if($filters) · {{ $filters }}@endif</p>
    </div>

    @php
        $groupedRows = collect($rows)->groupBy(fn ($row) => $row[0] ?: 'Other');
        $totalBalance = collect($rows)->sum(fn ($row) => (float) ($row[2] ?? 0));
        $money = fn ($amount) => 'BDT ' . number_format((float) $amount, 2);
    @endphp

    <table>
        <thead>
            <tr class="page-gap"><th colspan="3"></th></tr>
            <tr><th>Category</th><th>Account Name</th><th class="number">Balance</th></tr>
        </thead>
        @forelse($groupedRows as $category => $categoryRows)
            @php $categoryTotal = $categoryRows->sum(fn ($row) => (float) ($row[2] ?? 0)); @endphp
            <tbody>
                <tr class="group"><td colspan="3">{{ $category }}</td></tr>
                @foreach($categoryRows as $row)
                    <tr class="account"><td>{{ $row[0] }}</td><td>{{ $row[1] }}</td><td class="number">{{ $money($row[2]) }}</td></tr>
                @endforeach
                <tr class="total"><td colspan="2">{{ $category }} Total</td><td class="number">{{ $money($categoryTotal) }}</td></tr>
            </tbody>
        @empty
            <tbody><tr><td colspan="3">No accounts found.</td></tr></tbody>
        @endforelse
        <tfoot><tr class="grand-total"><td colspan="2">Total</td><td class="number">{{ $money($totalBalance) }}</td></tr></tfoot>
    </table>

    <div class="footer">{{ $organizationFooter ? $organizationFooter . ' · ' : '' }}Balance Sheet Report · Generated {{ $generatedAt }}</div>
    <script type="text/php">if (isset($pdf)) { $pdf->page_text(540, 570, "Page {PAGE_NUM} of {PAGE_COUNT}", null, 8, [0.4, 0.4, 0.4]); }</script>
</body>
</html>
