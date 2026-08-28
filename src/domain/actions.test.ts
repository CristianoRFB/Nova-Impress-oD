import { describe, expect, it, vi } from 'vitest';
import { completeChangeRequest, createChangeRequest, createVersion, registerApproval, validateState } from './actions';
import { createSeed } from './seed';
import { getApprovedVersion, getAttentionItems, getCurrentVersion, getDashboardMetrics, getNextAction } from './selectors';

const fixedNow = new Date('2026-08-28T14:00:00-03:00');

describe('versionamento e aprovação', () => {
  it('mantém versões anteriores, incrementa e preserva a aprovação', () => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
    const seed = createSeed(fixedNow);
    const job = seed.jobs.find((item) => item.referenceNumber === 'ART-1048')!;
    expect(job.versions.map((version) => version.versionNumber)).toEqual([1, 2, 3]);
    expect(getCurrentVersion(job)?.versionNumber).toBe(3);
    expect(getApprovedVersion(job)?.versionNumber).toBe(3);

    const next = createVersion(seed, job.id, { note: 'Atualização do horário de atendimento.', previewKey: 'navy', resolveChangeIds: [] });
    const updated = next.jobs.find((item) => item.id === job.id)!;
    expect(updated.versions.map((version) => version.versionNumber)).toEqual([1, 2, 3, 4]);
    expect(getCurrentVersion(updated)?.versionNumber).toBe(4);
    expect(getApprovedVersion(updated)?.versionNumber).toBe(3);
    expect(updated.activityEvents.at(-1)?.type).toBe('VERSION_CREATED');
    expect(validateState(next)).toEqual([]);
    vi.useRealTimers();
  });

  it('aprova uma versão válida e rejeita versão inexistente', () => {
    const seed = createSeed(fixedNow);
    const job = seed.jobs[0];
    expect(() => registerApproval(seed, job.id, { versionId: 'missing', approvedByName: 'Cliente' })).toThrow('Versão não encontrada');
    const v2 = job.versions[1];
    const next = registerApproval(seed, job.id, { versionId: v2.id, approvedByName: 'Alex' });
    const updated = next.jobs[0];
    expect(updated.approvedVersionId).toBe(v2.id);
    expect(updated.approvals.at(-1)?.versionId).toBe(v2.id);
    expect(updated.activityEvents.at(-1)?.type).toBe('APPROVAL_REGISTERED');
  });
});

describe('solicitações e dados derivados', () => {
  it('cria e conclui uma alteração vinculada à versão', () => {
    const seed = createSeed(fixedNow);
    const job = seed.jobs[0];
    const created = createChangeRequest(seed, job.id, { text: 'Atualizar horário de atendimento.', source: 'WhatsApp', linkedVersionId: job.currentVersionId! });
    const afterCreate = created.jobs[0];
    const change = afterCreate.changeRequests.at(-1)!;
    expect(change.status).toBe('PENDENTE');
    expect(change.linkedVersionId).toBe(job.currentVersionId);
    expect(afterCreate.currentStatus).toBe('CHANGES_REQUESTED');

    const completed = completeChangeRequest(created, job.id, change.id);
    const done = completed.jobs[0].changeRequests.at(-1)!;
    expect(done.status).toBe('REALIZADA');
    expect(done.completedByUserId).toBe(seed.currentUserId);
    expect(completed.jobs[0].activityEvents.at(-1)?.type).toBe('CHANGE_COMPLETED');
  });

  it('calcula dashboard, atenção e próxima ação sem valores hardcoded', () => {
    const seed = createSeed(fixedNow);
    const metrics = getDashboardMetrics(seed, fixedNow);
    expect(metrics.waitingApprovalCount).toBeGreaterThan(0);
    expect(metrics.pendingChangeCount).toBeGreaterThan(0);
    expect(metrics.approvedTodayCount).toBeGreaterThan(0);
    expect(getAttentionItems(seed).some((item) => item.jobId === 'job-art-1056')).toBe(true);
    expect(getNextAction(seed.jobs.find((job) => job.id === 'job-art-1056')!)).toContain('alteração pendente');
  });
});
