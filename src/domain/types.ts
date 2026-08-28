export type JobStatus =
  | 'AWAITING_ART'
  | 'CREATING'
  | 'ART_READY'
  | 'AWAITING_APPROVAL'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'RELEASED'
  | 'FINISHED';

export type VersionStatus = 'DRAFT' | 'SENT' | 'AWAITING_APPROVAL' | 'APPROVED' | 'SUPERSEDED';
export type ChangeSource = 'WhatsApp' | 'Telefone' | 'Presencial' | 'Outro';
export type ChangeStatus = 'PENDENTE' | 'REALIZADA';
export type EventType =
  | 'JOB_CREATED'
  | 'VERSION_CREATED'
  | 'VERSION_SENT'
  | 'CHANGE_REQUESTED'
  | 'CHANGE_COMPLETED'
  | 'APPROVAL_REGISTERED'
  | 'STATUS_CHANGED'
  | 'NOTE_ADDED'
  | 'RELEASED';

export interface DemoUser {
  id: string;
  name: string;
  role: 'Designer' | 'Atendimento' | 'Produção' | 'Administrador';
  initials: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName?: string;
  city?: string;
}

export interface ArtworkVersion {
  id: string;
  jobId: string;
  versionNumber: number;
  fileName: string;
  previewKey: string;
  previewVariant: number;
  createdAt: string;
  createdByUserId: string;
  note?: string;
  status: VersionStatus;
}

export interface Approval {
  id: string;
  jobId: string;
  versionId: string;
  registeredAt: string;
  registeredByUserId: string;
  approvedByName?: string;
  note?: string;
}

export interface ChangeRequest {
  id: string;
  jobId: string;
  linkedVersionId: string;
  text: string;
  source: ChangeSource;
  status: ChangeStatus;
  createdAt: string;
  createdByUserId: string;
  completedAt?: string;
  completedByUserId?: string;
  resolvedByVersionId?: string;
}

export interface ActivityEvent {
  id: string;
  jobId: string;
  timestamp: string;
  userId: string;
  type: EventType;
  label: string;
  detail?: string;
  versionId?: string;
}

export interface ArtworkJob {
  id: string;
  referenceNumber: string;
  customerId: string;
  title: string;
  serviceType: string;
  description: string;
  designerId: string;
  currentStatus: JobStatus;
  currentVersionId: string | null;
  approvedVersionId: string | null;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  versions: ArtworkVersion[];
  changeRequests: ChangeRequest[];
  approvals: Approval[];
  activityEvents: ActivityEvent[];
  notes: string[];
}

export interface DemoState {
  schemaVersion: 1;
  createdAt: string;
  currentUserId: string;
  users: DemoUser[];
  customers: Customer[];
  jobs: ArtworkJob[];
}

export interface StorageLoadResult {
  state: DemoState;
  recovered: boolean;
  persistenceAvailable: boolean;
}

export interface AttentionItem {
  jobId: string;
  title: string;
  detail: string;
  tone: 'warning' | 'info' | 'success';
  timestamp: string;
}
