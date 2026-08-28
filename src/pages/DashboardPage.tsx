import { ArrowRight, CheckCircle2, Clock3, FileClock, MessageSquareWarning, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArtworkPreview } from '../components/ArtworkPreview';
import { StatusBadge } from '../components/StatusBadge';
import { relativeTime } from '../domain/format';
import { getAttentionItems, getCurrentVersion, getCustomer, getDashboardMetrics, getNextAction, getUser } from '../domain/selectors';
import { useDemo } from '../state/DemoContext';

export function DashboardPage() {
  const { state } = useDemo();
  const metrics = getDashboardMetrics(state);
  const attention = getAttentionItems(state);
  const recent = [...state.jobs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const cards = [
    { label: 'Aguardando aprovação', value: metrics.waitingApprovalCount, icon: Clock3, tone: 'amber' },
    { label: 'Alterações solicitadas', value: metrics.pendingChangeCount, icon: MessageSquareWarning, tone: 'red' },
    { label: 'Aprovadas hoje', value: metrics.approvedTodayCount, icon: CheckCircle2, tone: 'green' },
    { label: 'Revisões sem aprovação', value: metrics.revisionPendingCount, icon: FileClock, tone: 'blue' },
  ];
  return (
    <div className="page-stack">
      <header className="page-heading">
        <div><p className="eyebrow">Operação em andamento</p><h1>Visão geral</h1><p>O que precisa de atenção e qual é a próxima ação.</p></div>
        <Link className="button primary" to="/artes"><Sparkles size={17} /> Consultar uma arte</Link>
      </header>
      <section className="metric-grid" aria-label="Indicadores operacionais">
        {cards.map(({ label, value, icon: Icon, tone }) => <article className="metric-card" key={label}><span className={`metric-icon metric-${tone}`}><Icon size={20} /></span><div><strong>{value}</strong><span>{label}</span></div></article>)}
      </section>
      <div className="dashboard-grid">
        <section className="panel attention-panel">
          <header className="panel-header"><div><p className="eyebrow">Prioridade</p><h2>Atenção agora</h2></div><span className="count-pill">{attention.length} itens</span></header>
          <div className="attention-list">
            {attention.map((item) => {
              const job = state.jobs.find((entry) => entry.id === item.jobId)!;
              const customer = getCustomer(state, job.customerId);
              return <Link className="attention-item" to={`/artes/${job.id}`} key={job.id}><span className={`attention-dot attention-${item.tone}`} /><div><strong>{customer?.name}</strong><span>{item.title}</span><small>{item.detail} • {relativeTime(item.timestamp)}</small></div><ArrowRight size={18} /></Link>;
            })}
          </div>
        </section>
        <aside className="panel confidence-card">
          <p className="eyebrow">Consulta em segundos</p>
          <h2>A informação não para com a designer.</h2>
          <p>Versão atual, aprovação, mudanças e próxima ação ficam reunidas em cada trabalho.</p>
          <ol><li><span>1</span>Busque cliente ou referência</li><li><span>2</span>Veja atual x aprovada</li><li><span>3</span>Siga a próxima ação</li></ol>
          <Link to="/artes/job-art-1048">Abrir caso demonstrativo <ArrowRight size={17} /></Link>
        </aside>
      </div>
      <section className="panel">
        <header className="panel-header"><div><p className="eyebrow">Movimentação</p><h2>Atualizados recentemente</h2></div><Link className="inline-link" to="/artes">Ver todos <ArrowRight size={16} /></Link></header>
        <div className="recent-grid">
          {recent.map((job) => {
            const version = getCurrentVersion(job);
            const customer = getCustomer(state, job.customerId);
            return <Link className="recent-card" to={`/artes/${job.id}`} key={job.id}>{version && <ArtworkPreview job={job} version={version} compact />}<div className="recent-body"><div><span>{job.referenceNumber}</span><StatusBadge status={job.currentStatus} /></div><strong>{customer?.name}</strong><p>{job.title}</p><small>{getUser(state, job.designerId)?.name} • {getNextAction(job)}</small></div></Link>;
          })}
        </div>
      </section>
    </div>
  );
}
