import Link from "next/link";
import { FileText, Shield, ArrowLeft } from "lucide-react";
import Footer from "../../src/components/Footer";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service governing the use of Trust Lesson decentralized mentorship and escrow marketplace.",
};

export default function TermsOfServicePage() {
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
              <FileText size={13} />
              <span>Legal Terms</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Effective Date: November 22, 2026 &middot; Trust Lesson (trust-lesson.xyz)
            </p>
          </div>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-lg font-bold text-slate-950">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Trust Lesson (&quot;Platform&quot;), you agree to be bound by these Terms of Service and our{" "}
              <Link href="/privacy" className="text-purple-600 hover:underline font-semibold">
                Privacy Policy
              </Link>
              . If you do not agree, please discontinue use of the Platform.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-lg font-bold text-slate-950">2. Platform Services &amp; Smart Contract Escrow</h2>
            <p>
              Trust Lesson provides a decentralized skill-exchange marketplace connecting Learners with independent Mentors. Payments are processed via non-custodial USDC smart contract escrow on the Arbitrum network:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Milestone Releases:</strong> Learners deposit USDC into escrow upon booking and authorize milestone releases upon satisfactory completion of sessions.
              </li>
              <li>
                <strong>Mentor Timeout Protection:</strong> If a session expires past the dispute window without action or dispute, the Mentor may claim unreleased escrow funds in accordance with smart contract rules.
              </li>
              <li>
                <strong>Cancellations:</strong> Learners may cancel funded sessions prior to session start for a full refund as enforced by the escrow contract.
              </li>
              <li>
                <strong>Platform Fee:</strong> A standard 10% protocol fee applies to completed bookings and course purchases.
              </li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-lg font-bold text-slate-950">3. Dispute Resolution</h2>
            <p>
              In the event of a disagreement during an active session, either party may raise an on-chain dispute within the active dispute window. Disputes are adjudicated by the decentralized Dispute Council or designated resolver based on submitted evidence, and funds are distributed strictly from remaining unreleased escrow balances.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-lg font-bold text-slate-950">4. User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You are solely responsible for securing your Web3 wallet, private keys, and account credentials.</li>
              <li>Mentors must deliver accurate educational guidance, respect scheduled session times, and maintain professional conduct.</li>
              <li>Users must not engage in fraud, spam, harassment, copyright infringement, or smart contract exploitation.</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-lg font-bold text-slate-950">5. Blockchain &amp; Risk Disclaimer</h2>
            <p>
              Transactions on Arbitrum and other blockchain networks are irreversible once confirmed. Trust Lesson is provided &quot;as is&quot; without warranties of uninterrupted availability, and is not liable for network congestion, wallet compromise, or third-party service outages.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <Shield size={18} className="text-emerald-600" />
              <span>6. Contact</span>
            </h2>
            <p>
              Questions regarding these Terms of Service may be sent to{" "}
              <a
                href="mailto:rayhanabbrar233@gmail.com"
                className="text-purple-600 hover:underline font-semibold"
              >
                rayhanabbrar233@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
