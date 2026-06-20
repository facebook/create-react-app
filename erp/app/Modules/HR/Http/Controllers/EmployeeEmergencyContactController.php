<?php

namespace App\Modules\HR\Http\Controllers;

use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeEmergencyContact;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeEmergencyContactController
{
    public function index(Employee $employee): Response
    {
        $contacts = $employee->emergencyContacts()->orderByDesc('is_primary')->get();
        return Inertia::render('HR/EmergencyContacts/Index', compact('employee', 'contacts'));
    }

    public function create(Employee $employee): Response
    {
        return Inertia::render('HR/EmergencyContacts/Create', compact('employee'));
    }

    public function store(Request $request, Employee $employee): RedirectResponse
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'relationship'    => 'required|string|max:100',
            'phone_primary'   => 'required|string|max:50',
            'phone_secondary' => 'nullable|string|max:50',
            'email'           => 'nullable|email|max:255',
            'address'         => 'nullable|string',
            'is_primary'      => 'boolean',
            'notes'           => 'nullable|string',
        ]);

        $data['employee_id'] = $employee->id;

        $contact = EmployeeEmergencyContact::create($data);

        if (!empty($data['is_primary'])) {
            $contact->markAsPrimary();
        }

        return redirect()->route('hr.employees.emergency-contacts.index', $employee);
    }

    public function show(EmployeeEmergencyContact $emergencyContact): Response
    {
        $emergencyContact->load('employee');
        return Inertia::render('HR/EmergencyContacts/Show', [
            'employee' => $emergencyContact->employee,
            'contact'  => $emergencyContact,
        ]);
    }

    public function edit(EmployeeEmergencyContact $emergencyContact): Response
    {
        return Inertia::render('HR/EmergencyContacts/Edit', [
            'contact' => $emergencyContact,
        ]);
    }

    public function update(Request $request, EmployeeEmergencyContact $emergencyContact): RedirectResponse
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'relationship'    => 'required|string|max:100',
            'phone_primary'   => 'required|string|max:50',
            'phone_secondary' => 'nullable|string|max:50',
            'email'           => 'nullable|email|max:255',
            'address'         => 'nullable|string',
            'is_primary'      => 'boolean',
            'notes'           => 'nullable|string',
        ]);

        $emergencyContact->update($data);

        if (!empty($data['is_primary'])) {
            $emergencyContact->markAsPrimary();
        }

        return redirect()->route('hr.employees.emergency-contacts.index', $emergencyContact->employee_id);
    }

    public function destroy(EmployeeEmergencyContact $emergencyContact): RedirectResponse
    {
        $employeeId = $emergencyContact->employee_id;
        $emergencyContact->delete();
        return redirect()->route('hr.employees.emergency-contacts.index', $employeeId);
    }

    public function markPrimary(Employee $employee, EmployeeEmergencyContact $emergencyContact): RedirectResponse
    {
        $emergencyContact->markAsPrimary();
        return redirect()->route('hr.employees.emergency-contacts.index', $employee);
    }
}
