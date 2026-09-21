<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\Cheque;
use App\TreasuryAndCash\Models\ChequeBook;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ChequeService
{
    public function createBook(array $data, int $userId): ChequeBook
    {
        return DB::transaction(function () use ($data, $userId): ChequeBook {
            $start = (int) $data['start_number'];
            $end = (int) $data['end_number'];
            $book = ChequeBook::create([
                ...$data,
                'leaf_count' => $end - $start + 1,
                'current_number' => $start,
                'status' => 'AVAILABLE',
            ]);

            for ($number = $start; $number <= $end; $number++) {
                $book->cheques()->create([
                    'cheque_no' => ($data['prefix'] ?? '') . $number,
                    'status' => 'UNUSED',
                ]);
            }

            return $book->load('cheques');
        });
    }

    public function update(Cheque $cheque, array $data): Cheque
    {
        if ($cheque->status !== 'UNUSED') {
            throw new RuntimeException('Only unused cheques can be edited.');
        }

        $cheque->update($data);
        return $cheque->refresh();
    }

    public function transition(Cheque $cheque, string $action, int $userId, array $data = []): Cheque
    {
        $nextStatus = match ($action) {
            'issue' => ['UNUSED' => 'ISSUED'],
            'present' => ['ISSUED' => 'PRESENTED'],
            'clear' => ['PRESENTED' => 'CLEARED'],
            'bounce' => ['PRESENTED' => 'BOUNCED'],
            'stop' => ['ISSUED' => 'STOPPED', 'PRESENTED' => 'STOPPED'],
            'cancel' => ['UNUSED' => 'CANCELLED', 'ISSUED' => 'CANCELLED'],
            default => throw new RuntimeException('Unsupported cheque action.'),
        };

        $current = $cheque->status;
        $target = $nextStatus[$current] ?? null;
        if (!$target) {
            throw new RuntimeException("Cheque cannot be {$action} from {$current} status.");
        }

        return DB::transaction(function () use ($cheque, $action, $target, $userId, $data): Cheque {
            $attributes = ['status' => $target, ...$data];
            if ($target === 'ISSUED') {
                $attributes['issue_date'] = $data['issue_date'] ?? now()->toDateString();
            }
            if ($target === 'PRESENTED') {
                $attributes['presented_date'] = now()->toDateString();
            }
            if ($target === 'CLEARED') {
                $attributes['cleared_date'] = now()->toDateString();
            }

            $cheque->update($attributes);
            $cheque->transactions()->create([
                'type' => strtoupper($action === 'present' ? 'PRESENT' : $action),
                'amount' => $cheque->amount,
                'transaction_date' => now(),
                'description' => $data['note'] ?? null,
                'created_by' => $userId,
            ]);

            return $cheque->refresh();
        });
    }
}
