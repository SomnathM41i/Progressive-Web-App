import { ScreenHeader } from '@/components/navigation/ScreenHeader'

export function PrivacyPolicyPage() {
  return (
    <div className="flex h-dvh flex-col bg-cream">
      <ScreenHeader title="Privacy Policy" />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-safe">
        <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-line bg-white p-4 text-sm leading-relaxed text-ink">
          <section className="space-y-2">
            <h2 className="text-base font-semibold">1. Introduction</h2>
            <p>
              Shivraj Maratha (शिवराज मराठा) is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our
              matrimonial service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">2. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Personal details (name, gender, date of birth, marital status, religion, caste)</li>
              <li>Contact information (mobile number, email address, residential address)</li>
              <li>Profile information (education, occupation, income, family details, partner preferences)</li>
              <li>Photos and documents you upload to your profile</li>
              <li>Usage data and device information</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">3. How We Use Your Information</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>To create and manage your matrimonial profile</li>
              <li>To facilitate matches and communication between members</li>
              <li>To provide customer support and respond to inquiries</li>
              <li>To improve our services and user experience</li>
              <li>To send important notifications related to your account</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">4. Information Sharing and Disclosure</h2>
            <p>
              Your profile information is visible to other registered members as per your privacy
              settings. We do not sell, trade, or rent your personal information to third parties.
              We may share information only when required by law or to protect our rights.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">5. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information.
              However, no method of transmission over the internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">6. Your Rights</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Access and update your personal information</li>
              <li>Manage your privacy settings</li>
              <li>Request deletion of your account</li>
              <li>Opt out of certain communications</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">7. Cookies</h2>
            <p>
              We may use cookies and similar technologies to enhance your experience, analyze usage,
              and provide personalized content.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new policy on this page.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through the
              support channels provided on the platform.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
