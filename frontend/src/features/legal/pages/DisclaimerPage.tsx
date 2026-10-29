import { ScreenHeader } from '@/components/navigation/ScreenHeader'

export function DisclaimerPage() {
  return (
    <div className="flex h-dvh flex-col bg-cream">
      <ScreenHeader title="Disclaimer" />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-safe">
        <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-line bg-white p-4 text-sm leading-relaxed text-ink">
          <section className="space-y-2">
            <h2 className="text-base font-semibold">Disclaimer</h2>
            <p>
              Shivraj Maratha (शिवराज मराठा) is an online matrimonial platform designed to help
              members find suitable life partners within the Maratha community.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">1. No Guarantee of Results</h2>
            <p>
              We do not guarantee that you will find a suitable match or get married through this
              platform. The success of finding a partner depends on various factors beyond our control.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">2. Profile Authenticity</h2>
            <p>
              While we make reasonable efforts to verify profiles, we cannot guarantee the accuracy,
              authenticity, or completeness of information provided by members. Users are advised to
              verify details independently before proceeding.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">3. User Responsibility</h2>
            <p>
              Members are solely responsible for their interactions with other members. We advise
              exercising caution, especially when sharing personal information or meeting in person.
              Always meet in safe public places and inform trusted family members.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">4. Third-Party Content</h2>
            <p>
              We are not responsible for any content, advice, or information shared by members on
              the platform. Any reliance on such information is at your own risk.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">5. Service Availability</h2>
            <p>
              We strive to keep the service available, but we do not guarantee uninterrupted access.
              The platform may be temporarily unavailable due to maintenance, updates, or technical
              issues.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">6. Limitation of Liability</h2>
            <p>
              Shivraj Maratha shall not be liable for any damages, losses, or harms arising from
              the use of this platform, including but not limited to fraudulent profiles, misuse
              of information, or failed relationships.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">7. Changes to Disclaimer</h2>
            <p>
              We reserve the right to modify this disclaimer at any time without prior notice.
              Continued use of the platform constitutes acceptance of any changes.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
