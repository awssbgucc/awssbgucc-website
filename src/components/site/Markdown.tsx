import ReactMarkdown from 'react-markdown';

// react-markdown does not render raw HTML, so post and event bodies cannot inject markup.
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-site max-w-[62ch]">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
