
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownMessageProps {
    content: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
    return (
        <div className="prose prose-sm max-w-none text-sm leading-relaxed text-gray-800 dark:text-gray-200">
            <ReactMarkdown
                components={{
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-2 border rounded-lg border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">{children}</table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th className="px-3 py-2 bg-gray-50 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">{children}</th>
                    ),
                    td: ({ children }) => (
                        <td className="px-3 py-2 text-xs border-t border-gray-100">{children}</td>
                    ),
                    ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>,
                    li: ({ children }) => <li className="text-sm">{children}</li>,
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};
