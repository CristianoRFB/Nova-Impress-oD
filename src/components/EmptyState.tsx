import { SearchX } from 'lucide-react';

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="empty-state"><SearchX size={32} /><h3>{title}</h3><p>{detail}</p></div>;
}
