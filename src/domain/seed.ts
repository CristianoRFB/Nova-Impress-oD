import type {
  ActivityEvent,
  ArtworkJob,
  ArtworkVersion,
  ChangeRequest,
  Customer,
  DemoState,
  DemoUser,
  JobStatus,
} from './types';

const users: DemoUser[] = [
  { id: 'user-camila', name: 'Camila', role: 'Designer', initials: 'CA' },
  { id: 'user-rafael', name: 'Rafael', role: 'Atendimento', initials: 'RA' },
  { id: 'user-bruno', name: 'Bruno', role: 'Produção', initials: 'BR' },
  { id: 'user-marina', name: 'Marina', role: 'Administrador', initials: 'MA' },
];

const customers: Customer[] = [
  { id: 'customer-horizonte', name: 'Mercado Horizonte', city: 'Cidade demonstrativa' },
  { id: 'customer-prisma', name: 'Clínica Prisma', city: 'Cidade demonstrativa' },
  { id: 'customer-studio', name: 'Studio Norte', city: 'Cidade demonstrativa' },
  { id: 'customer-aurora', name: 'Café Aurora', city: 'Cidade demonstrativa' },
  { id: 'customer-ipê', name: 'Escola Ipê', city: 'Cidade demonstrativa' },
  { id: 'customer-vento', name: 'Vento Sul Bikes', city: 'Cidade demonstrativa' },
  { id: 'customer-ponto', name: 'Ponto & Linha', city: 'Cidade demonstrativa' },
  { id: 'customer-sereno', name: 'Residencial Sereno', city: 'Cidade demonstrativa' },
  { id: 'customer-estacao', name: 'Estação Pet', city: 'Cidade demonstrativa' },
  { id: 'customer-vereda', name: 'Vereda Natural', city: 'Cidade demonstrativa' },
];

const isoAgo = (now: Date, amount: number, unit: 'hours' | 'days') => {
  const ms = unit === 'hours' ? amount * 3_600_000 : amount * 86_400_000;
  return new Date(now.getTime() - ms).toISOString();
};

const isoAhead = (now: Date, days: number) => new Date(now.getTime() + days * 86_400_000).toISOString();

function version(
  jobId: string,
  number: number,
  createdAt: string,
  previewKey: string,
  note: string,
  status: ArtworkVersion['status'],
  creator = 'user-camila',
): ArtworkVersion {
  return {
    id: `${jobId}-v${number}`,
    jobId,
    versionNumber: number,
    fileName: `${jobId.toUpperCase()}_V${number}.pdf`,
    previewKey,
    previewVariant: number,
    createdAt,
    createdByUserId: creator,
    note,
    status,
  };
}

function event(
  jobId: string,
  order: number,
  timestamp: string,
  userId: string,
  type: ActivityEvent['type'],
  label: string,
  detail?: string,
  versionId?: string,
): ActivityEvent {
  return { id: `${jobId}-event-${order}`, jobId, timestamp, userId, type, label, detail, versionId };
}

interface SimpleJobInput {
  id: string;
  ref: string;
  customerId: string;
  title: string;
  service: string;
  description: string;
  status: JobStatus;
  updatedHours: number;
  deadlineDays?: number;
  versionCount?: number;
  approved?: boolean;
  pendingChange?: string;
  previewKey: string;
  designerId?: string;
}

function simpleJob(now: Date, input: SimpleJobInput): ArtworkJob {
  const createdAt = isoAgo(now, Math.max(4, input.updatedHours + 72), 'hours');
  const updatedAt = isoAgo(now, input.updatedHours, 'hours');
  const count = input.versionCount ?? 1;
  const versions = Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const isCurrent = number === count;
    const status: ArtworkVersion['status'] = input.approved && isCurrent
      ? 'APPROVED'
      : isCurrent && input.status === 'AWAITING_APPROVAL'
        ? 'AWAITING_APPROVAL'
        : isCurrent
          ? 'DRAFT'
          : 'SUPERSEDED';
    return version(
      input.id,
      number,
      isoAgo(now, input.updatedHours + (count - number) * 24, 'hours'),
      input.previewKey,
      number === 1 ? 'Primeira proposta.' : `Revisão ${number} com ajustes solicitados.`,
      status,
    );
  });
  const current = versions.at(-1) ?? null;
  const events: ActivityEvent[] = [
    event(input.id, 1, createdAt, 'user-rafael', 'JOB_CREATED', 'Trabalho cadastrado', input.description),
  ];
  if (current) {
    events.push(event(input.id, 2, current.createdAt, 'user-camila', 'VERSION_CREATED', `V${current.versionNumber} criada`, current.note, current.id));
  }
  const changes: ChangeRequest[] = [];
  if (input.pendingChange && current) {
    changes.push({
      id: `${input.id}-change-1`,
      jobId: input.id,
      linkedVersionId: current.id,
      text: input.pendingChange,
      source: 'WhatsApp',
      status: 'PENDENTE',
      createdAt: updatedAt,
      createdByUserId: 'user-rafael',
    });
    events.push(event(input.id, 3, updatedAt, 'user-rafael', 'CHANGE_REQUESTED', 'Alteração solicitada', input.pendingChange, current.id));
  } else if (input.approved && current) {
    events.push(event(input.id, 3, updatedAt, 'user-rafael', 'APPROVAL_REGISTERED', `V${current.versionNumber} aprovada`, 'Aprovação registrada pelo atendimento.', current.id));
  } else if (input.status === 'AWAITING_APPROVAL' && current) {
    events.push(event(input.id, 3, updatedAt, 'user-rafael', 'VERSION_SENT', `V${current.versionNumber} enviada para aprovação`, undefined, current.id));
  }
  return {
    id: input.id,
    referenceNumber: input.ref,
    customerId: input.customerId,
    title: input.title,
    serviceType: input.service,
    description: input.description,
    designerId: input.designerId ?? 'user-camila',
    currentStatus: input.status,
    currentVersionId: current?.id ?? null,
    approvedVersionId: input.approved ? current?.id ?? null : null,
    deadline: input.deadlineDays === undefined ? undefined : isoAhead(now, input.deadlineDays),
    createdAt,
    updatedAt,
    versions,
    changeRequests: changes,
    approvals: input.approved && current ? [{
      id: `${input.id}-approval-1`,
      jobId: input.id,
      versionId: current.id,
      registeredAt: updatedAt,
      registeredByUserId: 'user-rafael',
      approvedByName: 'Cliente demonstrativo',
    }] : [],
    activityEvents: events,
    notes: [],
  };
}

function starJob(now: Date): ArtworkJob {
  const id = 'job-art-1048';
  const v1 = version(id, 1, isoAgo(now, 8, 'days'), 'emerald', 'Primeira proposta da fachada.', 'SUPERSEDED');
  const v2 = version(id, 2, isoAgo(now, 6, 'days'), 'navy', 'WhatsApp atualizado e logotipo ampliado.', 'SUPERSEDED');
  const v3 = version(id, 3, isoAgo(now, 2, 'days'), 'emerald', 'Paleta escurecida e endereço antigo removido.', 'APPROVED');
  const change1: ChangeRequest = {
    id: `${id}-change-1`, jobId: id, linkedVersionId: v1.id,
    text: 'Trocar o número do WhatsApp e aumentar o logotipo.', source: 'WhatsApp', status: 'REALIZADA',
    createdAt: isoAgo(now, 7, 'days'), createdByUserId: 'user-rafael', completedAt: isoAgo(now, 6, 'days'),
    completedByUserId: 'user-camila', resolvedByVersionId: v2.id,
  };
  const change2: ChangeRequest = {
    id: `${id}-change-2`, jobId: id, linkedVersionId: v2.id,
    text: 'Usar azul mais escuro e retirar endereço antigo.', source: 'WhatsApp', status: 'REALIZADA',
    createdAt: isoAgo(now, 5, 'days'), createdByUserId: 'user-rafael', completedAt: isoAgo(now, 2, 'days'),
    completedByUserId: 'user-camila', resolvedByVersionId: v3.id,
  };
  return {
    id,
    referenceNumber: 'ART-1048',
    customerId: 'customer-horizonte',
    title: 'Fachada principal',
    serviceType: 'Fachada',
    description: 'Atualização da comunicação visual da entrada principal.',
    designerId: 'user-camila',
    currentStatus: 'APPROVED',
    currentVersionId: v3.id,
    approvedVersionId: v3.id,
    deadline: isoAhead(now, 4),
    createdAt: isoAgo(now, 9, 'days'),
    updatedAt: isoAgo(now, 4, 'hours'),
    versions: [v1, v2, v3],
    changeRequests: [change1, change2],
    approvals: [{
      id: `${id}-approval-1`, jobId: id, versionId: v3.id, registeredAt: isoAgo(now, 4, 'hours'),
      registeredByUserId: 'user-rafael', approvedByName: 'Alex, responsável pelo cliente', note: 'Aprovada para produção.',
    }],
    activityEvents: [
      event(id, 1, isoAgo(now, 9, 'days'), 'user-rafael', 'JOB_CREATED', 'Trabalho cadastrado', 'Fachada principal do Mercado Horizonte.'),
      event(id, 2, v1.createdAt, 'user-camila', 'VERSION_CREATED', 'V1 criada', v1.note, v1.id),
      event(id, 3, isoAgo(now, 7.5, 'days'), 'user-rafael', 'VERSION_SENT', 'V1 enviada para aprovação', undefined, v1.id),
      event(id, 4, change1.createdAt, 'user-rafael', 'CHANGE_REQUESTED', 'Alteração recebida via WhatsApp', change1.text, v1.id),
      event(id, 5, change1.completedAt!, 'user-camila', 'CHANGE_COMPLETED', 'Primeira alteração realizada', change1.text, v2.id),
      event(id, 6, v2.createdAt, 'user-camila', 'VERSION_CREATED', 'V2 criada', v2.note, v2.id),
      event(id, 7, change2.createdAt, 'user-rafael', 'CHANGE_REQUESTED', 'Nova alteração recebida via WhatsApp', change2.text, v2.id),
      event(id, 8, change2.completedAt!, 'user-camila', 'CHANGE_COMPLETED', 'Segunda alteração realizada', change2.text, v3.id),
      event(id, 9, v3.createdAt, 'user-camila', 'VERSION_CREATED', 'V3 criada', v3.note, v3.id),
      event(id, 10, isoAgo(now, 1, 'days'), 'user-rafael', 'VERSION_SENT', 'V3 enviada para aprovação', undefined, v3.id),
      event(id, 11, isoAgo(now, 4, 'hours'), 'user-rafael', 'APPROVAL_REGISTERED', 'V3 aprovada pelo cliente', 'Aprovação registrada por Rafael.', v3.id),
    ],
    notes: ['Caso principal da demonstração: histórico completo e aprovação inequívoca.'],
  };
}

export function createSeed(now = new Date()): DemoState {
  const jobs: ArtworkJob[] = [
    starJob(now),
    simpleJob(now, { id: 'job-art-1051', ref: 'ART-1051', customerId: 'customer-prisma', title: 'Banner de recepção', service: 'Banner', description: 'Banner vertical para recepção.', status: 'AWAITING_APPROVAL', updatedHours: 27, deadlineDays: 2, versionCount: 2, previewKey: 'navy' }),
    simpleJob(now, { id: 'job-art-1053', ref: 'ART-1053', customerId: 'customer-studio', title: 'Cartão de visita', service: 'Cartão de visita', description: 'Novo cartão para equipe comercial.', status: 'APPROVED', updatedHours: 2, deadlineDays: 5, versionCount: 3, approved: true, previewKey: 'plum' }),
    simpleJob(now, { id: 'job-art-1056', ref: 'ART-1056', customerId: 'customer-aurora', title: 'Adesivo de vitrine', service: 'Adesivo', description: 'Campanha sazonal para vitrine.', status: 'CHANGES_REQUESTED', updatedHours: 2, deadlineDays: 1, versionCount: 1, pendingChange: 'Aumentar o horário de atendimento e reduzir o selo promocional.', previewKey: 'terracotta' }),
    simpleJob(now, { id: 'job-art-1058', ref: 'ART-1058', customerId: 'customer-ipê', title: 'Panfleto de matrículas', service: 'Panfleto', description: 'Material frente e verso para campanha de matrículas.', status: 'CREATING', updatedHours: 8, deadlineDays: 3, versionCount: 1, previewKey: 'emerald' }),
    simpleJob(now, { id: 'job-art-1060', ref: 'ART-1060', customerId: 'customer-vento', title: 'Placa externa', service: 'Placa', description: 'Placa de identificação da oficina.', status: 'ART_READY', updatedHours: 5, deadlineDays: 6, versionCount: 2, previewKey: 'navy' }),
    simpleJob(now, { id: 'job-art-1062', ref: 'ART-1062', customerId: 'customer-ponto', title: 'Camisetas da equipe', service: 'Camiseta personalizada', description: 'Estampa frontal e costas para equipe.', status: 'AWAITING_ART', updatedHours: 11, deadlineDays: 8, versionCount: 0, previewKey: 'plum' }),
    simpleJob(now, { id: 'job-art-1041', ref: 'ART-1041', customerId: 'customer-sereno', title: 'Sinalização interna', service: 'Comunicação visual', description: 'Conjunto de placas para áreas comuns.', status: 'FINISHED', updatedHours: 72, versionCount: 2, approved: true, previewKey: 'emerald' }),
    simpleJob(now, { id: 'job-art-1064', ref: 'ART-1064', customerId: 'customer-estacao', title: 'Faixa promocional', service: 'Banner', description: 'Faixa para campanha de inauguração.', status: 'AWAITING_APPROVAL', updatedHours: 7, deadlineDays: 2, versionCount: 1, previewKey: 'terracotta' }),
    simpleJob(now, { id: 'job-art-1066', ref: 'ART-1066', customerId: 'customer-vereda', title: 'Rótulo de embalagem', service: 'Impressão personalizada', description: 'Rótulo para nova linha artesanal.', status: 'RELEASED', updatedHours: 18, deadlineDays: 3, versionCount: 2, approved: true, previewKey: 'emerald' }),
  ];
  return { schemaVersion: 1, createdAt: now.toISOString(), currentUserId: 'user-rafael', users, customers, jobs };
}
