<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Attachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    private array $allowedModels = [
        'invoices'       => \App\Modules\Finance\Models\Invoice::class,
        'bills'          => \App\Modules\Finance\Models\Bill::class,
        'expense-claims' => \App\Modules\HR\Models\ExpenseClaim::class,
        'projects'       => \App\Modules\Finance\Models\Project::class,
    ];

    public function store(Request $request, string $modelType, int $modelId): RedirectResponse
    {
        abort_unless(array_key_exists($modelType, $this->allowedModels), 404);

        $this->authorize('create', Attachment::class);

        $request->validate([
            'file' => 'required|file|max:20480|mimes:pdf,png,jpg,jpeg,webp,gif,csv,xlsx,docx,doc',
        ]);

        $modelClass = $this->allowedModels[$modelType];
        $model = $modelClass::findOrFail($modelId);

        $file = $request->file('file');
        $path = $file->store("attachments/{$modelType}/{$modelId}", 'local');

        Attachment::create([
            'tenant_id'       => auth()->user()->tenant_id,
            'attachable_type' => $modelClass,
            'attachable_id'   => $modelId,
            'filename'        => $file->getClientOriginalName(),
            'disk'            => 'local',
            'path'            => $path,
            'mime_type'       => $file->getMimeType(),
            'size'            => $file->getSize(),
            'uploaded_by'     => auth()->id(),
        ]);

        return back()->with('success', 'File attached.');
    }

    public function download(Attachment $attachment): Response|\Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('view', $attachment);

        abort_unless(Storage::disk($attachment->disk)->exists($attachment->path), 404);

        return Storage::disk($attachment->disk)->download($attachment->path, $attachment->filename);
    }

    public function destroy(Attachment $attachment): RedirectResponse
    {
        $this->authorize('delete', $attachment);

        Storage::disk($attachment->disk)->delete($attachment->path);
        $attachment->delete();

        return back()->with('success', 'Attachment deleted.');
    }
}
