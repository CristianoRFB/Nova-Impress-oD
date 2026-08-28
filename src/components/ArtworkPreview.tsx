import type { ArtworkJob, ArtworkVersion } from '../domain/types';

const palettes: Record<string, { primary: string; accent: string; paper: string; ink: string }> = {
  emerald: { primary: '#174b42', accent: '#e8a63a', paper: '#f5f0e6', ink: '#14332e' },
  navy: { primary: '#183a59', accent: '#76c6d4', paper: '#eef4f4', ink: '#102d46' },
  terracotta: { primary: '#a04732', accent: '#f1c477', paper: '#fff5e8', ink: '#4d2a22' },
  plum: { primary: '#593d57', accent: '#d4a75c', paper: '#f7f1f4', ink: '#362433' },
};

export function ArtworkPreview({ job, version, compact = false }: { job: ArtworkJob; version: ArtworkVersion; compact?: boolean }) {
  const palette = palettes[version.previewKey] ?? palettes.emerald;
  const style = {
    '--preview-primary': palette.primary,
    '--preview-accent': palette.accent,
    '--preview-paper': palette.paper,
    '--preview-ink': palette.ink,
  } as React.CSSProperties;
  const isCard = job.serviceType.includes('Cartão');
  const isShirt = job.serviceType.includes('Camiseta');
  const isLabel = job.serviceType.includes('Rótulo') || job.serviceType.includes('Adesivo');
  return (
    <div className={`art-preview ${compact ? 'art-preview-compact' : ''}`} style={style} aria-label={`Prévia fictícia da V${version.versionNumber}`}>
      <div className={`mock-art ${isCard ? 'mock-card' : ''} ${isShirt ? 'mock-shirt' : ''} ${isLabel ? 'mock-label' : ''}`}>
        <div className="mock-brand-mark"><span>{job.title.slice(0, 1)}</span></div>
        <div className="mock-copy">
          <small>{job.serviceType}</small>
          <strong>{job.title}</strong>
          <span>{version.versionNumber === 1 ? 'Uma nova impressão começa aqui.' : 'Clareza que transforma espaços.'}</span>
        </div>
        <div className="mock-lines"><i /><i /><i /></div>
        <div className="mock-version">PROPOSTA • V{version.versionNumber}</div>
      </div>
    </div>
  );
}
