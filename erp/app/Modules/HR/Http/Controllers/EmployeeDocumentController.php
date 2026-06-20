<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeDocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', EmployeeDocument::class);

        $documents = EmployeeDocument::with('employee')
            ->when($request->employee_id, fn ($q) => $q->where('employee_id', $request->employee_id))
            ->when($request->document_type, fn ($q) => $q->where('document_type', $request->document_type))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('HR/EmployeeDocuments/Index', [
            'documents' => $documents,
            'filters'   => $request->only(['employee_id', 'document_type']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', EmployeeDocument::class);

        $validated = $request->validate([
            'employee_id'     => 'required|exists:employees,id',
            'document_type'   => 'required|string|max:50',
            'document_name'   => 'required|string|max:255',
            'document_number' => 'nullable|string|max:100',
            'file_url'        => 'nullable|string|max:500',
            'issued_date'     => 'nullable|date',
            'expiry_date'     => 'nullable|date',
            'notes'           => 'nullable|string',
        ]);

        EmployeeDocument::create([
            'tenant_id' => auth()->user()->tenant_id,
            ...$validated,
        ]);

        return back()->with('success', 'Document added.');
    }

    public function show(EmployeeDocument $employeeDocument): Response
    {
        $this->authorize('view', $employeeDocument);
        $employeeDocument->load(['employee', 'verifiedBy']);

        return Inertia::render('HR/EmployeeDocuments/Show', [
            'document' => $employeeDocument,
        ]);
    }

    public function verify(EmployeeDocument $employeeDocument): RedirectResponse
    {
        $this->authorize('update', $employeeDocument);
        $employeeDocument->verify(auth()->id());

        return back()->with('success', 'Document verified.');
    }

    public function destroy(EmployeeDocument $employeeDocument): RedirectResponse
    {
        $this->authorize('delete', $employeeDocument);
        $employeeDocument->delete();

        return back()->with('success', 'Document deleted.');
    }
}
