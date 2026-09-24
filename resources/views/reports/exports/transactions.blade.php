<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<title>Transaction Report</title>
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
		tbody tr:nth-child(even) { background: #f8fafc; }
		th:first-child { width: 18%; }
		th:nth-child(2) { width: 25%; }
		th:nth-child(3) { width: 15%; }
		th:nth-child(5) { text-align: right; }
		.transaction { font-family: DejaVu Sans Mono, monospace; font-size: 8px; }
		.number { text-align: right; }
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
		@if($organizationAddress)<div class="org-info">{{ $organizationAddress }}</div>@endif
		@if($organizationContact)<div class="org-info">{{ $organizationContact }}</div>@endif
	</div>

	<div class="report-heading">
		<div class="eyebrow">Financial Services · Operational Activity</div>
		<h1>Transaction Report</h1>
		<p class="description">Operational financial transactions across the organization.</p>
		<p class="filters">Generated {{ $generatedAt }}@if($filters) · {{ $filters }}@endif</p>
	</div>

	<table>
		<thead>
			<tr class="page-gap"><th colspan="6"></th></tr>
			<tr><th>Number</th><th>Account</th><th>Date</th><th>Type</th><th class="number">Amount</th><th>Status</th></tr>
		</thead>
		<tbody>
			@forelse($rows as $row)
				<tr>
					<td class="transaction">{{ $row[0] }}</td>
					<td>{{ $row[1] }}</td>
					<td>{{ $row[2] }}</td>
					<td>{{ $row[3] }}</td>
					<td class="number">{{ number_format((float) $row[4], 4) }}</td>
					<td>{{ $row[5] }}</td>
				</tr>
			@empty
				<tr><td colspan="6">No transactions found.</td></tr>
			@endforelse
		</tbody>
	</table>

	<div class="footer">{{ $organizationFooter ? $organizationFooter . ' · ' : '' }}Transaction Report · Generated {{ $generatedAt }}</div>
	<script type="text/php">if (isset($pdf)) { $pdf->page_text(760, 570, "Page {PAGE_NUM} of {PAGE_COUNT}", null, 8, [0.4, 0.4, 0.4]); }</script>
</body>
</html>
