<?php

namespace App\TreasuryAndCashModule\Controllers;

use App\GeneralAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use App\SubledgerModule\Models\SubledgerAccount;
use App\SystemAdministration\Models\Branch;
use App\VoucherEntryModule\Models\VoucherEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashMovementController extends Controller
{
    public function tellerToTellerTransfer(Request $request)
    {
        $teller_subledger_accounts = SubledgerAccount::with([
            'accountable',
            'subledger',
            'subledger.glAccount',
        ])
            ->whereHas('subledger', function ($query) {
                $query->where('subledger_sub_type', 'teller_cashes');
            })
            ->get();

        $collection_ledgers = SubledgerAccount::all();


        $voucher_entries = VoucherEntry::all();

        return Inertia::render('treasury-and-cash/cash-movements/teller-to-teller-transfer-page', [
            'ledger_accounts' => LedgerAccount::where('is_control_account', true)->where('is_active', true)->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'teller_subledger_accounts' => $teller_subledger_accounts,
            'lines' => $collection_ledgers,
            'voucher_entries' => $voucher_entries,
            'user_branch_id' => auth()->user()->branch_id,
        ]);
    }

    public function vaultToVaultTransfer(Request $request)
    {
        $vault_subledger_accounts = SubledgerAccount::with([
            'accountable',
            'subledger',
            'subledger.glAccount',
        ])
            ->whereHas('subledger', function ($query) {
                $query->where('subledger_sub_type', 'teller_cashes');
            })
            ->get();

        $collection_ledgers = SubledgerAccount::all();


        $voucher_entries = VoucherEntry::all();

        return Inertia::render('treasury-and-cash/cash-movements/vault-to-vault-transfer-page', [
            'ledger_accounts' => LedgerAccount::where('is_control_account', true)->where('is_active', true)->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'vault_subledger_accounts' => $vault_subledger_accounts,
            'lines' => $collection_ledgers,
            'voucher_entries' => $voucher_entries,
            'user_branch_id' => auth()->user()->branch_id,
        ]);
    }

    public function vaultToTellerTransfer(Request $request)
    {
        $vault_subledger_accounts = SubledgerAccount::with([
            'accountable',
            'subledger',
            'subledger.glAccount',
        ])
            ->whereHas('subledger', function ($query) {
                $query->where('subledger_sub_type', 'teller_cashes');
            })
            ->get();

        $teller_subledger_accounts = SubledgerAccount::with([
            'accountable',
            'subledger',
            'subledger.glAccount',
        ])
            ->whereHas('subledger', function ($query) {
                $query->where('subledger_sub_type', 'teller_cashes');
            })
            ->get();

        $collection_ledgers = SubledgerAccount::all();


        $voucher_entries = VoucherEntry::all();

        return Inertia::render('treasury-and-cash/cash-movements/teller-cash-funding-page', [
            'ledger_accounts' => LedgerAccount::where('is_control_account', true)->where('is_active', true)->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'vault_subledger_accounts' => $vault_subledger_accounts,
            'teller_subledger_accounts' => $teller_subledger_accounts,
            'lines' => $collection_ledgers,
            'voucher_entries' => $voucher_entries,
            'user_branch_id' => auth()->user()->branch_id,
        ]);
    }

    public function tellerToVaultTransfer(Request $request)
    {
        $vault_subledger_accounts = SubledgerAccount::with([
            'accountable',
            'subledger',
            'subledger.glAccount',
        ])
            ->whereHas('subledger', function ($query) {
                $query->where('subledger_sub_type', 'teller_cashes');
            })
            ->get();

        $teller_subledger_accounts = SubledgerAccount::with([
            'accountable',
            'subledger',
            'subledger.glAccount',
        ])
            ->whereHas('subledger', function ($query) {
                $query->where('subledger_sub_type', 'teller_cashes');
            })
            ->get();

        $collection_ledgers = SubledgerAccount::all();


        $voucher_entries = VoucherEntry::all();

        return Inertia::render('treasury-and-cash/cash-movements/teller-cash-return-page', [
            'ledger_accounts' => LedgerAccount::where('is_control_account', true)->where('is_active', true)->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'vault_subledger_accounts' => $vault_subledger_accounts,
            'teller_subledger_accounts' => $teller_subledger_accounts,
            'lines' => $collection_ledgers,
            'voucher_entries' => $voucher_entries,
            'user_branch_id' => auth()->user()->branch_id,
        ]);
    }

    public function bankToVaultTransfer(Request $request)
    {
        $vault_subledger_accounts = SubledgerAccount::with([
            'accountable',
            'subledger',
            'subledger.glAccount',
        ])
            ->whereHas('subledger', function ($query) {
                $query->where('subledger_sub_type', 'teller_cashes');
            })
            ->get();

        $bank_subledger_accounts = SubledgerAccount::with([
            'accountable',
            'subledger',
            'subledger.glAccount',
        ])
            ->whereHas('subledger', function ($query) {
                $query->where('subledger_sub_type', 'teller_cashes');
            })
            ->get();

        $collection_ledgers = SubledgerAccount::all();


        $voucher_entries = VoucherEntry::all();

        return Inertia::render('treasury-and-cash/cash-movements/bank-to-vault-transfer-page', [
            'ledger_accounts' => LedgerAccount::where('is_control_account', true)->where('is_active', true)->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'vault_subledger_accounts' => $vault_subledger_accounts,
            'bank_subledger_accounts' => $bank_subledger_accounts,
            'lines' => $collection_ledgers,
            'voucher_entries' => $voucher_entries,
            'user_branch_id' => auth()->user()->branch_id,
        ]);
    }

    public function vaultToBankTransfer(Request $request)
    {
        $vault_subledger_accounts = SubledgerAccount::with([
            'accountable',
            'subledger',
            'subledger.glAccount',
        ])
            ->whereHas('subledger', function ($query) {
                $query->where('subledger_sub_type', 'teller_cashes');
            })
            ->get();

        $bank_subledger_accounts = SubledgerAccount::with([
            'accountable',
            'subledger',
            'subledger.glAccount',
        ])
            ->whereHas('subledger', function ($query) {
                $query->where('subledger_sub_type', 'teller_cashes');
            })
            ->get();

        $collection_ledgers = SubledgerAccount::all();


        $voucher_entries = VoucherEntry::all();

        return Inertia::render('treasury-and-cash/cash-movements/vault-to-bank-transfer-page', [
            'ledger_accounts' => LedgerAccount::where('is_control_account', true)->where('is_active', true)->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'vault_subledger_accounts' => $vault_subledger_accounts,
            'bank_subledger_accounts' => $bank_subledger_accounts,
            'lines' => $collection_ledgers,
            'voucher_entries' => $voucher_entries,
            'user_branch_id' => auth()->user()->branch_id,
        ]);
    }
}