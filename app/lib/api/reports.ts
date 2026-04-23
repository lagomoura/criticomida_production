import { fetchApi } from './client';
import { isSocialMockEnabled, mockDelay } from './_mocks';

export type ReportEntityType = 'review' | 'comment' | 'user';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface CreateReportInput {
  entityType: ReportEntityType;
  entityId: string;
  reason: string;
}

export async function createReport(input: CreateReportInput): Promise<void> {
  if (isSocialMockEnabled()) {
    await mockDelay(300);
    return;
  }
  await fetchApi('/api/reports', {
    method: 'POST',
    body: JSON.stringify({
      entity_type: input.entityType,
      entity_id: input.entityId,
      reason: input.reason,
    }),
  });
}

// ── Admin API ───────────────────────────────────────────────────────────────

export interface AdminReportItem {
  id: string;
  entityType: ReportEntityType;
  entityId: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  reporter: {
    id: string | null;
    displayName: string | null;
    handle: string | null;
  };
  target: {
    kind: ReportEntityType;
    id: string;
    preview: string | null;
    deleted: boolean;
    parentId: string | null;
  };
}

export interface AdminReportsPage {
  items: AdminReportItem[];
  nextCursor: string | null;
}

interface AdminReportDTO {
  id: string;
  entity_type: ReportEntityType;
  entity_id: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
  reporter: {
    id: string | null;
    display_name: string | null;
    handle: string | null;
  };
  target: {
    kind: ReportEntityType;
    id: string;
    preview: string | null;
    deleted: boolean;
    parent_id: string | null;
  };
}

interface AdminReportsPageDTO {
  items: AdminReportDTO[];
  next_cursor: string | null;
}

function toAdminReport(dto: AdminReportDTO): AdminReportItem {
  return {
    id: dto.id,
    entityType: dto.entity_type,
    entityId: dto.entity_id,
    reason: dto.reason,
    status: dto.status,
    createdAt: dto.created_at,
    reporter: {
      id: dto.reporter.id,
      displayName: dto.reporter.display_name,
      handle: dto.reporter.handle,
    },
    target: {
      kind: dto.target.kind,
      id: dto.target.id,
      preview: dto.target.preview,
      deleted: dto.target.deleted,
      parentId: dto.target.parent_id,
    },
  };
}

export async function listReports(
  status: ReportStatus = 'pending',
  cursor?: string | null,
  limit = 30,
): Promise<AdminReportsPage> {
  const params = new URLSearchParams({ status, limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  const raw = await fetchApi<AdminReportsPageDTO>(`/api/reports?${params.toString()}`);
  return {
    items: raw.items.map(toAdminReport),
    nextCursor: raw.next_cursor,
  };
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
): Promise<void> {
  await fetchApi(`/api/reports/${encodeURIComponent(reportId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
