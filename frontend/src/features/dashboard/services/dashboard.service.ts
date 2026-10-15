import { env } from '@/config/env'
import { PREVIEW_DASHBOARD } from '@/features/dashboard/dev/preview-dashboard'
import type { DashboardData } from '@/features/dashboard/types'
import { ApiNotIntegratedError } from '@/services/api-error'

/**
 * Boundary between the dashboard UI and its data source.
 *
 * The dashboard components never call the API directly; they consume this
 * interface. Swapping the implementation is the only change needed once the
 * collection is available.
 */
export interface DashboardService {
  fetchDashboard: () => Promise<DashboardData>
}

/**
 * Real implementation — pending the API collection.
 *
 * It fails with a descriptive error instead of returning invented content, so
 * an unconfigured build can never look like a working one.
 */
const unconfiguredDashboardService: DashboardService = {
  async fetchDashboard(): Promise<DashboardData> {
    // TODO(api): GET the dashboard endpoint and map the response to DashboardData.
    throw new ApiNotIntegratedError('Dashboard data')
  },
}

const previewDashboardService: DashboardService = {
  async fetchDashboard(): Promise<DashboardData> {
    // A small delay keeps loading states visible while reviewing the UI.
    await new Promise((resolve) => setTimeout(resolve, 450))
    return PREVIEW_DASHBOARD
  },
}

export const dashboardService: DashboardService = env.devPreview
  ? previewDashboardService
  : unconfiguredDashboardService
