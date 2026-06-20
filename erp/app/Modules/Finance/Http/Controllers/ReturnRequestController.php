<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\ReturnRequest;
use App\Modules\Finance\Models\ReturnRequestItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReturnRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ReturnRequest::class);

        $returnRequests = ReturnRequest::with(['contact', 'invoice'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Finance/ReturnRequests/Index', [
            'returnRequests' => $returnRequests,
            'filters'        => $request->only(['status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', ReturnRequest::class);

        return Inertia::render('Finance/ReturnRequests/Create', [
            'contacts' => Contact::orderBy('name')->get(['id', 'name']),
            'invoices' => Invoice::latest()->limit(50)->get(['id', 'number']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ReturnRequest::class);

        $data = $request->validate([
            'invoice_id'           => ['nullable', 'exists:invoices,id'],
            'contact_id'           => ['nullable', 'exists:contacts,id'],
            'reason'               => ['required', 'string'],
            'refund_amount'        => ['required', 'numeric', 'min:0'],
            'items'                => ['required', 'array', 'min:1'],
            'items.*.product_name' => ['required', 'string', 'max:255'],
            'items.*.quantity'     => ['required', 'integer', 'min:1'],
            'items.*.unit_price'   => ['required', 'numeric', 'min:0'],
            'items.*.reason'       => ['nullable', 'string'],
        ]);

        $returnRequest = DB::transaction(function () use ($data, $request) {
            $rr = ReturnRequest::create([
                'tenant_id'     => auth()->user()->tenant_id,
                'invoice_id'    => $data['invoice_id'] ?? null,
                'contact_id'    => $data['contact_id'] ?? null,
                'reason'        => $data['reason'],
                'refund_amount' => $data['refund_amount'],
                'status'        => 'pending',
                'notes'         => $request->notes,
            ]);

            foreach ($data['items'] as $item) {
                ReturnRequestItem::create([
                    'tenant_id'         => auth()->user()->tenant_id,
                    'return_request_id' => $rr->id,
                    'invoice_item_id'   => $item['invoice_item_id'] ?? null,
                    'product_name'      => $item['product_name'],
                    'quantity'          => $item['quantity'],
                    'unit_price'        => $item['unit_price'],
                    'reason'            => $item['reason'] ?? null,
                ]);
            }

            return $rr;
        });

        return redirect()->route('finance.return-requests.show', $returnRequest)
            ->with('success', 'Return request created.');
    }

    public function show(ReturnRequest $returnRequest): Response
    {
        $this->authorize('view', $returnRequest);

        $returnRequest->load(['items', 'contact', 'invoice', 'approvedBy']);

        return Inertia::render('Finance/ReturnRequests/Show', [
            'returnRequest' => $returnRequest,
        ]);
    }

    public function destroy(ReturnRequest $returnRequest): RedirectResponse
    {
        $this->authorize('delete', $returnRequest);

        $returnRequest->delete();

        return redirect()->route('finance.return-requests.index')
            ->with('success', 'Return request deleted.');
    }

    public function approve(ReturnRequest $returnRequest): RedirectResponse
    {
        $this->authorize('create', $returnRequest);

        $returnRequest->approve(auth()->user());

        return back()->with('success', 'Return request approved.');
    }

    public function reject(ReturnRequest $returnRequest): RedirectResponse
    {
        $this->authorize('create', $returnRequest);

        $returnRequest->reject();

        return back()->with('success', 'Return request rejected.');
    }

    public function markRefunded(ReturnRequest $returnRequest): RedirectResponse
    {
        $this->authorize('create', $returnRequest);

        $returnRequest->markRefunded();

        return back()->with('success', 'Return request marked as refunded.');
    }
}
