<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\EmployeeCertification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeCertificationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', EmployeeCertification::class);

        $query = EmployeeCertification::with(['employee']);

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        $certifications = $query->latest()->paginate(20);

        return Inertia::render('HR/EmployeeCertifications/Index', compact('certifications'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', EmployeeCertification::class);

        $data = $request->validate([
            'employee_id'        => 'required|exists:employees,id',
            'name'               => 'required|string|max:255',
            'issuing_body'       => 'nullable|string|max:255',
            'certificate_number' => 'nullable|string|max:255',
            'issued_date'        => 'required|date',
            'expiry_date'        => 'nullable|date|after:issued_date',
        ]);

        EmployeeCertification::create([
            'tenant_id' => auth()->user()->tenant_id,
            ...$data,
        ]);

        return redirect()->back()->with('success', 'Certification added.');
    }

    public function destroy(EmployeeCertification $employeeCertification): RedirectResponse
    {
        $this->authorize('delete', $employeeCertification);

        $employeeCertification->delete();

        return redirect()->back()->with('success', 'Certification deleted.');
    }
}
