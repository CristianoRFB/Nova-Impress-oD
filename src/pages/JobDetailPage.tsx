import {
  ArrowLeft, Check, CheckCircle2, ChevronDown, Clock3, FilePlus2, History,
  MessageSquarePlus, NotebookPen, Send, UserRoundCheck,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArtworkPreview } from '../components/ArtworkPreview';
import { Avatar } from '../components/Avatar';
import { Dialog } from '../components/Dialog';
import { StatusBadge } from '../components/StatusBadge';
import { PREVIEW_OPTIONS, STATUS_OPTIONS } from '../domain/config';
import { formatDate, formatDateTime, relativeTime } from '../domain/format';
import {
  getApprovedVersion, getCurrentVersion, getCustomer, getLatestEvent,
  getNextAction, getPendingChangeRequests, getUser,
} from '../domain/selectors';
import type { ChangeSource, JobStatus } from '../domain/types';
import { useDemo } from '../state/DemoContext';

type ModalKind = 'change' | 'version' | 'approval' | 'note' | null;

export function JobDetailPage() {
  const { jobId } = useParams();
  const { state, createChangeRequest, completeChangeRequest, createVersion, registerApproval, changeJobStatus, addNote } = useDemo();
  const job = state.jobs.find((entry) => entry.id === jobId);
  const [selectedVersionId, setSelectedVersionId] = useState(job?.currentVersionId ?? '');
  const [modal, setModal] = useState<ModalKind>(null);
  const [changeText, setChangeText] = useState('');
  const [changeSource, setChangeSource] = useState<ChangeSource>('WhatsApp');
  const [linkedVersionId, setLinkedVersionId] = useState(job?.currentVersionId ?? '');
  const [versionNote, setVersionNote] = useState('');
  const [previewKey, setPreviewKey] = useState('navy');
  const [resolveIds, setResolveIds] = useState<string[]>([]);
  const [approvalVersionId, setApprovalVersionId] = useState(job?.currentVersionId ?? '');
  const [approvedByName, setApprovedByName] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [noteText, setNoteText] = useState('');
  useEffect(() => {
    if (job?.currentVersionId) {
      setSelectedVersionId(job.currentVersionId);
      setLinkedVersionId(job.currentVersionId);
      setApprovalVersionId(job.currentVersionId);
    }
  }, [job?.currentVersionId]);
  const sortedEvents = useMemo(() => job ? [...job.activityEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp)) : [], [job]);
  if (!job) return <div className="not-found"><h1>Trabalho não encontrado</h1><p>Este item não existe ou os dados da demonstração foram restaurados.</p><Link className="button primary" to="/artes">Voltar aos trabalhos</Link></div>;
  const customer = getCustomer(state, job.customerId);
  const responsible = getUser(state, job.designerId);
  const current = getCurrentVersion(job);
  const approved = getApprovedVersion(job);
  const selected = job.versions.find((version) => version.id === selectedVersionId) ?? current;
  const latest = getLatestEvent(job);
  const pending = getPendingChangeRequests(job);
  const submitChange = (event: React.FormEvent) => {
    event.preventDefault();
    if (createChangeRequest(job.id, { text: changeText, source: changeSource, linkedVersionId })) { setChangeText(''); setModal(null); }
  };
  const submitVersion = (event: React.FormEvent) => {
    event.preventDefault();
    if (createVersion(job.id, { note: versionNote, previewKey, resolveChangeIds: resolveIds })) { setVersionNote(''); setResolveIds([]); setModal(null); }
  };
  const submitApproval = (event: React.FormEvent) => {
    event.preventDefault();
    if (registerApproval(job.id, { versionId: approvalVersionId, approvedByName, note: approvalNote })) { setApprovedByName(''); setApprovalNote(''); setModal(null); }
  };
  const submitNote = (event: React.FormEvent) => {
    event.preventDefault();
    if (addNote(job.id, noteText)) { setNoteText(''); setModal(null); }
  };
  return (
    <div className="page-stack detail-page">
      <Link className="back-link" to="/artes"><ArrowLeft size={17} /> Todos os trabalhos</Link>
      <header className="detail-header">
        <div className="detail-title"><div><p className="eyebrow">{job.referenceNumber} • {job.serviceType}</p><h1>{customer?.name}</h1><p>{job.title} — {job.description}</p></div><StatusBadge status={job.currentStatus} /></div>
        <div className="detail-meta"><Avatar user={responsible} /><span><small>Prazo</small><strong>{formatDate(job.deadline)}</strong></span><label className="status-select"><small>Alterar status</small><select value={job.currentStatus} onChange={(event) => changeJobStatus(job.id, event.target.value as JobStatus)}>{STATUS_OPTIONS.map(([value, config]) => <option value={value} key={value}>{config.label}</option>)}</select><ChevronDown size={14} /></label></div>
      </header>

      <section className="quick-summary" aria-labelledby="quick-summary-title">
        <header><div><p className="eyebrow">Leitura em poucos segundos</p><h2 id="quick-summary-title">Resumo rápido</h2></div><span className="summary-updated"><Clock3 size={15} /> Atualizado {relativeTime(job.updatedAt)}</span></header>
        <div className="summary-grid">
          <article className="version-summary current-summary"><small>VERSÃO ATUAL</small><strong>{current ? `V${current.versionNumber}` : 'Ainda não criada'}</strong><span>{current?.id === approved?.id ? 'Também é a aprovada pelo cliente' : 'É a versão em andamento'}</span></article>
          <article className="version-summary approved-summary"><small>VERSÃO APROVADA</small><strong>{approved ? `V${approved.versionNumber}` : 'Nenhuma'}</strong><span>{approved ? 'Aprovação registrada no histórico' : 'Aguardando confirmação do cliente'}</span></article>
          <article><small>ÚLTIMA ALTERAÇÃO</small><strong>{latest?.label ?? 'Sem eventos'}</strong><span>{latest ? relativeTime(latest.timestamp) : '—'}</span></article>
          <article><small>PENDÊNCIAS</small><strong>{pending.length ? `${pending.length} ${pending.length === 1 ? 'alteração' : 'alterações'}` : 'Nenhuma'}</strong><span>{pending[0]?.text ?? 'Sem solicitações abertas'}</span></article>
          <article><small>RESPONSÁVEL</small><strong>{responsible?.name}</strong><span>{responsible?.role}</span></article>
          <article className="next-action"><small>PRÓXIMA AÇÃO</small><strong>{getNextAction(job)}</strong><span>Orientação derivada do estado atual</span></article>
        </div>
      </section>

      <div className="action-bar" aria-label="Ações do trabalho">
        <button className="button primary" onClick={() => setModal('change')} disabled={!current}><MessageSquarePlus size={17} /> Solicitar alteração</button>
        <button className="button secondary" onClick={() => { setPreviewKey(current?.previewKey === 'navy' ? 'emerald' : 'navy'); setResolveIds(pending.map((item) => item.id)); setModal('version'); }}><FilePlus2 size={17} /> Criar nova versão</button>
        <button className="button secondary" onClick={() => { setApprovalVersionId(selected?.id ?? current?.id ?? ''); setModal('approval'); }} disabled={!selected}><UserRoundCheck size={17} /> Registrar aprovação</button>
        <button className="button ghost" onClick={() => setModal('note')}><NotebookPen size={17} /> Observação</button>
        <a className="button ghost" href="#historico"><History size={17} /> Ver histórico</a>
      </div>

      <section className="artwork-workspace">
        <div className="preview-panel panel">
          <header className="panel-header"><div><p className="eyebrow">Prévia selecionada</p><h2>{selected ? `Versão V${selected.versionNumber}` : 'Sem arte criada'}</h2></div><div className="preview-flags">{selected?.id === current?.id && <span className="flag-current">VERSÃO ATUAL</span>}{selected?.id === approved?.id && <span className="flag-approved"><Check size={14} /> APROVADA PELO CLIENTE</span>}</div></header>
          {selected ? <ArtworkPreview job={job} version={selected} /> : <div className="preview-empty">Crie a primeira versão para visualizar a arte.</div>}
          {selected && <div className="file-meta"><div><small>Arquivo</small><strong>{selected.fileName}</strong></div><div><small>Criada em</small><strong>{formatDateTime(selected.createdAt)}</strong></div><div><small>Criada por</small><strong>{getUser(state, selected.createdByUserId)?.name}</strong></div><div className="file-note"><small>Nota da versão</small><strong>{selected.note || 'Sem nota'}</strong></div></div>}
        </div>
        <aside className="versions-panel panel">
          <header className="panel-header"><div><p className="eyebrow">Histórico imutável</p><h2>Versões</h2></div><span className="count-pill">{job.versions.length}</span></header>
          <div className="version-list">{[...job.versions].sort((a, b) => b.versionNumber - a.versionNumber).map((version) => <button className={selected?.id === version.id ? 'selected' : ''} onClick={() => setSelectedVersionId(version.id)} key={version.id}><span className="version-number">V{version.versionNumber}</span><span><strong>{version.id === current?.id ? 'Versão atual' : version.id === approved?.id ? 'Aprovada pelo cliente' : 'Versão anterior'}</strong><small>{formatDateTime(version.createdAt)}</small></span>{version.id === approved?.id && <CheckCircle2 size={18} />}</button>)}</div>
          <div className="version-legend"><span><i className="legend-current" /> Atual</span><span><i className="legend-approved" /> Aprovada</span></div>
        </aside>
      </section>

      <div className="detail-lower-grid">
        <section className="panel changes-panel">
          <header className="panel-header"><div><p className="eyebrow">Pedidos do cliente</p><h2>Alterações solicitadas</h2></div><span className="count-pill">{job.changeRequests.length}</span></header>
          {job.changeRequests.length === 0 ? <p className="section-empty">Nenhuma alteração registrada.</p> : <div className="change-list">{[...job.changeRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((change) => {
            const linked = job.versions.find((item) => item.id === change.linkedVersionId);
            const resolved = job.versions.find((item) => item.id === change.resolvedByVersionId);
            return <article className={`change-item ${change.status === 'REALIZADA' ? 'change-done' : ''}`} key={change.id}><div className="change-status">{change.status === 'REALIZADA' ? <CheckCircle2 size={19} /> : <Clock3 size={19} />}</div><div><div className="change-top"><span className={`change-pill ${change.status === 'REALIZADA' ? 'done' : ''}`}>{change.status}</span><span>{change.source} • {formatDateTime(change.createdAt)}</span></div><p>{change.text}</p><small>Solicitada sobre V{linked?.versionNumber ?? '—'}{resolved ? ` • Resolvida na V${resolved.versionNumber}` : ''} • Registrada por {getUser(state, change.createdByUserId)?.name}</small>{change.status === 'PENDENTE' && <button className="inline-action" onClick={() => completeChangeRequest(job.id, change.id)}><Check size={15} /> Marcar como realizada</button>}</div></article>;
          })}</div>}
        </section>
        <section className="panel timeline-panel" id="historico">
          <header className="panel-header"><div><p className="eyebrow">Rastreabilidade</p><h2>Histórico do trabalho</h2></div><span className="count-pill">{sortedEvents.length} eventos</span></header>
          <div className="timeline">{sortedEvents.map((item) => <article key={item.id}><span className={`timeline-icon event-${item.type.toLowerCase()}`}><History size={15} /></span><div><div><strong>{item.label}</strong><time dateTime={item.timestamp}>{formatDateTime(item.timestamp)}</time></div>{item.detail && <p>{item.detail}</p>}<small>{getUser(state, item.userId)?.name}{item.versionId ? ` • ${job.versions.find((version) => version.id === item.versionId)?.fileName ?? 'Versão preservada'}` : ''}</small></div></article>)}</div>
        </section>
      </div>

      <Dialog open={modal === 'change'} onClose={() => setModal(null)} title="Solicitar alteração" description="Registre exatamente o que precisa mudar e a versão de origem.">
        <form className="form-stack" onSubmit={submitChange}><label>Descrição da alteração<textarea required minLength={5} rows={4} value={changeText} onChange={(event) => setChangeText(event.target.value)} placeholder="Ex.: Atualizar horário de atendimento." /></label><div className="form-grid"><label>Origem<select value={changeSource} onChange={(event) => setChangeSource(event.target.value as ChangeSource)}><option>WhatsApp</option><option>Telefone</option><option>Presencial</option><option>Outro</option></select></label><label>Versão relacionada<select value={linkedVersionId} onChange={(event) => setLinkedVersionId(event.target.value)}>{job.versions.map((version) => <option value={version.id} key={version.id}>V{version.versionNumber} — {version.fileName}</option>)}</select></label></div><p className="form-context">Registrado por <strong>{state.users.find((user) => user.id === state.currentUserId)?.name}</strong> no ambiente demonstrativo.</p><div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setModal(null)}>Cancelar</button><button className="button primary"><MessageSquarePlus size={17} /> Registrar alteração</button></div></form>
      </Dialog>

      <Dialog open={modal === 'version'} onClose={() => setModal(null)} title={`Criar V${Math.max(0, ...job.versions.map((item) => item.versionNumber)) + 1}`} description="A nova versão vira a atual. A versão aprovada permanece inalterada.">
        <form className="form-stack" onSubmit={submitVersion}><div className="version-warning"><Send size={19} /><div><strong>{approved ? `V${approved.versionNumber} continuará aprovada` : 'Ainda não há versão aprovada'}</strong><span>O histórico anterior nunca será sobrescrito.</span></div></div><label>O que mudou nesta versão?<textarea required minLength={3} rows={3} value={versionNote} onChange={(event) => setVersionNote(event.target.value)} placeholder="Descreva os ajustes aplicados." /></label><fieldset><legend>Variação visual da prévia</legend><div className="preview-options">{PREVIEW_OPTIONS.map((option) => <label className={previewKey === option.key ? 'selected' : ''} key={option.key}><input type="radio" name="preview" value={option.key} checked={previewKey === option.key} onChange={() => setPreviewKey(option.key)} /><i className={`swatch swatch-${option.key}`} />{option.label}</label>)}</div></fieldset>{pending.length > 0 && <fieldset><legend>Alterações resolvidas nesta versão</legend><div className="check-list">{pending.map((change) => <label key={change.id}><input type="checkbox" checked={resolveIds.includes(change.id)} onChange={(event) => setResolveIds(event.target.checked ? [...resolveIds, change.id] : resolveIds.filter((id) => id !== change.id))} /><span>{change.text}</span></label>)}</div></fieldset>}<div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setModal(null)}>Cancelar</button><button className="button primary"><FilePlus2 size={17} /> Criar nova versão</button></div></form>
      </Dialog>

      <Dialog open={modal === 'approval'} onClose={() => setModal(null)} title="Registrar aprovação" description="A aprovação será vinculada à versão exata selecionada abaixo.">
        <form className="form-stack" onSubmit={submitApproval}><div className="approval-choice"><label>Versão aprovada<select value={approvalVersionId} onChange={(event) => setApprovalVersionId(event.target.value)}>{[...job.versions].sort((a, b) => b.versionNumber - a.versionNumber).map((version) => <option value={version.id} key={version.id}>V{version.versionNumber}{version.id === current?.id ? ' — versão atual' : ' — versão anterior'}</option>)}</select></label><strong>Você está aprovando a V{job.versions.find((version) => version.id === approvalVersionId)?.versionNumber}</strong>{approvalVersionId !== current?.id && <p>Atenção: esta não é a versão atual. A aprovação anterior é permitida, mas ficará explicitamente registrada.</p>}</div><label>Quem aprovou?<input required minLength={2} value={approvedByName} onChange={(event) => setApprovedByName(event.target.value)} placeholder="Nome fictício do responsável pelo cliente" /></label><label>Observação opcional<textarea rows={3} value={approvalNote} onChange={(event) => setApprovalNote(event.target.value)} placeholder="Ex.: Aprovada para produção." /></label><p className="form-context">Aprovação registrada internamente por <strong>{state.users.find((user) => user.id === state.currentUserId)?.name}</strong>.</p><div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setModal(null)}>Cancelar</button><button className="button primary"><UserRoundCheck size={17} /> Confirmar aprovação da V{job.versions.find((version) => version.id === approvalVersionId)?.versionNumber}</button></div></form>
      </Dialog>

      <Dialog open={modal === 'note'} onClose={() => setModal(null)} title="Adicionar observação" description="A observação entra no histórico operacional do trabalho.">
        <form className="form-stack" onSubmit={submitNote}><label>Observação<textarea required minLength={3} rows={4} value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Registre um contexto útil para a equipe." /></label><div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setModal(null)}>Cancelar</button><button className="button primary"><NotebookPen size={17} /> Adicionar ao histórico</button></div></form>
      </Dialog>
    </div>
  );
}
