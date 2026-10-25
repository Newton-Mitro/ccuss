<?php

namespace App\SystemAdministration\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Application\AuditComplianceCatalog;
use App\SystemAdministration\Models\AuditComplianceApprovalLog;
use App\SystemAdministration\Models\AuditComplianceRecord;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AuditComplianceController extends Controller
{
    public function dashboard(Request $request)
    {
        $dashboard = AuditComplianceCatalog::dashboards()[
            (string) $request->route('dashboard')
        ] ?? abort(404);
        $organizationId = $this->organizationId($request);
        $query = AuditComplianceRecord::query()
            ->where('organization_id', $organizationId)
            ->whereIn('kind', $dashboard['kinds']);

        $counts = (clone $query)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $registers = collect($dashboard['registers'])
            ->map(function (string $slug) use ($organizationId): array {
                $register = AuditComplianceCatalog::registers()[$slug];
                $records = AuditComplianceRecord::query()
                    ->where('organization_id', $organizationId)
                    ->where('kind', $register['kind']);

                return [
                    ...$register,
                    'route' => $slug,
                    'count' => (clone $records)->count(),
                    'open_count' => (clone $records)
                        ->whereNotIn('status', ['COMPLETED', 'CLOSED', 'ACCEPTED'])
                        ->count(),
                ];
            })
            ->values();

        return Inertia::render('audit-compliance/audits/overview-page', [
            'dashboard' => [
                ...$dashboard,
                'route' => (string) $request->route('dashboard'),
            ],
            'summary' => [
                'total' => (clone $query)->count(),
                'open' => (clone $query)
                    ->whereNotIn('status', ['COMPLETED', 'CLOSED', 'ACCEPTED'])
                    ->count(),
                'overdue' => (clone $query)
                    ->whereNotNull('due_date')
                    ->whereDate('due_date', '<', now()->toDateString())
                    ->whereNotIn('status', ['COMPLETED', 'CLOSED', 'ACCEPTED'])
                    ->count(),
                'approved' => (int) ($counts['APPROVED'] ?? 0),
                'rejected' => (int) ($counts['REJECTED'] ?? 0),
            ],
            'registers' => $registers,
            'statusCounts' => $counts,
            'recentRecords' => (clone $query)
                ->with('createdBy')
                ->latest('updated_at')
                ->limit(8)
                ->get()
                ->map(function (AuditComplianceRecord $record): array {
                    $registerRoute = collect(AuditComplianceCatalog::registers())
                        ->search(fn (array $register) => $register['kind'] === $record->kind);

                    return [
                        ...$record->toArray(),
                        'register_route' => $registerRoute,
                    ];
                }),
        ]);
    }

    public function index(Request $request)
    {
        $register = $this->register($request);
        $organizationId = $this->organizationId($request);
        $records = $this->organizationQuery($organizationId)
            ->where('kind', $register['kind'])
            ->with(['createdBy', 'relatedRecord'])
            ->when($request->filled('search'), function (Builder $query) use ($request): void {
                $search = trim((string) $request->query('search'));
                $query->where(function (Builder $searchQuery) use ($search): void {
                    $searchQuery
                        ->where('reference', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhere('responsible_person', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), fn (Builder $query) => $query->where('status', $request->query('status')))
            ->when($request->filled('priority'), fn (Builder $query) => $query->where('priority', $request->query('priority')))
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('due_date')
            ->orderByDesc('updated_at')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('audit-compliance/audits/register-page', [
            'register' => [
                ...$register,
                'route' => $this->registerRouteName($request),
                'permission' => $register['permission'] ?? $this->registerRouteName($request),
            ],
            'records' => $records,
            'filters' => $request->only(['search', 'status', 'priority', 'page', 'per_page']),
            'statuses' => AuditComplianceCatalog::statuses(),
            'priorities' => AuditComplianceCatalog::priorities(),
        ]);
    }

    public function create(Request $request)
    {
        return $this->formResponse($request, null);
    }

    public function store(Request $request)
    {
        $register = $this->register($request);
        $organizationId = $this->organizationId($request);
        $data = $this->validatedData($request, $register, $organizationId);
        $data['organization_id'] = $organizationId;
        $data['created_by'] = $request->user()->id;
        $data['updated_by'] = $request->user()->id;
        $data['kind'] = $register['kind'];
        $data['reference'] = $data['reference'] ?: $this->generateReference($register['kind']);
        $comment = $data['_decision_comment'] ?? null;
        unset($data['_decision_comment']);

        $record = DB::transaction(function () use ($data, $comment, $request): AuditComplianceRecord {
            $record = AuditComplianceRecord::create($data);

            if (in_array($record->status, ['APPROVED', 'REJECTED', 'SUBMITTED', 'ACCEPTED'], true)) {
                AuditComplianceApprovalLog::create([
                    'organization_id' => $record->organization_id,
                    'record_id' => $record->id,
                    'actor_id' => $request->user()->id,
                    'record_kind' => $record->kind,
                    'record_reference' => $record->reference,
                    'record_title' => $record->title,
                    'action' => $record->status,
                    'previous_status' => null,
                    'new_status' => $record->status,
                    'comment' => $comment,
                    'ip_address' => $request->ip(),
                    'acted_at' => now(),
                ]);
            }

            return $record;
        });

        return redirect()
            ->route($this->registerRouteName($request).'.show', $record)
            ->with('success', "{$register['singular']} created successfully.");
    }

    public function show(Request $request, AuditComplianceRecord $record)
    {
        $register = $this->register($request);
        $this->authorizeRecord($record, $register, $request);

        return Inertia::render('audit-compliance/audits/record-show-page', [
            'register' => [
                ...$register,
                'route' => $this->registerRouteName($request),
                'permission' => $register['permission'] ?? $this->registerRouteName($request),
            ],
            'record' => $record->load(['createdBy', 'relatedRecord']),
            'approvalLogs' => AuditComplianceApprovalLog::query()
                ->with('actor')
                ->where('organization_id', $record->organization_id)
                ->where('record_id', $record->id)
                ->latest('acted_at')
                ->get(),
        ]);
    }

    public function edit(Request $request, AuditComplianceRecord $record)
    {
        $register = $this->register($request);
        $this->authorizeRecord($record, $register, $request);

        return $this->formResponse($request, $record);
    }

    public function update(Request $request, AuditComplianceRecord $record)
    {
        $register = $this->register($request);
        $this->authorizeRecord($record, $register, $request);
        $data = $this->validatedData($request, $register, $record->organization_id, $record);
        $previousStatus = $record->status;
        $newStatus = $data['status'];
        $comment = $data['_decision_comment'] ?? null;
        unset($data['_decision_comment']);
        $data['updated_by'] = $request->user()->id;

        DB::transaction(function () use ($record, $data, $previousStatus, $newStatus, $comment, $request): void {
            $record->update($data);

            if ($previousStatus !== $newStatus && in_array($newStatus, ['APPROVED', 'REJECTED', 'SUBMITTED', 'ACCEPTED'], true)) {
                AuditComplianceApprovalLog::create([
                    'organization_id' => $record->organization_id,
                    'record_id' => $record->id,
                    'actor_id' => $request->user()->id,
                    'record_kind' => $record->kind,
                    'record_reference' => $record->reference,
                    'record_title' => $record->title,
                    'action' => $newStatus,
                    'previous_status' => $previousStatus,
                    'new_status' => $newStatus,
                    'comment' => $comment,
                    'ip_address' => $request->ip(),
                    'acted_at' => now(),
                ]);
            }
        });

        return redirect()
            ->route($this->registerRouteName($request).'.show', $record)
            ->with('success', "{$register['singular']} updated successfully.");
    }

    public function destroy(Request $request, AuditComplianceRecord $record)
    {
        $register = $this->register($request);
        $this->authorizeRecord($record, $register, $request);
        $record->delete();

        return redirect()
            ->route($this->registerRouteName($request).'.index')
            ->with('success', "{$register['singular']} archived successfully.");
    }

    public function approvalLogs(Request $request)
    {
        $organizationId = $this->organizationId($request);
        $logs = AuditComplianceApprovalLog::query()
            ->with(['actor', 'record'])
            ->where('organization_id', $organizationId)
            ->when($request->filled('action'), fn (Builder $query) => $query->where('action', $request->query('action')))
            ->when($request->filled('search'), function (Builder $query) use ($request): void {
                $search = trim((string) $request->query('search'));
                $query->where(function (Builder $searchQuery) use ($search): void {
                    $searchQuery
                        ->where('record_reference', 'like', "%{$search}%")
                        ->orWhere('record_title', 'like', "%{$search}%")
                        ->orWhere('record_kind', 'like', "%{$search}%");
                });
            })
            ->latest('acted_at')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('audit-compliance/audits/approval-logs-page', [
            'logs' => $logs,
            'filters' => $request->only(['action', 'search', 'page', 'per_page']),
            'actions' => ['APPROVED', 'REJECTED', 'SUBMITTED', 'ACCEPTED'],
        ]);
    }

    private function formResponse(Request $request, ?AuditComplianceRecord $record)
    {
        $register = $this->register($request);
        $organizationId = $this->organizationId($request);

        return Inertia::render('audit-compliance/audits/record-form-page', [
            'register' => [
                ...$register,
                'route' => $this->registerRouteName($request),
                'permission' => $register['permission'] ?? $this->registerRouteName($request),
            ],
            'record' => $record?->load('relatedRecord'),
            'relatedRecords' => $this->organizationQuery($organizationId)
                ->when($record, fn (Builder $query) => $query->where('id', '!=', $record->id))
                ->orderByDesc('updated_at')
                ->limit(200)
                ->get(['id', 'kind', 'reference', 'title']),
            'statuses' => AuditComplianceCatalog::statuses(),
            'priorities' => AuditComplianceCatalog::priorities(),
        ]);
    }

    private function validatedData(
        Request $request,
        array $register,
        int $organizationId,
        ?AuditComplianceRecord $record = null,
    ): array {
        $data = $request->validate([
            'reference' => [
                'nullable',
                'string',
                'max:80',
                Rule::unique('audit_compliance_records', 'reference')
                    ->where(fn ($query) => $query
                        ->where('organization_id', $organizationId)
                        ->where('kind', $register['kind']))
                    ->ignore($record?->id),
            ],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:10000'],
            'status' => ['required', Rule::in(AuditComplianceCatalog::statuses())],
            'priority' => ['required', Rule::in(AuditComplianceCatalog::priorities())],
            'responsible_person' => ['nullable', 'string', 'max:160'],
            'due_date' => ['nullable', 'date'],
            'related_record_id' => [
                'nullable',
                'integer',
                Rule::exists('audit_compliance_records', 'id')
                    ->where(fn ($query) => $query
                        ->where('organization_id', $organizationId)
                        ->whereNull('deleted_at')
                        ->when($record, fn ($query) => $query->where('id', '!=', $record->id))),
            ],
            '_decision_comment' => ['nullable', 'string', 'max:2000'],
        ]);
        $data['reference'] = ($data['reference'] ?? null)
            ?: ($record?->reference ?? $this->generateReference($register['kind']));

        return $data;
    }

    private function register(Request $request): array
    {
        $routeName = $this->registerRouteName($request);
        $register = AuditComplianceCatalog::registers()[$routeName] ?? null;
        abort_if($register === null, 404);

        return $register;
    }

    private function registerRouteName(Request $request): string
    {
        return (string) $request->route('register');
    }

    private function authorizeRecord(
        AuditComplianceRecord $record,
        array $register,
        Request $request,
    ): void {
        abort_unless(
            $record->organization_id === $this->organizationId($request)
                && $record->kind === $register['kind'],
            404,
        );
    }

    private function organizationQuery(int $organizationId): Builder
    {
        return AuditComplianceRecord::query()->where('organization_id', $organizationId);
    }

    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }

    private function generateReference(string $kind): string
    {
        return Str::upper(Str::substr($kind, 0, 3))
            .'-'
            .now()->format('Ymd')
            .'-'
            .Str::upper(Str::random(6));
    }
}
