import type { ArtworkJob, ArtworkVersion, AttentionItem, DemoState } from './types';

export const getCurrentVersion = (job: ArtworkJob) =>
  job.versions.find((item) => item.id === job.currentVersionId) ?? null;

export const getApprovedVersion = (job: ArtworkJob) =>
  job.versions.find((item) => item.id === job.approvedVersionId) ?? null;

export const getPendingChangeRequests = (job: ArtworkJob) =>
  job.changeRequests.filter((item) => item.status === 'PENDENTE');

export const getLatestEvent = (job: ArtworkJob) =>
  [...job.activityEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0] ?? null;

export const isWaitingApproval = (job: ArtworkJob) => job.currentStatus === 'AWAITING_APPROVAL';
export const hasPendingChanges = (job: ArtworkJob) => getPendingChangeRequests(job).length > 0;

export function getNextAction(job: ArtworkJob): string {
  const pending = getPendingChangeRequests(job).length;
  const current = getCurrentVersion(job);
  const approved = getApprovedVersion(job);
  if (!current) return 'Criar primeira arte';
  if (pending) return `Realizar ${pending} ${pending === 1 ? 'alteração pendente' : 'alterações pendentes'}`;
  if (current.id !== approved?.id) {
    if (job.currentStatus === 'AWAITING_APPROVAL') return `Registrar retorno sobre a V${current.versionNumber}`;
    return `Enviar V${current.versionNumber} para aprovação`;
  }
  if (job.currentStatus === 'APPROVED') return 'Liberar versão aprovada';
  if (job.currentStatus === 'RELEASED') return 'Acompanhar finalização';
  if (job.currentStatus === 'FINISHED') return 'Nenhuma ação pendente';
  if (job.currentStatus === 'ART_READY') return `Enviar V${current.versionNumber} para aprovação`;
  return 'Continuar preparação da arte';
}

export function getAttentionReason(job: ArtworkJob) {
  const pending = getPendingChangeRequests(job);
  const current = getCurrentVersion(job);
  const approved = getApprovedVersion(job);
  if (pending.length) return `${pending.length} ${pending.length === 1 ? 'alteração pendente' : 'alterações pendentes'}`;
  if (job.currentStatus === 'AWAITING_APPROVAL') return `V${current?.versionNumber ?? '—'} aguardando aprovação`;
  if (current && approved && current.id !== approved.id) return `V${current.versionNumber} atual; V${approved.versionNumber} ainda aprovada`;
  if (job.currentStatus === 'ART_READY') return 'Arte pronta, ainda não enviada';
  return null;
}

export function getDashboardMetrics(state: DemoState, now = new Date()) {
  const today = now.toDateString();
  return {
    waitingApprovalCount: state.jobs.filter(isWaitingApproval).length,
    pendingChangeCount: state.jobs.reduce((total, job) => total + getPendingChangeRequests(job).length, 0),
    approvedTodayCount: state.jobs.filter((job) => job.approvals.some((approval) => new Date(approval.registeredAt).toDateString() === today)).length,
    revisionPendingCount: state.jobs.filter((job) => getCurrentVersion(job)?.id !== getApprovedVersion(job)?.id && Boolean(getCurrentVersion(job))).length,
  };
}

export function getAttentionItems(state: DemoState): AttentionItem[] {
  const items = state.jobs.flatMap((job) => {
    const reason = getAttentionReason(job);
    if (!reason) return [];
    const latest = getLatestEvent(job);
    const pending = hasPendingChanges(job);
    return [{
      jobId: job.id,
      title: reason,
      detail: getNextAction(job),
      tone: pending ? 'warning' as const : 'info' as const,
      timestamp: latest?.timestamp ?? job.updatedAt,
    }];
  });
  return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 6);
}

export function findVersion(job: ArtworkJob, versionId: string): ArtworkVersion {
  const version = job.versions.find((item) => item.id === versionId);
  if (!version) throw new Error('Versão não encontrada neste trabalho.');
  return version;
}

export const getCustomer = (state: DemoState, customerId: string) =>
  state.customers.find((item) => item.id === customerId);

export const getUser = (state: DemoState, userId: string) =>
  state.users.find((item) => item.id === userId);
