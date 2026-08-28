import { X } from 'lucide-react';
import { useEffect, useRef, type PropsWithChildren } from 'react';

interface DialogProps extends PropsWithChildren {
  open: boolean;
  title: string;
  description?: string;
  onClose(): void;
}

export function Dialog({ open, title, description, onClose, children }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const frame = window.requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('input, textarea, select, button')?.focus());
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus();
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <div className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="dialog-title" ref={panelRef}>
        <header className="dialog-header">
          <div>
            <h2 id="dialog-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar janela"><X size={20} /></button>
        </header>
        <div className="dialog-content">{children}</div>
      </div>
    </div>
  );
}
