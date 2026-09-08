import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

export function FormattedMarkdown({ content, className = '', isUser = false }: FormattedMarkdownProps) {
  if (!content) return null;

  if (isUser) {
    return <div className={`whitespace-pre-wrap ${className}`}>{content}</div>;
  }

  return (
    <div
      className={`prose prose-invert prose-slate max-w-none text-slate-200 leading-relaxed text-sm break-words
        prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-100
        prose-h1:text-base prose-h1:mt-3 prose-h1:mb-1.5 prose-h1:text-indigo-200
        prose-h2:text-sm prose-h2:mt-2.5 prose-h2:mb-1.5 prose-h2:text-indigo-200
        prose-h3:text-xs prose-h3:mt-2 prose-h3:mb-1 prose-h3:uppercase prose-h3:tracking-wider prose-h3:text-indigo-300
        prose-p:my-1.5 prose-p:leading-relaxed
        prose-ul:my-2 prose-ul:pl-4 prose-ul:list-disc prose-ul:space-y-1
        prose-ol:my-2 prose-ol:pl-4 prose-ol:list-decimal prose-ol:space-y-1
        prose-li:my-0.5 prose-li:text-slate-200
        prose-strong:text-white prose-strong:font-semibold
        prose-em:text-slate-300 prose-em:italic
        prose-blockquote:border-l-2 prose-blockquote:border-indigo-500/50 prose-blockquote:pl-3 prose-blockquote:my-2 prose-blockquote:text-slate-300 prose-blockquote:italic
        prose-code:text-indigo-200 prose-code:bg-slate-800/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl prose-pre:p-3 prose-pre:my-2
        prose-hr:border-slate-800 prose-hr:my-3
        prose-table:w-full prose-table:my-2 prose-table:text-xs
        prose-th:border-b prose-th:border-slate-700 prose-th:py-1.5 prose-th:px-2 prose-th:text-left prose-th:text-slate-200
        prose-td:border-b prose-td:border-slate-800 prose-td:py-1.5 prose-td:px-2 prose-td:text-slate-300
        ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
