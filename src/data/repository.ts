import { createSeed } from '../domain/seed';
import { validateState } from '../domain/actions';
import type { DemoState, StorageLoadResult } from '../domain/types';

export const STORAGE_KEY = 'nova-impressao-art-demo:v1';

export interface DemoRepository {
  load(): StorageLoadResult;
  save(state: DemoState): boolean;
  reset(): DemoState;
}

export class LocalStorageDemoRepository implements DemoRepository {
  constructor(private readonly storage: Storage = window.localStorage) {}

  load(): StorageLoadResult {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return { state: createSeed(), recovered: false, persistenceAvailable: true };
      const parsed = JSON.parse(raw) as DemoState;
      const errors = validateState(parsed);
      if (errors.length) {
        const state = createSeed();
        this.save(state);
        return { state, recovered: true, persistenceAvailable: true };
      }
      return { state: parsed, recovered: false, persistenceAvailable: true };
    } catch {
      const state = createSeed();
      try { this.storage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
      return { state, recovered: true, persistenceAvailable: false };
    }
  }

  save(state: DemoState): boolean {
    try {
      if (validateState(state).length) return false;
      this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }

  reset(): DemoState {
    const state = createSeed();
    try {
      this.storage.removeItem(STORAGE_KEY);
      this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* in-memory state still resets */ }
    return state;
  }
}
