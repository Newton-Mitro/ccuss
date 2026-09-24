<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<title>Trial Balance</title>
	<style>
		@page { margin: 106px 32px 48px; }
		body { color: #172554; font-family: DejaVu Sans, sans-serif; font-size: 9px; }
		.header { border-bottom: 2px solid #134686; height: 72px; left: 0; overflow: hidden; position: fixed; right: 0; text-align: center; top: -72px; }
		.logo { display: block; height: 24px; margin: 0 auto 2px; max-width: 82px; object-fit: contain; }
		.brand { background: #134686; border-radius: 5px; color: #fff; display: inline-block; font-size: 12px; font-weight: bold; height: 24px; line-height: 24px; margin-bottom: 2px; width: 24px; }
		.org { color: #172554; font-size: 12px; font-weight: bold; line-height: 15px; }
		.org-info { color: #64748b; font-size: 7px; line-height: 9px; margin-top: 1px; }
		.report-heading { margin: 10px auto 12px; padding: 2px 0 6px; text-align: center; width: 88%; }
		.eyebrow { color: #134686; font-size: 7px; font-weight: bold; letter-spacing: .8px; line-height: 9px; text-transform: uppercase; }
		h1 { color: #172554; font-size: 15px; line-height: 17px; margin: 1px 0; }
		.description, .filters { color: #64748b; font-size: 8px; line-height: 10px; margin: 1px 0; }
		table { border-collapse: collapse; width: 100%; }
		th { background: #134686; color: #fff; font-weight: bold; text-align: left; }
		th, td { border: 1px solid #dbe3ee; padding: 5px 6px; }
		.page-gap th { background: transparent; border: 0; height: 14px; padding: 0; }
		tbody tr.account:nth-child(even) { background: #f8fafc; }
		.group { background: #eef4fb; color: #172554; font-weight: bold; }
		.total { background: #f8fafc; font-weight: bold; }
		.grand-total { background: #e8eef8; font-weight: bold; }
		th:first-child { width: 52%; }
		.number { text-align: right; }
		.footer { border-top: 1px solid #dbe3ee; bottom: -28px; color: #64748b; font-size: 8px; left: 0; padding-top: 5px; position: fixed; right: 0; text-align: center; }
	</style>
</head>
<body>
	<div class="header">
		@if($organizationLogoPath && file_exists($organizationLogoPath))<img class="logo" src="{{ $organizationLogoPath }}" alt="{{ $organizationName }}">@else<div class="brand">{{ strtoupper(substr($organizationName, 0, 1)) }}</div>@endif
		<div class="org">{{ $organizationName }}</div>
		@if($organizationAddress)<div class="org-info">{{ $organizationAddress }}</div>@endif
		@if($organizationContact)<div class="org-info">{{ $organizationContact }}</div>@endif
	</div>
	<div class="report-heading">
		<div class="eyebrow">General Accounting · Control Report</div>
		<h1>Trial Balance</h1>
		<p class="description">Control report for validating debit and credit equality across the ledger.</p>
		<p class="filters">Generated {{ $generatedAt }}@if($filters) · {{ $filters }}@endif</p>
	</div>
	@php
		$groupedRows = collect($rows)->groupBy(fn ($row) => $row[2] ?: 'Other');
		$grandDebit = collect($rows)->sum(fn ($row) => (float) ($row[3] ?? 0));
		$grandCredit = collect($rows)->sum(fn ($row) => (float) ($row[4] ?? 0));
		$grandBalance = collect($rows)->sum(fn ($row) => (float) ($row[5] ?? 0));
		$money = fn ($amount) => 'BDT ' . number_format((float) $amount, 2);
	@endphp
	<table>
		<thead><tr class="page-gap"><th colspan="4"></th></tr><tr><th>Account</th><th class="number">Debit</th><th class="number">Credit</th><th class="number">Balance</th></tr></thead>
		@forelse($groupedRows as $group => $groupRows)
			@php
				$groupDebit = $groupRows->sum(fn ($row) => (float) ($row[3] ?? 0));
				$groupCredit = $groupRows->sum(fn ($row) => (float) ($row[4] ?? 0));
				$groupBalance = $groupRows->sum(fn ($row) => (float) ($row[5] ?? 0));
			@endphp
			<tbody>
				<tr class="group"><td colspan="4">{{ $group }}</td></tr>
				@foreach($groupRows as $row)
					<tr class="account"><td>{{ $row[0] }} — {{ $row[1] }}</td><td class="number">{{ $money($row[3]) }}</td><td class="number">{{ $money($row[4]) }}</td><td class="number">{{ $money($row[5]) }}</td></tr>
				@endforeach
				<tr class="total"><td>Total {{ $group }}</td><td class="number">{{ $money($groupDebit) }}</td><td class="number">{{ $money($groupCredit) }}</td><td class="number">{{ $money($groupBalance) }}</td></tr>
			</tbody>
		@empty
			<tbody><tr><td colspan="4">No trial balance records found.</td></tr></tbody>
		@endforelse
		<tfoot><tr class="grand-total"><td class="number">Grand Total</td><td class="number">{{ $money($grandDebit) }}</td><td class="number">{{ $money($grandCredit) }}</td><td class="number">{{ $money($grandBalance) }}</td></tr></tfoot>
	</table>
	<div class="footer">{{ $organizationFooter ? $organizationFooter . ' · ' : '' }}Trial Balance · Generated {{ $generatedAt }}</div>
	<script type="text/php">if (isset($pdf)) { $pdf->page_text(540, 570, "Page {PAGE_NUM} of {PAGE_COUNT}", null, 8, [0.4, 0.4, 0.4]); }</script>
</body>
</html>
