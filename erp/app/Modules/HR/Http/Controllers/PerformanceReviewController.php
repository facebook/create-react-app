<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\PerformanceKpi;
use App\Modules\HR\Models\PerformanceReview;
use App\Modules\HR\Models\ReviewRating;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PerformanceReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PerformanceReview::class);

        $query = PerformanceReview::with(['employee', 'reviewer'])
            ->orderByDesc('review_date');

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $reviews = $query->paginate(15);
        $filters = $request->only(['employee_id', 'status']);

        return Inertia::render('HR/PerformanceReviews/Index', compact('reviews', 'filters'));
    }

    public function create(): Response
    {
        $this->authorize('create', PerformanceReview::class);

        $employees = Employee::where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name']);

        return Inertia::render('HR/PerformanceReviews/Create', compact('employees'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', PerformanceReview::class);

        // Normalise: if the caller used the legacy 'review_period' field, treat as 'period'
        if ($request->missing('period') && $request->filled('review_period')) {
            $request->merge(['period' => $request->input('review_period')]);
        }

        $data = $request->validate([
            'employee_id'          => 'required|exists:employees,id',
            'period'               => 'required|string|max:100',
            'review_period'        => 'nullable|string|max:50',
            'review_date'          => 'required|date',
            'overall_rating'       => 'nullable|numeric|min:1|max:5',
            'strengths'            => 'nullable|string',
            'improvements'         => 'nullable|string',
            'goals'                => 'nullable|string',
            'reviewer_notes'       => 'nullable|string',
            'ratings'              => 'nullable|array',
            'ratings.*.competency' => 'required_with:ratings|string',
            'ratings.*.rating'     => 'required_with:ratings|integer|min:1|max:5',
            'ratings.*.notes'      => 'nullable|string',
        ]);

        $review = PerformanceReview::create([
            'tenant_id'      => auth()->user()->tenant_id,
            'employee_id'    => $data['employee_id'],
            'reviewer_id'    => auth()->id(),
            'period'         => $data['period'],
            'review_period'  => $data['period'],
            'review_date'    => $data['review_date'],
            'status'         => 'draft',
            'overall_rating' => $data['overall_rating'] ?? null,
            'strengths'      => $data['strengths'] ?? null,
            'improvements'   => $data['improvements'] ?? null,
            'goals'          => $data['goals'] ?? null,
            'reviewer_notes' => $data['reviewer_notes'] ?? null,
        ]);

        if (!empty($data['ratings'])) {
            foreach ($data['ratings'] as $ratingData) {
                ReviewRating::create([
                    'tenant_id'             => $review->tenant_id,
                    'performance_review_id' => $review->id,
                    'competency'            => $ratingData['competency'],
                    'rating'                => $ratingData['rating'],
                    'notes'                 => $ratingData['notes'] ?? null,
                ]);
            }
        }

        return redirect()->route('hr.performance-reviews.show', $review);
    }

    public function show(PerformanceReview $performanceReview): Response
    {
        $this->authorize('view', $performanceReview);

        $performanceReview->load(['kpis', 'employee', 'reviewer', 'ratings']);

        $reviewData                      = $performanceReview->toArray();
        $reviewData['average_kpi_score'] = $performanceReview->average_kpi_score;
        $reviewData['is_complete']       = $performanceReview->is_complete;
        $reviewData['average_rating']    = $performanceReview->average_rating;

        return Inertia::render('HR/PerformanceReviews/Show', [
            'review' => $reviewData,
        ]);
    }

    public function destroy(PerformanceReview $performanceReview): RedirectResponse
    {
        $this->authorize('delete', $performanceReview);

        $performanceReview->delete();

        return redirect()->route('hr.performance-reviews.index');
    }

    public function submit(PerformanceReview $performanceReview): RedirectResponse
    {
        $this->authorize('update', $performanceReview);

        $performanceReview->submit();

        return back();
    }

    public function acknowledge(Request $request, PerformanceReview $performanceReview): RedirectResponse
    {
        $this->authorize('update', $performanceReview);

        $data = $request->validate([
            'comments' => 'nullable|string',
        ]);

        $performanceReview->acknowledge($data['comments'] ?? '');

        return back();
    }

    public function addKpi(Request $request, PerformanceReview $performanceReview): RedirectResponse
    {
        $this->authorize('update', $performanceReview);

        $data = $request->validate([
            'name'         => 'required|string',
            'target_score' => 'required|numeric|min:0.01',
            'actual_score' => 'required|numeric|min:0',
            'weight'       => 'nullable|numeric|min:0',
            'notes'        => 'nullable|string',
        ]);

        $performanceReview->kpis()->create([
            'tenant_id'             => $performanceReview->tenant_id,
            'performance_review_id' => $performanceReview->id,
            'name'                  => $data['name'],
            'target_score'          => $data['target_score'],
            'actual_score'          => $data['actual_score'],
            'weight'                => $data['weight'] ?? 1,
            'notes'                 => $data['notes'] ?? null,
        ]);

        return back()->with('success', 'KPI added.');
    }

    public function removeKpi(PerformanceReview $performanceReview, PerformanceKpi $kpi): RedirectResponse
    {
        $this->authorize('update', $performanceReview);

        $kpi->delete();

        return back();
    }

    public function updateKpi(Request $request, PerformanceReview $performanceReview, PerformanceKpi $kpi): RedirectResponse
    {
        $this->authorize('update', $performanceReview);

        $data = $request->validate([
            'actual_score' => 'required|numeric|min:0',
            'notes'        => 'nullable|string',
        ]);

        $kpi->update($data);

        return back();
    }
}
