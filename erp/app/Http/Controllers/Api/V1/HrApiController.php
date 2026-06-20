<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HrApiController extends ApiController
{
    /**
     * GET /api/v1/hr/employees
     */
    public function employees(Request $request): JsonResponse
    {
        $query = Employee::with('department:id,name');

        if ($departmentId = $request->query('department_id')) {
            $query->where('department_id', $departmentId);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->select(['id', 'first_name', 'last_name', 'employee_number', 'department_id', 'position', 'status'])
                           ->latest()
                           ->paginate(20);

        $items = collect($paginator->items())->map(fn (Employee $emp) => [
            'id'              => $emp->id,
            'name'            => $emp->full_name,
            'employee_number' => $emp->employee_number,
            'department'      => $emp->department?->name,
            'position'        => $emp->position,
            'status'          => $emp->status,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $items,
            'meta'    => [
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/v1/hr/employees/{id}
     */
    public function employee(int $id): JsonResponse
    {
        $employee = Employee::with('department')->findOrFail($id);

        return $this->success([
            'id'              => $employee->id,
            'name'            => $employee->full_name,
            'first_name'      => $employee->first_name,
            'last_name'       => $employee->last_name,
            'employee_number' => $employee->employee_number,
            'email'           => $employee->email,
            'phone'           => $employee->phone,
            'position'        => $employee->position,
            'status'          => $employee->status,
            'start_date'      => $employee->start_date?->toDateString(),
            'department'      => $employee->department,
        ]);
    }

    /**
     * GET /api/v1/hr/departments
     */
    public function departments(): JsonResponse
    {
        $departments = Department::withCount('employees')->get();

        return $this->success($departments);
    }

    /**
     * GET /api/v1/hr/leave-requests
     */
    public function leaveRequests(Request $request): JsonResponse
    {
        $query = LeaveRequest::with(['employee:id,first_name,last_name,employee_number']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($employeeId = $request->query('employee_id')) {
            $query->where('employee_id', $employeeId);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }
}
