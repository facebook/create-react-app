<?php

namespace App\Modules\Documents\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Documents\Models\Document;
use App\Modules\Documents\Models\DocumentFolder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $documents = Document::with(['folder', 'uploader'])
            ->when($request->folder_id, fn ($q) => $q->where('folder_id', $request->folder_id))
            ->when($request->search, function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($inner) use ($search) {
                    $inner->where('title', 'like', "%{$search}%")
                        ->orWhereJsonContains('tags', $search);
                });
            })
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        $folders = DocumentFolder::with('children')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get();

        return Inertia::render('Documents/Index', [
            'documents' => $documents,
            'folders'   => $folders,
            'filters'   => $request->only(['folder_id', 'search']),
        ]);
    }

    public function folders(): Response
    {
        $folders = DocumentFolder::with('children')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get()
            ->map(function (DocumentFolder $folder) {
                return [
                    'id'             => $folder->id,
                    'name'           => $folder->name,
                    'document_count' => $folder->documentCount(),
                    'children'       => $folder->children->map(function (DocumentFolder $child) {
                        return [
                            'id'             => $child->id,
                            'name'           => $child->name,
                            'document_count' => $child->documentCount(),
                            'children'       => [],
                        ];
                    }),
                ];
            });

        return Inertia::render('Documents/Folders', [
            'folders' => $folders,
        ]);
    }

    public function show(Document $document): Response
    {
        $document->load(['folder', 'uploader', 'versions.uploader']);

        return Inertia::render('Documents/Show', [
            'document' => $document,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'folder_id'   => 'nullable|exists:document_folders,id',
            'file_path'   => 'required|string',
            'file_name'   => 'nullable|string|max:255',
            'file_size'   => 'nullable|integer',
            'mime_type'   => 'nullable|string|max:255',
            'tags'        => 'nullable|array',
        ]);

        $document = Document::create([
            'tenant_id'   => auth()->user()->tenant_id,
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'folder_id'   => $validated['folder_id'] ?? null,
            'file_path'   => $validated['file_path'],
            'file_name'   => $validated['file_name'] ?? basename($validated['file_path']),
            'file_size'   => $validated['file_size'] ?? null,
            'mime_type'   => $validated['mime_type'] ?? null,
            'tags'        => $validated['tags'] ?? null,
            'version'     => 1,
            'uploaded_by' => auth()->id(),
        ]);

        return redirect()->route('documents.show', $document)->with('success', 'Document uploaded.');
    }

    public function uploadPage(): Response
    {
        $folders = DocumentFolder::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Documents/Upload', [
            'folders' => $folders,
        ]);
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file'      => 'required|file|max:51200',
            'folder_id' => 'nullable|exists:document_folders,id',
        ]);

        $file      = $request->file('file');
        $tenant    = auth()->user()->tenant_id;
        $directory = "documents/{$tenant}/" . date('Y/m');
        $fileName  = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path      = $file->storeAs($directory, $fileName, 'public');

        $document = Document::create([
            'tenant_id'   => $tenant,
            'title'       => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'folder_id'   => $request->folder_id,
            'file_path'   => $path,
            'file_name'   => $file->getClientOriginalName(),
            'file_size'   => $file->getSize(),
            'mime_type'   => $file->getMimeType(),
            'version'     => 1,
            'uploaded_by' => auth()->id(),
        ]);

        return response()->json([
            'id'       => $document->id,
            'title'    => $document->title,
            'file_name' => $document->file_name,
            'file_size' => $document->file_size,
            'url'      => route('documents.show', $document),
        ]);
    }

    public function update(Request $request, Document $document): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'folder_id'   => 'nullable|exists:document_folders,id',
            'tags'        => 'nullable|array',
        ]);

        $document->update($validated);

        return redirect()->route('documents.show', $document)->with('success', 'Document updated.');
    }

    public function destroy(Document $document): RedirectResponse
    {
        $document->delete();

        return redirect()->route('documents.index')->with('success', 'Document deleted.');
    }

    public function addVersion(Request $request, Document $document): RedirectResponse
    {
        $validated = $request->validate([
            'file_path' => 'required|string',
            'file_name' => 'required|string|max:255',
            'file_size' => 'nullable|integer',
            'notes'     => 'nullable|string',
        ]);

        $document->addVersion(
            filePath:   $validated['file_path'],
            fileName:   $validated['file_name'],
            fileSize:   $validated['file_size'] ?? null,
            uploadedBy: auth()->id(),
            notes:      $validated['notes'] ?? null,
        );

        return redirect()->route('documents.show', $document)->with('success', 'New version added.');
    }

    public function storeFolder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'parent_id' => 'nullable|exists:document_folders,id',
        ]);

        DocumentFolder::create([
            'tenant_id'  => auth()->user()->tenant_id,
            'name'       => $validated['name'],
            'parent_id'  => $validated['parent_id'] ?? null,
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Folder created.');
    }

    public function destroyFolder(DocumentFolder $folder): RedirectResponse
    {
        if ($folder->documentCount() > 0) {
            return redirect()->back()->withErrors(['folder' => 'Cannot delete a folder that contains documents.']);
        }

        $folder->delete();

        return redirect()->back()->with('success', 'Folder deleted.');
    }

    public function search(Request $request): Response
    {
        $query = $request->get('q', '');

        $documents = Document::with(['folder', 'uploader'])
            ->when($query, function ($q) use ($query) {
                $q->where(function ($inner) use ($query) {
                    $inner->where('title', 'like', "%{$query}%")
                        ->orWhereJsonContains('tags', $query);
                });
            })
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Documents/Search', [
            'documents' => $documents,
            'query'     => $query,
        ]);
    }
}
