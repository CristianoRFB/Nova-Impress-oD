import { JOB_STATUS } from '../domain/config';
import type { JobStatus } from '../domain/types';

export function StatusBadge({ status }: { status: JobStatus }) {
  const config = JOB_STATUS[status];
  return <span className={`status-badge status-${config.tone}`}>{config.label}</span>;
}
