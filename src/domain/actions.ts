import type { ChangeSource, DemoState, JobStatus } from './types';
import { findVersion, getCurrentVersion } from './selectors';
import { JOB_STATUS } from './config';

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const nowIso = () => new Date().toISOString();

function updateJob(state: DemoState, jobId: string, updater: (job: DemoState['jobs'][number]) => DemoState['jobs'][number]): DemoState {
  const exists = state.jobs.some((job) => job.id === jobId);
  if (!exists) throw new Error('Trabalho não encontrado.');
  return { ...state, jobs: state.jobs.map((job) => job.id === jobId ? updater(job) : job) };
}

export function setCurrentUser(state: DemoState, userId: string): DemoState {
  if (!state.users.some((user) => user.id === userId)) throw new Error('Usuário da demonstração inválido.');
  return { ...state, currentUserId: userId };
}

export function createChangeRequest(
  state: DemoState,
  jobId: string,
  input: { text: string; source: ChangeSource; linkedVersionId: string },
): DemoState {
  const text = input.text.trim();
  if (text.length < 5) throw new Error('Descreva a alteração com pelo menos 5 caracteres.');
  return updateJob(state, jobId, (job) => {
    const linked = findVersion(job, input.linkedVersionId);
    const timestamp = nowIso();
    return {
      ...job,
      currentStatus: 'CHANGES_REQUESTED',
      updatedAt: timestamp,
      changeRequests: [...job.changeRequests, {
        id: uid('change'), jobId, linkedVersionId: linked.id, text, source: input.source,
        status: 'PENDENTE', createdAt: timestamp, createdByUserId: state.currentUserId,
      }],
      activityEvents: [...job.activityEvents, {
        id: uid('event'), jobId, timestamp, userId: state.currentUserId, type: 'CHANGE_REQUESTED',
        label: `Alteração solicitada na V${linked.versionNumber}`, detail: `${input.source}: ${text}`, versionId: linked.id,
      }],
    };
  });
}

export function completeChangeRequest(state: DemoState, jobId: string, changeId: string): DemoState {
  return updateJob(state, jobId, (job) => {
    const change = job.changeRequests.find((item) => item.id === changeId);
    if (!change) throw new Error('Solicitação de alteração não encontrada.');
    if (change.status === 'REALIZADA') return job;
    const timestamp = nowIso();
    const changes = job.changeRequests.map((item) => item.id === changeId
      ? { ...item, status: 'REALIZADA' as const, completedAt: timestamp, completedByUserId: state.currentUserId }
      : item);
    const stillPending = changes.some((item) => item.status === 'PENDENTE');
    return {
      ...job,
      currentStatus: stillPending ? 'CHANGES_REQUESTED' : 'CREATING',
      updatedAt: timestamp,
      changeRequests: changes,
      activityEvents: [...job.activityEvents, {
        id: uid('event'), jobId, timestamp, userId: state.currentUserId, type: 'CHANGE_COMPLETED',
        label: 'Alteração marcada como realizada', detail: change.text, versionId: change.linkedVersionId,
      }],
    };
  });
}

export function createVersion(
  state: DemoState,
  jobId: string,
  input: { note: string; previewKey: string; resolveChangeIds: string[] },
): DemoState {
  if (input.note.trim().length < 3) throw new Error('Inclua uma nota curta sobre a nova versão.');
  return updateJob(state, jobId, (job) => {
    const max = Math.max(0, ...job.versions.map((item) => item.versionNumber));
    const versionNumber = max + 1;
    const versionId = `${job.id}-v${versionNumber}-${Date.now()}`;
    const timestamp = nowIso();
    const resolveSet = new Set(input.resolveChangeIds);
    const invalidResolve = input.resolveChangeIds.some((id) => !job.changeRequests.some((change) => change.id === id));
    if (invalidResolve) throw new Error('Uma das alterações selecionadas não pertence a este trabalho.');
    const versions = job.versions.map((item) => item.id === job.approvedVersionId ? item : { ...item, status: 'SUPERSEDED' as const });
    versions.push({
      id: versionId, jobId, versionNumber, fileName: `${job.referenceNumber.replace('-', '_')}_V${versionNumber}.pdf`,
      previewKey: input.previewKey, previewVariant: versionNumber, createdAt: timestamp,
      createdByUserId: state.currentUserId, note: input.note.trim(), status: 'AWAITING_APPROVAL',
    });
    return {
      ...job,
      currentVersionId: versionId,
      currentStatus: 'AWAITING_APPROVAL',
      updatedAt: timestamp,
      versions,
      changeRequests: job.changeRequests.map((change) => resolveSet.has(change.id) ? {
        ...change, status: 'REALIZADA' as const, completedAt: timestamp,
        completedByUserId: state.currentUserId, resolvedByVersionId: versionId,
      } : change),
      activityEvents: [...job.activityEvents, {
        id: uid('event'), jobId, timestamp, userId: state.currentUserId, type: 'VERSION_CREATED',
        label: `V${versionNumber} criada`, detail: input.note.trim(), versionId,
      }],
    };
  });
}

export function registerApproval(
  state: DemoState,
  jobId: string,
  input: { versionId: string; approvedByName: string; note?: string },
): DemoState {
  if (input.approvedByName.trim().length < 2) throw new Error('Informe quem aprovou esta versão.');
  return updateJob(state, jobId, (job) => {
    const approved = findVersion(job, input.versionId);
    const timestamp = nowIso();
    const isCurrent = job.currentVersionId === approved.id;
    return {
      ...job,
      approvedVersionId: approved.id,
      currentStatus: isCurrent ? 'APPROVED' : job.currentStatus,
      updatedAt: timestamp,
      versions: job.versions.map((item) => item.id === approved.id
        ? { ...item, status: 'APPROVED' as const }
        : item.id === job.currentVersionId
          ? { ...item, status: 'AWAITING_APPROVAL' as const }
          : { ...item, status: 'SUPERSEDED' as const }),
      approvals: [...job.approvals, {
        id: uid('approval'), jobId, versionId: approved.id, registeredAt: timestamp,
        registeredByUserId: state.currentUserId, approvedByName: input.approvedByName.trim(), note: input.note?.trim() || undefined,
      }],
      activityEvents: [...job.activityEvents, {
        id: uid('event'), jobId, timestamp, userId: state.currentUserId, type: 'APPROVAL_REGISTERED',
        label: `V${approved.versionNumber} aprovada`, detail: `Aprovação de ${input.approvedByName.trim()}${input.note?.trim() ? ` • ${input.note.trim()}` : ''}`,
        versionId: approved.id,
      }],
    };
  });
}

export function changeJobStatus(state: DemoState, jobId: string, status: JobStatus): DemoState {
  return updateJob(state, jobId, (job) => {
    if (job.currentStatus === status) return job;
    const timestamp = nowIso();
    return {
      ...job, currentStatus: status, updatedAt: timestamp,
      activityEvents: [...job.activityEvents, {
        id: uid('event'), jobId, timestamp, userId: state.currentUserId, type: 'STATUS_CHANGED',
        label: 'Status atualizado', detail: JOB_STATUS[status].label,
      }],
    };
  });
}

export function addNote(state: DemoState, jobId: string, textInput: string): DemoState {
  const text = textInput.trim();
  if (text.length < 3) throw new Error('Escreva uma observação com pelo menos 3 caracteres.');
  return updateJob(state, jobId, (job) => {
    const timestamp = nowIso();
    return {
      ...job, updatedAt: timestamp, notes: [...job.notes, text],
      activityEvents: [...job.activityEvents, {
        id: uid('event'), jobId, timestamp, userId: state.currentUserId, type: 'NOTE_ADDED',
        label: 'Observação adicionada', detail: text,
      }],
    };
  });
}

export function validateState(state: DemoState): string[] {
  const errors: string[] = [];
  if (state.schemaVersion !== 1) errors.push('Versão de schema incompatível.');
  const allIds = [...state.users.map((x) => x.id), ...state.customers.map((x) => x.id), ...state.jobs.map((x) => x.id)];
  if (new Set(allIds).size !== allIds.length) errors.push('Existem IDs duplicados nas entidades principais.');
  for (const job of state.jobs) {
    const versionIds = new Set(job.versions.map((item) => item.id));
    if (versionIds.size !== job.versions.length) errors.push(`${job.id}: versões duplicadas.`);
    if (job.currentVersionId && !versionIds.has(job.currentVersionId)) errors.push(`${job.id}: versão atual inválida.`);
    if (job.approvedVersionId && !versionIds.has(job.approvedVersionId)) errors.push(`${job.id}: versão aprovada inválida.`);
    const ordered = [...job.versions].sort((a, b) => a.versionNumber - b.versionNumber);
    if (ordered.some((item, index) => item.versionNumber !== index + 1)) errors.push(`${job.id}: numeração não monotônica.`);
    if (job.approvals.some((item) => !versionIds.has(item.versionId))) errors.push(`${job.id}: aprovação inválida.`);
    if (job.changeRequests.some((item) => !versionIds.has(item.linkedVersionId) || (item.resolvedByVersionId && !versionIds.has(item.resolvedByVersionId)))) errors.push(`${job.id}: alteração referencia versão inválida.`);
    if (job.currentVersionId && getCurrentVersion(job) === null) errors.push(`${job.id}: versão atual ausente.`);
  }
  return errors;
}
