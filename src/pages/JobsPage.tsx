import { ArrowRight, Filter, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArtworkPreview } from '../components/ArtworkPreview';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { JOB_STATUS } from '../domain/config';
import { formatDate, relativeTime } from '../domain/format';
import { getApprovedVersion, getCurrentVersion, getCustomer, getUser } from '../domain/selectors';
import type { JobStatus } from '../domain/types';
import { useDemo } from '../state/DemoContext';

const FILTERS: { value: '' | JobStatus; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'AWAITING_ART', label: 'Aguardando arte' },
  { value: 'AWAITING_APPROVAL', label: 'Aguardando aprovação' },
  { value: 'CHANGES_REQUESTED', label: 'Alteração solicitada' },
  { value: 'APPROVED', label: 'Aprovado' },
  { value: 'FINISHED', label: 'Finalizado' },
];

export function JobsPage() {
  const { state } = useDemo();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const status = (params.get('status') ?? '') as '' | JobStatus;
  const owner = params.get('owner') ?? '';
  const normalized = query.trim().toLocaleLowerCase('pt-BR');
  const filtered = state.jobs.filter((job) => {
    const customer = getCustomer(state, job.customerId);
    const searchable = [customer?.name, job.referenceNumber, job.serviceType, job.description, job.title].join(' ').toLocaleLowerCase('pt-BR');
    return (!normalized || searchable.includes(normalized)) && (!status || job.currentStatus === status) && (!owner || job.designerId === owner);
  }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  return (
    <div className="page-stack">
      <header className="page-heading"><div><p className="eyebrow">Consulta rápida</p><h1>Trabalhos e artes</h1><p>Encontre a arte correta por cliente, referência ou serviço.</p></div><span className="results-count"><strong>{filtered.length}</strong> de {state.jobs.length} trabalhos</span></header>
      <section className="filter-panel" aria-label="Busca e filtros">
        <label className="search-field"><Search size={18} /><span className="sr-only">Buscar trabalhos</span><input value={query} onChange={(event) => update('q', event.target.value)} placeholder="Ex.: Mercado Horizonte ou ART-1048" /></label>
        <label className="select-field"><Filter size={17} /><span className="sr-only">Filtrar por responsável</span><select value={owner} onChange={(event) => update('owner', event.target.value)}><option value="">Todos os responsáveis</option>{state.users.map((user) => <option value={user.id} key={user.id}>{user.name}</option>)}</select></label>
        <div className="filter-chips" aria-label="Filtrar por status">{FILTERS.map((filter) => <button type="button" className={status === filter.value ? 'active' : ''} aria-pressed={status === filter.value} onClick={() => update('status', filter.value)} key={filter.value || 'all'}>{filter.label}</button>)}</div>
      </section>
      {filtered.length === 0 ? <EmptyState title="Nenhum trabalho encontrado" detail="Tente remover um filtro ou buscar outro cliente, serviço ou referência." /> : (
        <section className="jobs-list" aria-label="Lista de trabalhos">
          <div className="jobs-head"><span>Arte e cliente</span><span>Responsável</span><span>Situação</span><span>Versões</span><span>Atualização</span><span /></div>
          {filtered.map((job) => {
            const current = getCurrentVersion(job);
            const approved = getApprovedVersion(job);
            const customer = getCustomer(state, job.customerId);
            const user = getUser(state, job.designerId);
            return <Link className="job-row" to={`/artes/${job.id}`} key={job.id} aria-label={`Abrir ${job.referenceNumber}, ${customer?.name}`}>
              <div className="job-primary">{current ? <ArtworkPreview job={job} version={current} compact /> : <div className="preview-placeholder">Sem arte</div>}<div><span>{job.referenceNumber} • {job.serviceType}</span><strong>{customer?.name}</strong><small>{job.title}</small></div></div>
              <div className="job-owner"><Avatar user={user} /></div>
              <div><StatusBadge status={job.currentStatus} /><small className="mobile-meta">{JOB_STATUS[job.currentStatus].label}</small></div>
              <div className="version-pair"><span><small>ATUAL</small><strong>{current ? `V${current.versionNumber}` : '—'}</strong></span><span className={approved ? 'approved' : ''}><small>APROVADA</small><strong>{approved ? `V${approved.versionNumber}` : '—'}</strong></span></div>
              <div className="job-date"><strong>{relativeTime(job.updatedAt)}</strong><small>Prazo {formatDate(job.deadline)}</small></div>
              <ArrowRight className="row-arrow" size={18} />
            </Link>;
          })}
        </section>
      )}
    </div>
  );
}
