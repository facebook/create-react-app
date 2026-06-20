import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';

interface Props {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    maxChars?: number;
    minHeight?: string;
    readOnly?: boolean;
}

function ToolbarButton({
    onClick,
    active,
    title,
    children,
}: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onClick(); }}
            title={title}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
        >
            {children}
        </button>
    );
}

export default function RichTextEditor({
    content,
    onChange,
    placeholder = 'Start writing…',
    maxChars,
    minHeight = '200px',
    readOnly = false,
}: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({ placeholder }),
            ...(maxChars ? [CharacterCount.configure({ limit: maxChars })] : []),
        ],
        content,
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Sync external content changes (e.g. reset)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content, false);
        }
    }, [content]);

    if (!editor) return null;

    const chars = maxChars ? (editor.storage.characterCount?.characters?.() ?? 0) : null;

    return (
        <div className="border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            {!readOnly && (
                <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b">
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                        <strong>B</strong>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                        <em>I</em>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
                        <s>S</s>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code">
                        {'<>'}
                    </ToolbarButton>

                    <span className="w-px h-5 bg-gray-200 mx-1" />

                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
                        H1
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
                        H2
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
                        H3
                    </ToolbarButton>

                    <span className="w-px h-5 bg-gray-200 mx-1" />

                    <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
                        ≡
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
                        1.
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
                        ❝
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
                        {'{ }'}
                    </ToolbarButton>

                    <span className="w-px h-5 bg-gray-200 mx-1" />

                    <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider" active={false}>
                        —
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo" active={false}>
                        ↩
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo" active={false}>
                        ↪
                    </ToolbarButton>
                </div>
            )}

            <EditorContent
                editor={editor}
                className="prose prose-sm max-w-none px-4 py-3 focus:outline-none"
                style={{ minHeight }}
            />

            {maxChars && chars !== null && (
                <div className="px-3 py-1 bg-gray-50 border-t text-xs text-right text-gray-400">
                    {chars} / {maxChars}
                </div>
            )}
        </div>
    );
}
