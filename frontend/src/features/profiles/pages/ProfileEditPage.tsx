import {
  Briefcase,
  ChevronRight,
  Contact,
  Heart,
  Moon,
  UserRound,
  Users,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { AppScreen } from '@/components/ui/AppScreen'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { RegistrationProvider } from '@/features/registration/context/RegistrationProvider'
import { BasicStepPage } from '@/features/registration/pages/BasicStepPage'
import { SectionStepPage } from '@/features/registration/pages/SectionStepPage'

type EditableSection =
  | 'basic'
  | 'contact'
  | 'education'
  | 'family'
  | 'horoscope'
  | 'partner'

const editableSections: Array<{
  id: EditableSection
  title: string
  description: string
  icon: typeof UserRound
}> = [
  {
    id: 'basic',
    title: 'Basic details',
    description: 'Personal details, community, contact and physical details.',
    icon: UserRound,
  },
  {
    id: 'contact',
    title: 'Contact details',
    description: 'Home and work address, phone numbers and calling time.',
    icon: Contact,
  },
  {
    id: 'education',
    title: 'Education & career',
    description: 'Education, occupation, work location and income details.',
    icon: Briefcase,
  },
  {
    id: 'family',
    title: 'Family details',
    description: 'Family background, relatives, property and investments.',
    icon: Users,
  },
  {
    id: 'horoscope',
    title: 'Horoscope',
    description: 'Birth details, matching preferences and horoscope document.',
    icon: Moon,
  },
  {
    id: 'partner',
    title: 'Partner preference',
    description: 'Age, community, location, education and lifestyle preferences.',
    icon: Heart,
  },
]

const editorTitles: Record<EditableSection, string> = {
  basic: 'Edit basic details',
  contact: 'Edit contact details',
  education: 'Edit education & career',
  family: 'Edit family details',
  horoscope: 'Edit horoscope',
  partner: 'Edit partner preference',
}

export function ProfileEditPage() {
  return (
    <RegistrationProvider persist={false}>
      <ProfileEditContent />
    </RegistrationProvider>
  )
}

function ProfileEditContent() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedSection = searchParams.get('section')
  const activeSection = editableSections.some((item) => item.id === requestedSection)
    ? (requestedSection as EditableSection)
    : null
  const mainRef = useRef<HTMLElement | null>(null)

  function closeEditor() {
    setSearchParams({}, { replace: true })
  }

  useEffect(() => {
    if (activeSection) {
      mainRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [activeSection])

  return (
    <AppScreen>
      <ScreenHeader
        title={activeSection ? editorTitles[activeSection] : 'Edit profile'}
        onBack={activeSection ? closeEditor : undefined}
      />

      <main
        ref={mainRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4"
      >
        {activeSection === 'basic' ? (
          <BasicStepPage key="basic" profileEdit onSaved={closeEditor} />
        ) : activeSection ? (
          <SectionStepPage
            key={activeSection}
            section={activeSection}
            profileEdit
            onSaved={closeEditor}
          />
        ) : (
          <div className="space-y-4 pb-6">
            <Card className="registration-section-card space-y-2">
              <Badge tone="brand">Profile editor</Badge>
              <h2 className="text-lg text-maroon">Keep your profile current</h2>
              <p className="text-sm leading-relaxed text-muted">
                Choose a section to update. Your current details load first, and
                only supported profile fields are saved.
              </p>
            </Card>

            <div className="space-y-3">
              {editableSections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setSearchParams({ section: section.id })}
                    className="group flex w-full items-center gap-3 rounded-card border border-line-strong bg-surface p-4 text-left shadow-soft transition hover:border-maroon/30 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/20"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-rose text-maroon">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">
                        {section.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                        {section.description}
                      </span>
                    </span>
                    <ChevronRight
                      className="size-5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-maroon"
                      aria-hidden="true"
                    />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </AppScreen>
  )
}
