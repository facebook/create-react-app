<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\LoyaltyEnrollment;
use App\Modules\Finance\Models\LoyaltyProgram;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoyaltyProgramController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', LoyaltyProgram::class);

        $loyaltyPrograms = LoyaltyProgram::withCount('enrollments')
            ->latest()
            ->paginate(15);

        return Inertia::render('Finance/Loyalty/Index', [
            'loyaltyPrograms' => $loyaltyPrograms,
            'breadcrumbs'     => [
                ['label' => 'Finance'],
                ['label' => 'Loyalty Programs', 'href' => route('finance.loyalty-programs.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', LoyaltyProgram::class);

        return Inertia::render('Finance/Loyalty/Create', [
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Loyalty Programs', 'href' => route('finance.loyalty-programs.index')],
                ['label' => 'New Program'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', LoyaltyProgram::class);

        $data = $request->validate([
            'name'                      => ['required', 'string', 'max:255'],
            'description'               => ['nullable', 'string'],
            'points_per_currency_unit'  => ['required', 'numeric', 'min:0.0001'],
            'points_to_currency_rate'   => ['required', 'numeric', 'min:0.000001'],
            'minimum_redemption_points' => ['required', 'integer', 'min:1'],
            'is_active'                 => ['boolean'],
        ]);

        $data['tenant_id'] = app('tenant')->id;

        $program = LoyaltyProgram::create($data);

        return redirect()->route('finance.loyalty-programs.show', $program);
    }

    public function show(LoyaltyProgram $loyaltyProgram): Response
    {
        $this->authorize('view', $loyaltyProgram);

        $enrollments = $loyaltyProgram->enrollments()
            ->with('contact')
            ->paginate(20);

        return Inertia::render('Finance/Loyalty/Show', [
            'loyaltyProgram' => $loyaltyProgram,
            'enrollments'    => $enrollments,
            'contacts'       => Contact::customers()->active()->orderBy('name')->get(['id', 'name']),
            'breadcrumbs'    => [
                ['label' => 'Finance'],
                ['label' => 'Loyalty Programs', 'href' => route('finance.loyalty-programs.index')],
                ['label' => $loyaltyProgram->name],
            ],
        ]);
    }

    public function destroy(LoyaltyProgram $loyaltyProgram): RedirectResponse
    {
        $this->authorize('delete', $loyaltyProgram);

        $loyaltyProgram->delete();

        return redirect()->route('finance.loyalty-programs.index');
    }

    public function enroll(Request $request, LoyaltyProgram $loyaltyProgram): RedirectResponse
    {
        $this->authorize('create', LoyaltyProgram::class);

        $data = $request->validate([
            'contact_id' => ['required', 'exists:contacts,id'],
        ]);

        $tenantId = app('tenant')->id;

        LoyaltyEnrollment::firstOrCreate(
            [
                'loyalty_program_id' => $loyaltyProgram->id,
                'contact_id'         => $data['contact_id'],
            ],
            [
                'tenant_id'   => $tenantId,
                'enrolled_at' => now(),
            ]
        );

        return back()->with('success', 'Contact enrolled successfully.');
    }

    public function earnPoints(Request $request, LoyaltyProgram $loyaltyProgram): RedirectResponse
    {
        $this->authorize('create', LoyaltyProgram::class);

        $data = $request->validate([
            'enrollment_id' => ['required', 'exists:loyalty_enrollments,id'],
            'points'        => ['required', 'integer', 'min:1'],
            'description'   => ['nullable', 'string'],
        ]);

        $enrollment = LoyaltyEnrollment::findOrFail($data['enrollment_id']);
        $enrollment->earnPoints($data['points'], $data['description'] ?? '');

        return back()->with('success', 'Points earned successfully.');
    }

    public function redeemPoints(Request $request, LoyaltyProgram $loyaltyProgram): RedirectResponse
    {
        $this->authorize('create', LoyaltyProgram::class);

        $data = $request->validate([
            'enrollment_id' => ['required', 'exists:loyalty_enrollments,id'],
            'points'        => ['required', 'integer', 'min:1'],
        ]);

        $enrollment = LoyaltyEnrollment::findOrFail($data['enrollment_id']);

        try {
            $enrollment->redeemPoints($data['points']);
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Points redeemed successfully.');
    }
}
