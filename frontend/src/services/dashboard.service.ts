import { apiClient } from '@/lib/api-client';

import type { DashboardSummary } from '@/types';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return data;
  },
};
