import React, { useCallback, useRef, useState } from 'react';

export interface UploadedFile {
    file: File;
    name: string;
    size: number;
    preview?: string;
    status: 'pending' | 'uploading' | 'done' | 'error';
    progress: number;
    error?: string;
}

interface Props {
    onUpload: (files: File[]) => void | Promise<void>;
    accept?: string;
    maxSizeMb?: number;
    multiple?: boolean;
    label?: string;
    hint?: string;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDropzone({
    onUpload,
    accept,
    maxSizeMb = 10,
    multiple = true,
    label = 'Drop files here or click to browse',
    hint,
}: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const maxBytes = maxSizeMb * 1024 * 1024;

    const processFiles = useCallback(async (selected: FileList | null) => {
        if (!selected) return;

        const newFiles: UploadedFile[] = Array.from(selected).map((file) => ({
            file,
            name: file.name,
            size: file.size,
            status: file.size > maxBytes ? 'error' : 'pending',
            progress: 0,
            error: file.size > maxBytes ? `File too large (max ${maxSizeMb}MB)` : undefined,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        }));

        setFiles((prev) => [...prev, ...newFiles]);

        const valid = newFiles.filter((f) => f.status === 'pending').map((f) => f.file);
        if (valid.length === 0) return;

        setFiles((prev) =>
            prev.map((f) => valid.includes(f.file) ? { ...f, status: 'uploading' } : f)
        );

        try {
            await onUpload(valid);
            setFiles((prev) =>
                prev.map((f) => valid.includes(f.file) ? { ...f, status: 'done', progress: 100 } : f)
            );
        } catch {
            setFiles((prev) =>
                prev.map((f) => valid.includes(f.file) ? { ...f, status: 'error', error: 'Upload failed' } : f)
            );
        }
    }, [onUpload, maxBytes, maxSizeMb]);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
    }, [processFiles]);

    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = () => setIsDragging(false);

    const removeFile = (idx: number) => {
        setFiles((prev) => {
            const file = prev[idx];
            if (file.preview) URL.revokeObjectURL(file.preview);
            return prev.filter((_, i) => i !== idx);
        });
    };

    const STATUS_ICON: Record<string, string> = {
        pending: '⏳',
        uploading: '⬆',
        done: '✓',
        error: '✗',
    };

    const STATUS_COLOR: Record<string, string> = {
        pending: 'text-gray-500',
        uploading: 'text-blue-500',
        done: 'text-green-600',
        error: 'text-red-500',
    };

    return (
        <div className="space-y-3">
            <div
                onClick={() => inputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`relative flex flex-col items-center justify-center gap-2 px-6 py-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
            >
                <div className="text-4xl text-gray-300">📁</div>
                <div className="text-sm font-medium text-gray-600">{label}</div>
                {hint && <div className="text-xs text-gray-400">{hint}</div>}
                <div className="text-xs text-gray-400">Max {maxSizeMb}MB per file</div>
                <input
                    ref={inputRef}
                    type="file"
                    className="sr-only"
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => processFiles(e.target.files)}
                />
            </div>

            {files.length > 0 && (
                <ul className="space-y-2">
                    {files.map((f, idx) => (
                        <li key={idx} className="flex items-center gap-3 bg-white border rounded-lg px-3 py-2 text-sm">
                            {f.preview ? (
                                <img src={f.preview} alt={f.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                            ) : (
                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                                    📄
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-800 truncate">{f.name}</div>
                                <div className="text-xs text-gray-400">{formatBytes(f.size)}</div>
                                {f.status === 'uploading' && (
                                    <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: `${f.progress || 50}%` }} />
                                    </div>
                                )}
                                {f.error && <div className="text-xs text-red-500 mt-0.5">{f.error}</div>}
                            </div>
                            <span className={`text-base font-bold flex-shrink-0 ${STATUS_COLOR[f.status]}`}>
                                {STATUS_ICON[f.status]}
                            </span>
                            <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="text-gray-400 hover:text-red-500 flex-shrink-0 text-lg leading-none"
                                title="Remove"
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
