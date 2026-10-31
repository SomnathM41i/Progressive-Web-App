import type { DashboardData } from '@/features/dashboard/types'
import { publicProfileService } from '@/features/profiles/services/public-profile.service'
import { PREVIEW_DASHBOARD } from '@/features/dashboard/dev/preview-dashboard'

export interface DashboardService {
  fetchDashboard: () => Promise<DashboardData>
}

const realDashboardService: DashboardService = {
  async fetchDashboard(): Promise<DashboardData> {
    const results = await Promise.allSettled([
      publicProfileService.list('unmarried', { gender: 'Female', limit: 12 }),
      publicProfileService.list('unmarried', { gender: 'Male', limit: 12 }),
      publicProfileService.list('remarriage', { gender: 'Female', limit: 12 }),
      publicProfileService.list('remarriage', { gender: 'Male', limit: 12 }),
      publicProfileService.list('nri', { gender: 'Female', limit: 12 }),
      publicProfileService.list('nri', { gender: 'Male', limit: 12 }),
    ])

    // One failed rail stays empty; all of them failing is an outage to report.
    const firstFailure = results.find((result) => result.status === 'rejected')
    if (firstFailure && results.every((result) => result.status === 'rejected')) {
      throw (firstFailure as PromiseRejectedResult).reason
    }

    const [unmarriedFemale, unmarriedMale, remarriageFemale, remarriageMale, nriFemale, nriMale] = results

    const uf = unmarriedFemale.status === 'fulfilled' ? unmarriedFemale.value.profiles : []
    const um = unmarriedMale.status === 'fulfilled' ? unmarriedMale.value.profiles : []
    const rf = remarriageFemale.status === 'fulfilled' ? remarriageFemale.value.profiles : []
    const rm = remarriageMale.status === 'fulfilled' ? remarriageMale.value.profiles : []
    const nf = nriFemale.status === 'fulfilled' ? nriFemale.value.profiles : []
    const nm = nriMale.status === 'fulfilled' ? nriMale.value.profiles : []

    const all = [...uf, ...um, ...rf, ...rm, ...nf, ...nm]

    return {
      summary: PREVIEW_DASHBOARD.summary,
      recommended: all,
      recentlyAdded: [],
      successStories: [],
      // No announcements endpoint exists, and placeholder news must not reach members.
      announcements: [],
      todayMatches: all.length,
      sections: {
        unmarriedBride: uf,
        unmarriedGroom: um,
        remarriageBride: rf,
        remarriageGroom: rm,
        nriBride: nf,
        nriGroom: nm,
      },
    } as DashboardData & { sections: any }
  },
}

export const dashboardService: DashboardService = realDashboardService
