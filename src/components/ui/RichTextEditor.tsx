"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b p-2 dark:border-gray-600">
        {/* Text style */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="editor-btn"
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="editor-btn"
        >
          <Italic size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className="editor-btn"
        >
          <UnderlineIcon size={16} />
        </button>

        <div className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-500" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="editor-btn"
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="editor-btn"
        >
          <ListOrdered size={16} />
        </button>

        <div className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-500" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className="editor-btn"
        >
          <AlignLeft size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className="editor-btn"
        >
          <AlignCenter size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className="editor-btn"
        >
          <AlignRight size={16} />
        </button>
      </div>

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none min-h-[100px] p-4 text-gray-800 dark:prose-invert dark:text-gray-200"
      />
    </div>
  );
}
