<?php

namespace App\SystemAdministration\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    /**
     * Global audit list (Admin view)
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);

        $audits = AuditLog::query()
            ->with('user')
            ->when($request->event, fn($q) => $q->where('event', $request->event))
            ->when($request->user_id, fn($q) => $q->where('user_id', $request->user_id))
            ->whereIn('id', function ($query) {
                $query->selectRaw('MAX(id)')
                    ->from('audit_logs')
                    ->groupBy('batch_id');
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('system-administration/audits/index-page', [
            'audits' => $audits,
            'filters' => $request->only(['event', 'user_id', 'page', 'per_page']),
        ]);
    }

    /**
     * Audit history for a specific model (Voucher, Ledger, etc.)
     * Example:
     * /audits/model?type=App\Models\Voucher&id=12
     */
    public function model(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'id' => 'required|integer',
        ]);

        $batches = AuditLog::query()
            ->select('a.*')
            ->from('audit_logs as a')
            ->join('audit_logs as b', 'b.batch_id', '=', 'a.batch_id')
            ->where('b.auditable_type', $validated['type'])
            ->where('b.auditable_id', $validated['id'])
            ->with('user')
            ->orderBy('a.created_at')
            ->get()
            ->groupBy('batch_id')
            ->map(fn($items) => $this->formatBatch($items))
            ->values();

        return Inertia::render('system-administration/audits/model-history-page', [
            'auditableType' => class_basename($validated['type']),
            'auditableId' => $validated['id'],
            'batches' => $batches,
        ]);
    }

    /**
     * Single audit batch (deep dive / modal view)
     */
    public function batch(string $batchId)
    {
        $audits = AuditLog::where('batch_id', $batchId)
            ->with('user')
            ->orderBy('created_at')
            ->get();

        abort_if($audits->isEmpty(), 404);

        return Inertia::render('system-administration/audits/batch-page', [
            'batch' => [
                'batch_id' => $batchId,
                'event_at' => $audits->first()->created_at,
                'user' => $audits->first()->user,
                'changes' => $audits->map(fn($a) => [
                    'model' => class_basename($a->auditable_type),
                    'event' => $a->event,
                    'old' => $a->old_values,
                    'new' => $a->new_values,
                ]),
            ],
        ]);
    }

    /**
     * Shape a batch for React consumption
     */
    protected function formatBatch($items): array
    {
        $first = $items->first();

        return [
            'batch_id' => $first->batch_id,
            'event_at' => $first->created_at,
            'user' => $first->user,
            'changes' => $items->map(fn($audit) => [
                'model' => class_basename($audit->auditable_type),
                'event' => $audit->event,
                'old' => $audit->old_values,
                'new' => $audit->new_values,
            ])->values(),
        ];
    }
}