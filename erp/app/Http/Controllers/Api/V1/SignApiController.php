<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Sign\Models\SignRequest;
use App\Modules\Sign\Models\SignRequestSigner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SignApiController extends ApiController
{
    /**
     * GET /api/v1/sign/documents
     */
    public function documents(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = SignRequest::where('tenant_id', $tenantId);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/sign/documents/{id}
     */
    public function showDocument(int $id): JsonResponse
    {
        $document = SignRequest::with(['signers'])->findOrFail($id);

        return $this->success($document);
    }

    /**
     * POST /api/v1/sign/documents
     */
    public function storeDocument(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'document_name' => 'required|string|max:255',
            'document_path' => 'required|string',
            'message'       => 'nullable|string',
            'signers'       => 'nullable|array',
            'signers.*.signer_name'  => 'required_with:signers|string|max:255',
            'signers.*.signer_email' => 'required_with:signers|email|max:255',
            'signers.*.sequence'     => 'nullable|integer|min:1',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id']  = $tenantId;
        $validated['created_by'] = $request->user()->id;
        $validated['status']     = 'draft';

        $signers = $validated['signers'] ?? [];
        unset($validated['signers']);

        $document = SignRequest::create($validated);

        foreach ($signers as $index => $signer) {
            $document->signers()->create([
                'tenant_id'    => $tenantId,
                'signer_name'  => $signer['signer_name'],
                'signer_email' => $signer['signer_email'],
                'sequence'     => $signer['sequence'] ?? ($index + 1),
                'status'       => 'pending',
            ]);
        }

        return $this->success($document->load('signers'), 201);
    }

    /**
     * POST /api/v1/sign/documents/{id}/send
     */
    public function sendForSignature(int $id): JsonResponse
    {
        $document = SignRequest::findOrFail($id);
        $document->update(['status' => 'sent']);

        return $this->success($document);
    }

    /**
     * PUT /api/v1/sign/documents/{id}/status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $document = SignRequest::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:draft,sent,signed,declined,expired,cancelled',
        ]);

        $document->update($validated);

        return $this->success($document);
    }
}
