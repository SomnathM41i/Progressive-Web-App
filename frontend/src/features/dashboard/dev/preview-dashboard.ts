import type { DashboardData } from '@/features/dashboard/types'

const portraits = {
  man: 'https://images.unsplash.com/photo-1500649767791-00dcc994a43e?auto=format&fit=crop&w=640&h=760&q=85',
  woman:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=640&h=760&q=85',
  womanTwo:
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=640&h=760&q=85',
}

/** Preview-only sample data; member records are loaded from the API in production. */
export const PREVIEW_DASHBOARD: DashboardData = {
  summary: {
    name: 'सोमनाथ माळी',
    profileId: 'SM008656',
    completion: 68,
    photoUrl: portraits.man,
    isVerified: true,
    missingFields: ['Education details', 'Family details', 'Photo'],
  },
  recommended: [
    {
      id: 'p-1001',
      name: 'स्नेहा पाटील',
      age: 27,
      location: 'सातारा',
      occupation: 'Teacher',
      gender: 'Bride',
      photoUrl: portraits.woman,
      isVerified: true,
    },
    {
      id: 'p-1002',
      name: 'प्रिया जाधव',
      age: 25,
      location: 'पुणे',
      occupation: 'Software engineer',
      gender: 'Bride',
      photoUrl: portraits.womanTwo,
      isVerified: false,
    },
    {
      id: 'p-1003',
      name: 'अनिता देशमुख',
      age: 29,
      location: 'कोल्हापूर',
      occupation: 'Nurse',
      gender: 'Bride',
      photoUrl:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=640&h=760&q=85',
      isVerified: true,
    },
  ],
  recentlyAdded: [
    {
      id: 'p-2001',
      name: 'राहुल शिंदे',
      age: 31,
      location: 'मुंबई',
      occupation: 'Business',
      gender: 'Groom',
      photoUrl: portraits.man,
      isVerified: true,
      isNew: true,
    },
    {
      id: 'p-2002',
      name: 'अमोल कुलकर्णी',
      age: 28,
      location: 'नाशिक',
      occupation: 'Engineer',
      gender: 'Groom',
      photoUrl:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=640&h=760&q=85',
      isNew: true,
    },
  ],
  successStories: [
    {
      id: 's-1',
      couple: 'स्नेहा आणि राहुल',
      place: 'सातारा',
      year: 2024,
      quote: 'विश्वासार्ह माहिती आणि चांगल्या स्थळांमुळे योग्य जोडी लवकर भेटली.',
    },
    {
      id: 's-2',
      couple: 'प्रिया आणि अमोल',
      place: 'कोल्हापूर',
      year: 2023,
      quote: 'कुटुंबासोबत चर्चा करून निर्णय घेणे सोपे झाले.',
    },
  ],
  announcements: [
    {
      id: 'a-1',
      title: 'Complete your profile',
      body: 'Complete profiles receive more responses. Add your education and family details.',
      createdAt: '2026-10-12T09:00:00.000Z',
      tone: 'warning',
    },
    {
      id: 'a-2',
      title: 'New matches available',
      body: '24 new profiles were added this week.',
      createdAt: '2026-10-10T09:00:00.000Z',
      tone: 'info',
    },
  ],
  todayMatches: 12,
}
