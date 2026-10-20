'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const QuillEditor = dynamic(() => import('react-quill-new'), { ssr: false });

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['link'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'indent',
  'link',
];

const RichTextEditor = ({
  label,
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-200">
          {label}
        </label>
      )}
      <div className="rich-text-editor-wrapper">
        <QuillEditor
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
        />
      </div>
      <style>{`
        .rich-text-editor-wrapper .ql-toolbar {
          background: #11141a;
          border: 1px solid #2b3342 !important;
          border-bottom: 1px solid #2b3342 !important;
          border-radius: 8px 8px 0 0;
        }
        .rich-text-editor-wrapper .ql-container {
          background: #11141a;
          border: 1px solid #2b3342 !important;
          border-top: none !important;
          border-radius: 0 0 8px 8px;
          min-height: 180px;
          font-size: 14px;
          color: #e5e7eb;
        }
        .rich-text-editor-wrapper .ql-editor {
          min-height: 180px;
          color: #e5e7eb;
        }
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: #6b7280;
          font-style: normal;
        }
        .rich-text-editor-wrapper .ql-stroke {
          stroke: #9ca3af !important;
        }
        .rich-text-editor-wrapper .ql-fill {
          fill: #9ca3af !important;
        }
        .rich-text-editor-wrapper .ql-picker-label {
          color: #9ca3af !important;
        }
        .rich-text-editor-wrapper .ql-picker-options {
          background: #11141a !important;
          border: 1px solid #2b3342 !important;
          color: #e5e7eb !important;
        }
        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #3b82f6 !important;
        }
        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #3b82f6 !important;
        }
        .rich-text-editor-wrapper .ql-picker-label:hover,
        .rich-text-editor-wrapper .ql-picker-label.ql-active {
          color: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
};

export { RichTextEditor };
export default RichTextEditor;
