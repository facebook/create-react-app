<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\BankAccount;
use App\Modules\Finance\Models\BankTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BankStatementController extends Controller
{
    public function import(Request $request, BankAccount $bankAccount): RedirectResponse
    {
        $this->authorize('update', $bankAccount);
        $request->validate(['file' => 'required|file|mimes:csv,txt|max:2048']);

        $path   = $request->file('file')->getRealPath();
        $handle = fopen($path, 'r');
        $header = fgetcsv($handle); // skip header row
        $count  = 0;
        $now    = now();

        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) < 3) continue;
            [$date, $description, $amount] = $row;
            $reference = $row[3] ?? null;
            if (!is_numeric(str_replace([',', ' '], '', $amount))) continue;
            $amount = (float) str_replace(',', '', $amount);
            BankTransaction::create([
                'tenant_id'        => $bankAccount->tenant_id,
                'bank_account_id'  => $bankAccount->id,
                'transaction_date' => $date,
                'description'      => trim($description),
                'amount'           => $amount,
                'reference'        => $reference ? trim($reference) : null,
                'reconciled'       => false,
                'imported_at'      => $now,
            ]);
            $count++;
        }
        fclose($handle);

        return back()->with('success', "{$count} transactions imported.");
    }
}
