import Link from "next/link";
import { Shield, Lock, ArrowLeft } from "lucide-react";
import Footer from "../../src/components/Footer";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Trust Lesson decentralized mentorship and milestone escrow platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-28 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 mb-6"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-4">
              <Lock size={13} />
              <span>Legal &amp; Privacy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Effective Date: November 22, 2026 &middot; Trust Lesson (trust-lesson.xyz)
            </p>
          </div>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-lg font-bold text-slate-950">1. Information We Collect</h2>
            <p>
              Trust Lesson collects only the information necessary to operate our peer-to-peer mentorship marketplace and smart contract escrow services:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Account &amp; Profile Data:</strong> Name, email address, role (Learner or Mentor), biography, and optional profile avatar.
              </li>
              <li>
                <strong>Web3 Wallet Data:</strong> Public EVM wallet addresses used for authentication, milestone escrow transactions, and verifiable on-chain credentials on Arbitrum. We never access or store your private keys.
              </li>
              <li>
                <strong>Google API &amp; Calendar Data:</strong> When you authenticate with Google or schedule live mentorship sessions, we use Google OAuth solely for identity verification and generating Google Meet / Calendar session links.
              </li>
              <li>
                <strong>Session &amp; Communication Data:</strong> Booking schedules, milestone progress, uploaded course deliverables, and in-platform messages.
              </li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-lg font-bold text-slate-950">2. How We Use Information</h2>
            <p>We use collected information strictly to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Authenticate your account via email/password, Google OAuth, or Sign-In with Ethereum (SIWE).</li>
              <li>Facilitate mentor-learner bookings, live video sessions, and automated milestone notifications.</li>
              <li>Coordinate non-custodial USDC escrow settlements and issue verifiable on-chain credentials.</li>
              <li>Prevent fraud, abuse, and unauthorized access across the platform.</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-lg font-bold text-slate-950">3. Google API Services User Data Policy</h2>
            <p>
              Trust Lesson&apos;s use and transfer to any other app of information received from Google APIs adheres to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline font-semibold"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements. We do not sell Google user data or use it for advertising.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-lg font-bold text-slate-950">4. Public Blockchain Data</h2>
            <p>
              Transactions executed on the Arbitrum network (including escrow deposits, milestone releases, dispute outcomes, and verifiable credentials) are recorded on a public blockchain and cannot be altered or deleted.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-lg font-bold text-slate-950">5. Data Retention &amp; Your Rights</h2>
            <p>
              You may request access, correction, or deletion of your off-chain account data at any time by contacting our team. You can also revoke Google OAuth access directly via your Google Account Security settings.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <Shield size={18} className="text-emerald-600" />
              <span>6. Contact Us</span>
            </h2>
            <p>
              For any privacy inquiries or data deletion requests, please contact{" "}
              <a
                href="mailto:rayhanabbrar233@gmail.com"
                className="text-purple-600 hover:underline font-semibold"
              >
                rayhanabbrar233@gmail.com
              </a>{" "}
              or reach us via the{" "}
              <Link href="/about#contact" className="text-purple-600 hover:underline font-semibold">
                Contact Form
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
