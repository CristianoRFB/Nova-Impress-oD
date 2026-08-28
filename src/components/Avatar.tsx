import type { DemoUser } from '../domain/types';

export function Avatar({ user, compact = false }: { user?: DemoUser; compact?: boolean }) {
  if (!user) return <span className="muted">Não definido</span>;
  return (
    <span className="avatar-label" title={`${user.name} — ${user.role}`}>
      <span className="avatar" aria-hidden="true">{user.initials}</span>
      {!compact && <span><strong>{user.name}</strong><small>{user.role}</small></span>}
    </span>
  );
}
