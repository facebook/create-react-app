<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Documents\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentsApiController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = Document::where('tenant_id', $tenantId)->with('folder');

        if ($request->filled('folder_id')) {
            $query->where('folder_id', $request->folder_id);
        }

        if ($request->filled('category')) {
            $query->where('tags', 'like', '%' . $request->category . '%');
        }

        return $this->paginated($query->latest()->paginate(15));
    }

    public function show(int $id): JsonResponse
    {
        $document = Document::with(['folder', 'uploader', 'versions'])->findOrFail($id);

        return $this->success($document);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'folder_id'   => 'nullable|integer|exists:document_folders,id',
            'file_path'   => 'required|string|max:500',
            'file_name'   => 'required|string|max:255',
            'file_size'   => 'nullable|integer',
            'mime_type'   => 'nullable|string|max:100',
            'tags'        => 'nullable|array',
            'tags.*'      => 'string',
        ]);

        $validated['tenant_id']   = $tenantId;
        $validated['uploaded_by'] = $request->user()->id;
        $validated['version']     = 1;

        $document = Document::create($validated);

        return $this->success($document, 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $document = Document::findOrFail($id);
        $document->delete();

        return $this->success(['deleted' => true]);
    }
}
