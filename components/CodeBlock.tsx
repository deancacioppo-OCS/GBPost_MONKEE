
import React from 'react';
import { useState } from 'react';
import ClipboardIcon from './icons/ClipboardIcon';

interface CodeBlockProps {
  content: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-slate-800 rounded-lg my-4">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
        aria-label="Copy to clipboard"
      >
        {copied ? 'Copied!' : <ClipboardIcon className="w-5 h-5" />}
      </button>
      <pre className="p-4 text-sm text-slate-200 overflow-x-auto whitespace-pre-wrap break-words">
        <code>{content}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
