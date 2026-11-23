import { Plus } from 'lucide-react';
import type { FaqItem } from '@/lib/content/faqs';

/** Native details/summary FAQ grid so every answer expands cleanly in document flow without JavaScript. */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="faq-grid">
      {items.map((item, index) => (
        <details key={item.question} className="faq-item">
          <summary className="faq-question">
            <span className="faq-num type-label">{String(index + 1).padStart(2, '0')}</span>
            <span className="faq-question-text">{item.question}</span>
            <Plus size={18} strokeWidth={1.75} className="faq-icon" aria-hidden />
          </summary>
          <p className="faq-answer">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
