import type { DashboardData } from '@/features/dashboard/types'

/**
 * DEVELOPMENT ONLY.
 *
 * Placeholder dashboard content used when `VITE_ENABLE_DEV_PREVIEW` is on. It
 * exists purely so the layout can be reviewed before the API collection is
 * integrated, and it is never reachable from a production build.
 *
 * Photos are intentionally omitted: the monogram avatar is a real, designed
 * state, whereas stock portraits would look like genuine member data.
 */
export const PREVIEW_DASHBOARD: DashboardData = {
  summary: {
    name: 'सोमनाथ माळी',
    profileId: 'SM008656',
    completion: 68,
    photoUrl: null,
    isVerified: true,
    missingFields: ['Education details', 'Family details', 'Photo'],
  },
  recommended: [
    {
      id: 'p-1001',
      name: 'स्नेहा पाटील',
      age: 27,
      location: 'सातारा',
      occupation: 'शिक्षिका',
      photoUrl: null,
      isVerified: true,
    },
    {
      id: 'p-1002',
      name: 'प्रिया जाधव',
      age: 25,
      location: 'पुणे',
      occupation: 'सॉफ्टवेअर इंजिनिअर',
      photoUrl: null,
      isVerified: false,
    },
    {
      id: 'p-1003',
      name: 'अनिता देशमुख',
      age: 29,
      location: 'कोल्हापूर',
      occupation: 'नर्स',
      photoUrl: null,
      isVerified: true,
    },
  ],
  recentlyAdded: [
    {
      id: 'p-2001',
      name: 'राहुल शिंदे',
      age: 31,
      location: 'मुंबई',
      occupation: 'व्यापार',
      photoUrl: null,
      isVerified: true,
      isNew: true,
    },
    {
      id: 'p-2002',
      name: 'अमोल कुलकर्णी',
      age: 28,
      location: 'नाशिक',
      occupation: 'अभियंता',
      photoUrl: null,
      isNew: true,
    },
  ],
  successStories: [
    {
      id: 's-1',
      couple: 'स्नेहा आणि राहुल',
      place: 'सातारा',
      year: 2024,
      quote: 'विश्वासार्ह माहिती आणि चांगले स्थळ यामुळे योग्य जोडी लवकर भेटली.',
    },
    {
      id: 's-2',
      couple: 'प्रिया आणि अमोल',
      place: 'कोल्हापूर',
      year: 2023,
      quote: 'कुटुंबासोबत चर्चा करून निर्णय घेणं सोपं झालं.',
    },
  ],
  announcements: [
    {
      id: 'a-1',
      title: 'प्रोफाइल अपूर्ण आहे',
      body: 'पूर्ण प्रोफाइलला जास्त प्रतिसाद मिळतो. उर्वरित तपशील भरा.',
      createdAt: '2026-10-12T09:00:00.000Z',
      tone: 'warning',
    },
    {
      id: 'a-2',
      title: 'नवीन स्थळे उपलब्ध',
      body: 'या आठवड्यात 24 नवीन प्रोफाइल जोडली गेली आहेत.',
      createdAt: '2026-10-10T09:00:00.000Z',
      tone: 'info',
    },
  ],
  todayMatches: 12,
}
