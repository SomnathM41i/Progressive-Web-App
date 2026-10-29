import { ScreenHeader } from '@/components/navigation/ScreenHeader'

export function TermsConditionsPage() {
  return (
    <div className="flex h-dvh flex-col bg-cream">
      <ScreenHeader title="Terms and Conditions" />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-safe">
        <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-line bg-white p-4 text-sm leading-relaxed text-ink">
          <section className="space-y-2">
            <h2 className="text-base font-semibold">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Shivraj Maratha (शिवराज मराठा) matrimonial services, you accept
              and agree to be bound by the terms and provisions of this agreement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">2. Eligibility</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>You must be at least 18 years of age to use this service</li>
              <li>You must be legally eligible to marry as per applicable laws</li>
              <li>You must provide accurate and truthful information</li>
              <li>You must not have been previously banned from the service</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">3. Account Registration</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials.
              You agree to provide accurate, current, and complete information during registration
              and to update such information to keep it accurate.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">4. Use of Service</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>This service is intended for genuine matrimonial purposes only</li>
              <li>You agree not to use the service for dating, friendship, or commercial purposes</li>
              <li>You will not post false, misleading, or fraudulent information</li>
              <li>You will not harass, abuse, or harm other members</li>
              <li>You will not share contact details publicly or spam other members</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">5. Profile Content</h2>
            <p>
              You are solely responsible for the content you post on your profile. Photos and
              information must be appropriate and genuine. We reserve the right to remove any
              content that violates these terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">6. Privacy and Communication</h2>
            <p>
              Your use of this service is also governed by our Privacy Policy. We respect your
              privacy and have implemented measures to protect your personal information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account without notice if you
              violate these terms and conditions. You may also request account deletion at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">8. Disclaimer</h2>
            <p>
              We do not guarantee successful matches or marriages. We are not responsible for the
              authenticity of member profiles or the outcomes of interactions between members.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">9. Limitation of Liability</h2>
            <p>
              Shivraj Maratha shall not be liable for any direct, indirect, incidental, or
              consequential damages arising from the use of this service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service
              after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">11. Governing Law</h2>
            <p>
              These terms and conditions shall be governed by and construed in accordance with the
              laws of India.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
