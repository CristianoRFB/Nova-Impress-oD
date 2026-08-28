import { ArrowRight, Images, LayoutDashboard, Menu, RotateCcw, Search, X } from 'lucide-react';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDemo } from '../state/DemoContext';
import { Avatar } from './Avatar';
import { Dialog } from './Dialog';

export function AppShell({ children }: PropsWithChildren) {
  const { state, setCurrentUser, resetDemo, toast, dismissToast, storageNotice } = useDemo();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = state.users.find((user) => user.id === state.currentUserId);
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(dismissToast, 3800);
    return () => window.clearTimeout(timer);
  }, [toast, dismissToast]);
  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(`/artes?q=${encodeURIComponent(quickSearch.trim())}`);
  };
  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`} aria-label="Navegação principal">
        <div className="brand">
          <div className="brand-symbol" aria-hidden="true"><span>N</span></div>
          <div><strong>Nova Impressão</strong><span>Central de Artes</span></div>
          <button className="icon-button mobile-only" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><X size={20} /></button>
        </div>
        <nav>
          <NavLink to="/" end><LayoutDashboard size={19} /> Visão geral</NavLink>
          <NavLink to="/artes"><Images size={19} /> Trabalhos e artes</NavLink>
        </nav>
        <div className="sidebar-foot">
          <p className="eyebrow">Demonstração</p>
          <p>Dados inteiramente fictícios e salvos apenas neste navegador.</p>
          <button className="text-button" onClick={() => setResetOpen(true)}><RotateCcw size={16} /> Restaurar dados</button>
        </div>
      </aside>
      {mobileOpen && <button className="sidebar-scrim" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} />}
      <div className="app-main">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu size={21} /></button>
          <form className="top-search" role="search" onSubmit={submitSearch}>
            <Search size={18} aria-hidden="true" />
            <label className="sr-only" htmlFor="quick-search">Buscar cliente, referência ou serviço</label>
            <input id="quick-search" value={quickSearch} onChange={(event) => setQuickSearch(event.target.value)} placeholder="Buscar cliente, referência ou serviço…" />
            <button className="top-search-submit" type="submit" aria-label="Executar busca"><span>Enter</span><ArrowRight size={15} /></button>
          </form>
          <label className="user-switcher">
            <span className="sr-only">Usuário da demonstração</span>
            <Avatar user={currentUser} compact />
            <select value={state.currentUserId} onChange={(event) => setCurrentUser(event.target.value)} aria-label="Usuário da demonstração">
              {state.users.map((user) => <option key={user.id} value={user.id}>{user.name} — {user.role}</option>)}
            </select>
          </label>
        </header>
        {storageNotice && <div className="storage-notice" role="status">{storageNotice}</div>}
        <main id="conteudo" className="page-content">{children}</main>
      </div>
      {toast && <div className={`toast toast-${toast.tone}`} role="status" aria-live="polite">{toast.message}<button onClick={dismissToast} aria-label="Fechar aviso"><X size={16} /></button></div>}
      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} title="Restaurar demonstração?" description="Todas as alterações feitas neste navegador serão substituídas pelo cenário inicial.">
        <div className="dialog-actions"><button className="button secondary" onClick={() => setResetOpen(false)}>Cancelar</button><button className="button danger" onClick={() => { resetDemo(); setResetOpen(false); navigate('/artes/job-art-1048'); }}>Restaurar dados</button></div>
      </Dialog>
    </div>
  );
}
