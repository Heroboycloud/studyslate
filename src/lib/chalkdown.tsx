import React from 'react';

interface ChalkdownProps {
  content: string;
}

/**
 * Simple markdown-lite renderer for chalkboard aesthetic
 * Supports: ## headings, **bold**, -/numbered lists, ```code```
 */
export function Chalkdown({ content }: ChalkdownProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let listItems: string[] = [];
  let orderedListItems: string[] = [];
  let listType: 'unordered' | 'ordered' | null = null;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2 text-chalk-fog">
          {listItems.map((item, i) => (
            <li key={i}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
    if (orderedListItems.length > 0) {
      elements.push(
        <ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1 my-2 text-chalk-fog">
          {orderedListItems.map((item, i) => (
            <li key={i}>{parseInline(item)}</li>
          ))}
        </ol>
      );
      orderedListItems = [];
    }
    listType = null;
  };

  const parseInline = (text: string): React.ReactNode => {
    // Handle bold **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-chalk-yellow">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    // Code block handling
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${index}`} className="bg-chalkboard-dark rounded p-4 my-3 overflow-x-auto font-mono text-sm text-chalk-mint">
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    // Empty line
    if (!line.trim()) {
      flushList();
      return;
    }

    // Heading ## 
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${index}`} className="text-xl font-bold text-chalk-white mt-6 mb-3 font-display">
          {parseInline(line.slice(3))}
        </h2>
      );
      return;
    }

    // Heading ###
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${index}`} className="text-lg font-semibold text-chalk-yellow mt-4 mb-2 font-display">
          {parseInline(line.slice(4))}
        </h3>
      );
      return;
    }

    // Unordered list item -
    if (line.match(/^[-*]\s+/)) {
      if (listType === 'ordered') flushList();
      listType = 'unordered';
      listItems.push(line.replace(/^[-*]\s+/, ''));
      return;
    }

    // Ordered list item 1.
    if (line.match(/^\d+\.\s+/)) {
      if (listType === 'unordered') flushList();
      listType = 'ordered';
      orderedListItems.push(line.replace(/^\d+\.\s+/, ''));
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${index}`} className="my-2 text-chalk-fog leading-relaxed">
        {parseInline(line)}
      </p>
    );
  });

  // Flush any remaining list
  flushList();

  // Handle unclosed code block
  if (codeLines.length > 0) {
    elements.push(
      <pre key="code-final" className="bg-chalkboard-dark rounded p-4 my-3 overflow-x-auto font-mono text-sm text-chalk-mint">
        <code>{codeLines.join('\n')}</code>
      </pre>
    );
  }

  return <div className="chalkdown">{elements}</div>;
}
