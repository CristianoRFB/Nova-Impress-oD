import { beforeEach, describe, expect, it } from 'vitest';
import { createSeed } from '../domain/seed';
import { LocalStorageDemoRepository, STORAGE_KEY } from './repository';

describe('persistência da demonstração', () => {
  beforeEach(() => localStorage.clear());

  it('carrega seed inicial e reidrata estado salvo', () => {
    const repository = new LocalStorageDemoRepository(localStorage);
    const initial = repository.load();
    expect(initial.state.jobs).toHaveLength(10);
    const changed = { ...initial.state, currentUserId: 'user-marina' };
    expect(repository.save(changed)).toBe(true);
    expect(repository.load().state.currentUserId).toBe('user-marina');
  });

  it('recupera JSON corrompido sem quebrar', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    const result = new LocalStorageDemoRepository(localStorage).load();
    expect(result.recovered).toBe(true);
    expect(result.state.jobs).toHaveLength(10);
  });

  it('rejeita schema inválido e reset restaura o caso estrela', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...createSeed(), schemaVersion: 99 }));
    const repository = new LocalStorageDemoRepository(localStorage);
    expect(repository.load().recovered).toBe(true);
    const reset = repository.reset();
    const star = reset.jobs.find((job) => job.referenceNumber === 'ART-1048')!;
    expect(star.versions).toHaveLength(3);
    expect(star.currentVersionId).toBe(star.approvedVersionId);
  });
});
