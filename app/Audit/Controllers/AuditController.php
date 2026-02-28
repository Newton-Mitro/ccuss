<?php

namespace App\Audit\Controllers;

use App\Audit\Models\Audit;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditController extends Controller
{
    /**
     * Global audit list (Admin view)
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);

        $audits = Audit::query()
            ->with('user')
            ->when($request->event, fn($q) => $q->where('event', $request->event))
            ->when($request->user_id, fn($q) => $q->where('user_id', $request->user_id))
            ->select('audits.*')
            ->orderBy('created_at', 'desc')
            ->distinct('batch_id')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('audits/index-page', [
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

        $batches = Audit::query()
            ->select('a.*')
            ->from('audits as a')
            ->join('audits as b', 'b.batch_id', '=', 'a.batch_id')
            ->where('b.auditable_type', $validated['type'])
            ->where('b.auditable_id', $validated['id'])
            ->with('user')
            ->orderBy('a.created_at')
            ->get()
            ->groupBy('batch_id')
            ->map(fn($items) => $this->formatBatch($items))
            ->values();

        return Inertia::render('audits/model-history-page', [
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
        $audits = Audit::where('batch_id', $batchId)
            ->with('user')
            ->orderBy('created_at')
            ->get();

        abort_if($audits->isEmpty(), 404);

        return Inertia::render('audits/batch-page', [
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