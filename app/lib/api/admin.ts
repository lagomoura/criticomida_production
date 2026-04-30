import { fetchApi } from './client';

export interface B2bMetricsResponse {
  reservations: {
    restaurants_with_url: number;
    clicks_total: number;
    clicks_last_7d: number;
    clicks_last_30d: number;
    top_clicked: Array<{ slug: string; name: string; clicks: number }>;
  };
  claims: {
    by_status: Record<string, number>;
    restaurants_total: number;
    restaurants_claimed: number;
    coverage_pct: number;
  };
  owner_engagement: {
    reviews_total: number;
    reviews_with_response: number;
    response_coverage_pct: number;
    official_photos_total: number;
    restaurants_with_photos: number;
  };
}

export async function getB2bMetrics(): Promise<B2bMetricsResponse> {
  return fetchApi<B2bMetricsResponse>('/api/admin/metrics/b2b');
}
