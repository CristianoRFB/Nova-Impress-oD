import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import {
  addNote as addNoteAction,
  changeJobStatus as changeJobStatusAction,
  completeChangeRequest as completeChangeRequestAction,
  createChangeRequest as createChangeRequestAction,
  createVersion as createVersionAction,
  registerApproval as registerApprovalAction,
  setCurrentUser as setCurrentUserAction,
} from '../domain/actions';
import type { ChangeSource, DemoState, JobStatus } from '../domain/types';
import { LocalStorageDemoRepository } from '../data/repository';

interface Toast { message: string; tone: 'success' | 'error' | 'info' }

interface DemoContextValue {
  state: DemoState;
  toast: Toast | null;
  storageNotice: string | null;
  dismissToast(): void;
  setCurrentUser(userId: string): void;
  createChangeRequest(jobId: string, input: { text: string; source: ChangeSource; linkedVersionId: string }): boolean;
  completeChangeRequest(jobId: string, changeId: string): boolean;
  createVersion(jobId: string, input: { note: string; previewKey: string; resolveChangeIds: string[] }): boolean;
  registerApproval(jobId: string, input: { versionId: string; approvedByName: string; note?: string }): boolean;
  changeJobStatus(jobId: string, status: JobStatus): boolean;
  addNote(jobId: string, text: string): boolean;
  resetDemo(): void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: PropsWithChildren) {
  const repository = useMemo(() => new LocalStorageDemoRepository(), []);
  const initial = useMemo(() => repository.load(), [repository]);
  const [state, setState] = useState(initial.state);
  const [toast, setToast] = useState<Toast | null>(null);
  const [storageNotice, setStorageNotice] = useState<string | null>(() => {
    if (initial.recovered) return 'Os dados locais estavam inválidos e a demonstração foi restaurada com segurança.';
    if (!initial.persistenceAvailable) return 'O armazenamento local não está disponível; as mudanças valerão somente nesta sessão.';
    return null;
  });

  const commit = useCallback((operation: (current: DemoState) => DemoState, success: string) => {
    try {
      const next = operation(state);
      setState(next);
      if (!repository.save(next)) setStorageNotice('Não foi possível salvar localmente. As mudanças permanecem nesta sessão.');
      setToast({ message: success, tone: 'success' });
      return true;
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Não foi possível concluir a ação.', tone: 'error' });
      return false;
    }
  }, [repository, state]);

  const value = useMemo<DemoContextValue>(() => ({
    state,
    toast,
    storageNotice,
    dismissToast: () => setToast(null),
    setCurrentUser: (userId) => commit((current) => setCurrentUserAction(current, userId), 'Usuário da demonstração atualizado.'),
    createChangeRequest: (jobId, input) => commit((current) => createChangeRequestAction(current, jobId, input), 'Solicitação de alteração registrada.'),
    completeChangeRequest: (jobId, changeId) => commit((current) => completeChangeRequestAction(current, jobId, changeId), 'Alteração marcada como realizada.'),
    createVersion: (jobId, input) => commit((current) => createVersionAction(current, jobId, input), 'Nova versão criada sem alterar a versão aprovada.'),
    registerApproval: (jobId, input) => commit((current) => registerApprovalAction(current, jobId, input), 'Aprovação registrada na versão selecionada.'),
    changeJobStatus: (jobId, status) => commit((current) => changeJobStatusAction(current, jobId, status), 'Status atualizado.'),
    addNote: (jobId, text) => commit((current) => addNoteAction(current, jobId, text), 'Observação adicionada ao histórico.'),
    resetDemo: () => {
      setState(repository.reset());
      setStorageNotice(null);
      setToast({ message: 'Dados da demonstração restaurados.', tone: 'success' });
    },
  }), [state, toast, storageNotice, commit, repository]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo deve ser usado dentro de DemoProvider.');
  return context;
}
