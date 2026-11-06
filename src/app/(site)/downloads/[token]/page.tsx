import Link from "next/link";
import { GuideCover } from "@/components/cards";
import { formatDate } from "@/lib/labels";
import { resolveDownload } from "@/lib/purchases";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your download", robots: { index: false, follow: false }, referrer: "no-referrer" as const };

const MESSAGES = {
  invalid: ["Link not recognised.", "This download link is invalid. Check you copied the full link, or contact us."],
  unpaid: ["Payment not completed.", "This purchase hasn't been paid, so no download is available."],
  expired: ["This link has expired.", "Download links last 30 days. Contact us and we'll issue a new one."],
  exhausted: ["Download limit reached.", "This link has been used the maximum number of times. Contact us if you need help."],
  unavailable: ["File unavailable.", "We couldn't find this file. Please contact us."],
} as const;

export default async function DownloadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const access = await resolveDownload(token);
  if (!access.ok) {
    const [title, body] = MESSAGES[access.reason];
    return (
      <section className="container-x max-w-2xl py-24" data-testid="download-denied">
        <h1 className="display text-[56px] text-forest">{title}</h1>
        <p className="mt-4 text-lg text-charcoal/75">{body}</p>
        <Link href="/contact?topic=Guides" className="btn-forest mt-8">Contact us</Link>
      </section>
    );
  }
  const { guide, purchase, isTest, remaining } = access;
  return (
    <section className="container-x grid gap-14 py-20 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-6">
        {isTest && (
          <p className="eyebrow mb-6 inline-block bg-lime px-3 py-2 text-[10px] text-forest" data-testid="test-mode-banner">Test purchase — sample file only, no payment taken</p>
        )}
        <h1 className="display text-[56px] text-forest sm:text-[72px]">{isTest ? "Your test download." : "Thank you. Your guide is ready."}</h1>
        <p className="mt-4 text-lg text-charcoal/75">{guide.title}</p>
        <a href={`/api/download/${token}`} className="btn-forest mt-10" data-testid="download-link" download>Download {isTest ? "sample" : guide.format}</a>
        <dl className="mt-10 space-y-2 text-[14px] text-charcoal/70">
          <div><dt className="inline font-semibold">Email: </dt><dd className="inline">{purchase.customer_email}</dd></div>
          <div><dt className="inline font-semibold">Link valid until: </dt><dd className="inline">{formatDate(purchase.download_expires_at)}</dd></div>
          <div><dt className="inline font-semibold">Downloads remaining: </dt><dd className="inline">{remaining}</dd></div>
        </dl>
        <p className="mt-6 max-w-md text-[13px] text-charcoal/60">Bookmark this page — it&rsquo;s your personal download link. Please don&rsquo;t share it.</p>
      </div>
      <div className="lg:col-span-4 lg:col-start-9"><GuideCover guide={guide} className="mx-auto max-w-[320px]" /></div>
    </section>
  );
}
