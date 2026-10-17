import {
  BadgeCheck,
  Bookmark,
  Heart,
  LifeBuoy,
  Search,
  Sparkles,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

import { routes } from '@/config/routes'

/**
 * Dashboard promotional content.
 *
 * Defined as data so the banners, statistics and shortcut tiles can be edited
 * (or later served by the API) without touching the components that render
 * them.
 */
export interface PromoBanner {
  id: string
  title: string
  description: string
  ctaLabel: string
  to: string
  icon: LucideIcon
  tone: 'brand' | 'rose'
}

export const promoBanners: PromoBanner[] = [
  {
    id: 'new-profiles',
    title: 'नवीन स्थळे उपलब्ध',
    description: 'या आठवड्यात नवीन प्रोफाइल जोडली गेली आहेत.',
    ctaLabel: 'पहा',
    to: routes.search,
    icon: Sparkles,
    tone: 'brand',
  },
  {
    id: 'verified',
    title: 'सत्यापित प्रोफाइल',
    description: 'सत्यापन पूर्ण करून विश्वास वाढवा.',
    ctaLabel: 'जाणून घ्या',
    to: routes.membership,
    icon: BadgeCheck,
    tone: 'rose',
  },
  {
    id: 'success-stories',
    title: 'यशस्वी जोड्या',
    description: 'आमच्या कुटुंबांनी सांगितलेले अनुभव वाचा.',
    ctaLabel: 'वाचा',
    to: routes.successStories,
    icon: Heart,
    tone: 'rose',
  },
  {
    id: 'support',
    title: 'मदत हवी आहे?',
    description: 'आमची टीम तुमच्या मदतीसाठी उपलब्ध आहे.',
    ctaLabel: 'संपर्क',
    to: routes.profile,
    icon: LifeBuoy,
    tone: 'brand',
  },
]

export interface HeroStat {
  value: string
  label: string
}

export const heroStats: HeroStat[] = [
  { value: '12+', label: 'वर्षांचा अनुभव' },
  { value: '8K+', label: 'समाधानी ग्राहक' },
  { value: '100%', label: 'सत्यापित स्थळे' },
]

export interface ShortcutTile {
  label: string
  to: string
  icon: LucideIcon
}

export const shortcutTiles: ShortcutTile[] = [
  { label: 'Search', to: routes.search, icon: Search },
  { label: 'Shortlist', to: routes.shortlist, icon: Bookmark },
  { label: 'Matches', to: routes.matches, icon: Heart },
  { label: 'My profile', to: routes.profile, icon: UserRound },
]
