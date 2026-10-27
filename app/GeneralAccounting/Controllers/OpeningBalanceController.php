<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Application\CutoverBundleImportService;
use App\GeneralAccounting\Application\MemberOpeningBalanceImportService;
use App\GeneralAccounting\Application\OpeningBalanceService;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use ZipArchive;

class OpeningBalanceController extends Controller
{
    public function __construct(
        private readonly OpeningBalanceService $openingBalanceService,
    ) {
        $this->middleware('permission:accounting.opening_balances.view')->only(['index']);
        $this->middleware('permission:accounting.opening_balances.create')
            ->only(['create', 'store', 'memberImport', 'memberImportTemplate', 'storeMemberImport', 'cutoverImport', 'cutoverImportTemplate', 'storeCutoverImport']);
    }

    public function index(Request $request): Response
    {
        return Inertia::render('general-accounting/opening-balances/index', [
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'accounts' => $this->accounts($request),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('general-accounting/opening-balances/create', [
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'accounts' => $this->accounts($request),
        ]);
    }

    public function memberImport(Request $request): Response
    {
        return Inertia::render('general-accounting/opening-balances/member-import', [
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'accounts' => $this->accounts($request),
        ]);
    }

    public function memberImportTemplate()
    {
        return response()->streamDownload(function (): void {
            $stream = fopen('php://output', 'w');
            fputcsv($stream, ['account_no', 'opening_balance', 'ledger_account_code']);
            fclose($stream);
        }, 'member-opening-balances-template.csv', ['Content-Type' => 'text/csv']);
    }

    public function storeMemberImport(Request $request, MemberOpeningBalanceImportService $importService)
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $payload = $request->validate([
            'fiscal_period_id' => [
                'required',
                'integer',
                Rule::exists('fiscal_periods', 'id')->where(function ($query) use ($organizationId) {
                    $query->whereExists(function ($subquery) use ($organizationId) {
                        $subquery
                            ->selectRaw('1')
                            ->from('fiscal_years')
                            ->whereColumn('fiscal_years.id', 'fiscal_periods.fiscal_year_id')
                            ->where('organization_id', $organizationId);
                    });
                }),
            ],
            'cutover_date' => ['required', 'date_format:Y-m-d'],
            'offset_account_id' => [
                'required',
                'integer',
                Rule::exists('accounts', 'id')->where(
                    fn ($query) => $query->where('organization_id', $organizationId),
                ),
            ],
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ]);

        try {
            $result = $importService->import(
                $payload['file'],
                $organizationId,
                $request->user()->id,
                $payload['fiscal_period_id'],
                $payload['offset_account_id'],
                $payload['cutover_date'],
            );
        } catch (\InvalidArgumentException|\RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('opening-balances.index')->with(
            'success',
            "{$result['count']} member account balances imported. Opening voucher {$result['voucher']->voucher_no} was posted.",
        );
    }

    public function cutoverImport(Request $request): Response
    {
        return Inertia::render('general-accounting/opening-balances/cutover-import', [
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'accounts' => $this->accounts($request),
        ]);
    }

    public function cutoverImportTemplate(CutoverBundleImportService $importService)
    {
        $path = tempnam(sys_get_temp_dir(), 'cutover-template-');
        if ($path === false) {
            throw new \RuntimeException('Could not create the cutover template archive.');
        }

        $zip = new ZipArchive;
        if ($zip->open($path, ZipArchive::OVERWRITE) !== true) {
            unlink($path);
            throw new \RuntimeException('Could not create the cutover template ZIP.');
        }
        foreach ($importService->templates() as $template) {
            if (! $zip->addFromString($template['name'], $template['contents'])) {
                $zip->close();
                unlink($path);
                throw new \RuntimeException("Could not add {$template['name']} to the template ZIP.");
            }
        }
        $zip->close();

        return response()->download($path, 'cutover-import-templates.zip', [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
    }

    public function storeCutoverImport(Request $request, CutoverBundleImportService $importService)
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $payload = $request->validate([
            'fiscal_period_id' => [
                'required',
                'integer',
                Rule::exists('fiscal_periods', 'id')->where(function ($query) use ($organizationId) {
                    $query->whereExists(function ($subquery) use ($organizationId) {
                        $subquery->selectRaw('1')
                            ->from('fiscal_years')
                            ->whereColumn('fiscal_years.id', 'fiscal_periods.fiscal_year_id')
                            ->where('organization_id', $organizationId);
                    });
                }),
            ],
            'cutover_date' => ['required', 'date_format:Y-m-d'],
            'offset_account_id' => [
                'required',
                'integer',
                Rule::exists('accounts', 'id')->where(fn ($query) => $query->where('organization_id', $organizationId)),
            ],
            'file' => ['required', 'file', 'mimes:zip', 'max:51200'],
        ]);

        try {
            $result = $importService->import(
                $payload['file'],
                $organizationId,
                $request->user()->id,
                $payload['fiscal_period_id'],
                $payload['offset_account_id'],
                $payload['cutover_date'],
            );
        } catch (\InvalidArgumentException|\RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        $message = "{$result['customers']} customers, {$result['accounts']} financial accounts, {$result['bank_accounts']} bank accounts, and {$result['cash_locations']} cash locations imported.";
        if ($result['voucher']) {
            $message .= " Opening voucher {$result['voucher']->voucher_no} was posted.";
        }

        return redirect()->route('financial-accounts.index')->with('success', $message);
    }

    public function store(Request $request)
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $payload = $request->validate([
            'fiscal_period_id' => [
                'required',
                'integer',
                Rule::exists('fiscal_periods', 'id')->where(function ($query) use ($organizationId) {
                    $query->whereExists(function ($subquery) use ($organizationId) {
                        $subquery
                            ->selectRaw('1')
                            ->from('fiscal_years')
                            ->whereColumn('fiscal_years.id', 'fiscal_periods.fiscal_year_id')
                            ->where('organization_id', $organizationId);
                    });
                }),
            ],
            'offset_account_id' => [
                'required',
                'integer',
                Rule::exists('accounts', 'id')->where(
                    fn ($query) => $query->where('organization_id', $organizationId),
                ),
            ],
            'entries' => ['required', 'array', 'min:1'],
            'entries.*.account_id' => [
                'required',
                'integer',
                Rule::exists('accounts', 'id')->where(
                    fn ($query) => $query->where('organization_id', $organizationId),
                ),
            ],
            'entries.*.amount' => ['required', 'numeric', 'gt:0'],
        ]);

        try {
            $this->openingBalanceService->apply(
                $payload['entries'],
                $organizationId,
                $request->user()->id,
                $payload['fiscal_period_id'],
                $payload['offset_account_id'],
            );
        } catch (\InvalidArgumentException|\RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('opening-balances.index')->with('success', 'Opening balances applied successfully.');
    }

    private function fiscalPeriods(Request $request)
    {
        return FiscalPeriod::query()
            ->whereHas('fiscalYear', fn ($query) => $query->where('organization_id', $request->attributes->get('active_organization')->id))
            ->with('fiscalYear')
            ->orderByDesc('start_date')
            ->get();
    }

    private function accounts(Request $request)
    {
        return LedgerAccount::query()
            ->where('organization_id', $request->attributes->get('active_organization')->id)
            ->where('status', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'type', 'normal_balance']);
    }
}
