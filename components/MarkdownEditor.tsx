import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  isDarkMode: boolean;
  readOnly?: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ 
  content, 
  onChange, 
  isDarkMode,
  readOnly = false
}) => {
  const [isPreview, setIsPreview] = useState(true);

  return (
    <div className="markdown-editor-container">
      {/* Editor/Preview Toggle */}
      {!readOnly && (
        <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
          <button
            onClick={() => setIsPreview(false)}
            className={`px-4 py-2 rounded-t transition-colors ${
              !isPreview
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            编辑
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`px-4 py-2 rounded-t transition-colors ${
              isPreview
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            预览
          </button>
          <div className="ml-auto flex items-center text-xs text-slate-500 dark:text-slate-400">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            支持 Markdown 格式
          </div>
        </div>
      )}

      {/* Editor or Preview */}
      {!isPreview && !readOnly ? (
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-96 p-4 font-mono text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          placeholder="在此输入 Markdown 格式的内容...

支持的格式：
- **粗体** 和 *斜体*
- # 标题
- [链接](url)
- ![图片](url)
- 列表、表格等

示例：
## 概述
这是一段**重要**的内容。

### 详细说明
1. 第一点
2. 第二点
"
        />
      ) : (
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-6 mb-4 pb-2 border-b-2 border-slate-200 dark:border-slate-700" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-5 mb-3 pb-1 border-b border-slate-200 dark:border-slate-700" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2" {...props} />
              ),
              h4: ({ node, ...props }) => (
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-3 mb-2" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside space-y-1 mb-3 text-slate-700 dark:text-slate-300" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside space-y-1 mb-3 text-slate-700 dark:text-slate-300" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="ml-4" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-50 dark:bg-blue-900/20 text-slate-700 dark:text-slate-300 italic" {...props} />
              ),
              code: ({ node, inline, ...props }: any) =>
                inline ? (
                  <code className="bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                ) : (
                  <code className="block bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-3 rounded-lg overflow-x-auto text-sm font-mono mb-3" {...props} />
                ),
              pre: ({ node, ...props }) => (
                <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto mb-3" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto mb-4 -mx-2 px-2">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm" {...props} />
                </div>
              ),
              thead: ({ node, ...props }) => (
                <thead className="bg-slate-100 dark:bg-slate-800" {...props} />
              ),
              tbody: ({ node, ...props }) => (
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th className="px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-semibold text-slate-900 dark:text-white" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300" {...props} />
              ),
              img: ({ node, ...props }) => (
                <img className="rounded-lg shadow-md max-w-full h-auto my-4" {...props} alt={props.alt || ''} />
              ),
              hr: ({ node, ...props }) => (
                <hr className="my-6 border-slate-200 dark:border-slate-700" {...props} />
              ),
            }}
          >
            {content || '*暂无内容*'}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;
