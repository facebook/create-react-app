<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Accounting\Models\Account;
use App\Modules\Accounting\Models\JournalEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountingApiController extends ApiController
{
    /**
     * GET /api/v1/accounting/journal-entries
     */
    public function journalEntries(Request $request): JsonResponse
    {
        $query = JournalEntry::withCount('lines');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($dateFrom = $request->query('date_from')) {
            $query->whereDate('entry_date', '>=', $dateFrom);
        }

        if ($dateTo = $request->query('date_to')) {
            $query->whereDate('entry_date', '<=', $dateTo);
        }

        $paginator = $query->latest('entry_date')->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/accounting/journal-entries/{id}
     */
    public function showJournalEntry(int $id): JsonResponse
    {
        $entry = JournalEntry::with('lines')->findOrFail($id);

        return $this->success($entry);
    }

    /**
     * POST /api/v1/accounting/journal-entries
     */
    public function storeJournalEntry(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reference'   => 'nullable|string|max:255',
            'description' => 'required|string',
            'entry_date'  => 'required|date',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;
        $validated['status']    = 'draft';

        $entry = JournalEntry::create($validated);

        return $this->success($entry, 201);
    }

    /**
     * GET /api/v1/accounting/accounts
     */
    public function accounts(Request $request): JsonResponse
    {
        $query = Account::select('id', 'code', 'name', 'type', 'normal_balance', 'is_active');

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $paginator = $query->orderBy('code')->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * POST /api/v1/accounting/accounts
     */
    public function storeAccount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'           => 'required|string|max:50',
            'name'           => 'required|string|max:255',
            'type'           => 'required|string|in:asset,liability,equity,revenue,expense',
            'normal_balance' => 'required|string|in:debit,credit',
            'sub_type'       => 'nullable|string|max:100',
            'is_active'      => 'nullable|boolean',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;

        $account = Account::create($validated);

        return $this->success($account, 201);
    }
}
