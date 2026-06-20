<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\BudgetLine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BudgetLineController extends Controller
{
    public function update(Request $request, BudgetLine $budgetLine): RedirectResponse
    {
        $this->authorize('update', $budgetLine->budget);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'notes'  => ['nullable', 'string'],
        ]);

        $budgetLine->update($validated);

        return redirect()->back()->with('success', 'Budget line updated.');
    }

    public function destroy(BudgetLine $budgetLine): RedirectResponse
    {
        $this->authorize('delete', $budgetLine->budget);

        $budgetLine->delete();

        return redirect()->back()->with('success', 'Budget line deleted.');
    }
}
