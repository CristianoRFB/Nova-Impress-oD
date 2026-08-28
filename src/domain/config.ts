import type { JobStatus } from './types';

export const JOB_STATUS: Record<JobStatus, { label: string; tone: string }> = {
  AWAITING_ART: { label: 'Aguardando arte', tone: 'neutral' },
  CREATING: { label: 'Em criação', tone: 'info' },
  ART_READY: { label: 'Arte pronta', tone: 'violet' },
  AWAITING_APPROVAL: { label: 'Aguardando aprovação', tone: 'warning' },
  CHANGES_REQUESTED: { label: 'Alteração solicitada', tone: 'danger' },
  APPROVED: { label: 'Aprovada', tone: 'success' },
  RELEASED: { label: 'Liberada', tone: 'teal' },
  FINISHED: { label: 'Finalizada', tone: 'neutral' },
};

export const STATUS_OPTIONS = Object.entries(JOB_STATUS) as [JobStatus, { label: string; tone: string }][];

export const PREVIEW_OPTIONS = [
  { key: 'emerald', label: 'Verde institucional' },
  { key: 'navy', label: 'Azul profundo' },
  { key: 'terracotta', label: 'Terracota editorial' },
  { key: 'plum', label: 'Ameixa elegante' },
] as const;
