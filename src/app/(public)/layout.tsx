import Link from 'next/link';
import Navigation from '@/components/navigation';
import { RichText } from '@/components/content';
import { getSite } from '@/lib/content';
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSite();
  const professionalLinks = [
    ...site.piHtml.matchAll(/<a\b[^>]*href="([^"]+)"/g),
  ].flatMap((match) => {
    try {
      const href = match[1].replaceAll('&amp;', '&');
      const url = new URL(href);
      const labels: Record<string, string> = {
        'linkedin.com': 'LinkedIn',
        'x.com': 'X',
        'twitter.com': 'X',
        'orcid.org': 'ORCID',
        'scholar.google.com': 'Google Scholar',
      };
      const label = labels[url.hostname.replace(/^www\./, '')];
      return label ? [{ href, label }] : [];
    } catch {
      return [];
    }
  });
  return (
    <>
      <Navigation />
      {site.mode === 'offline' && (
        <div className="status-banner">
          Offline preview · Content snapshot from{' '}
          {new Intl.DateTimeFormat('en-US', {
            dateStyle: 'long',
            timeZone: 'UTC',
          }).format(new Date(site.capturedAt!))}
          .
        </div>
      )}
      {site.mode === 'unavailable' && (
        <div className="status-banner">
          Lab content is temporarily unavailable.{' '}
          <a href="https://people.smu.edu/daslab/">Visit the official site.</a>
        </div>
      )}
      {children}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Link className="footer-brand" href="/">
              {site.footerSettings?.name || 'Das Research Group'}
              <span>
                {site.footerSettings?.affiliation.join(' · ') ||
                  'Southern Methodist University'}
              </span>
            </Link>
            <a href="https://www.smu.edu/dedman/academics/departments/chemistry">
              Department of Chemistry ↗
            </a>
            <p>
              Synthetic nanoscience
              <br />
              with atomic precision.
            </p>
            {site.footerHtml && <RichText html={site.footerHtml} />}
            {site.footerSettings?.address && (
              <RichText html={site.footerSettings.address} />
            )}
          </div>
          <div>
            <p className="eyebrow">Explore</p>
            <Link href="/research">Research</Link>
            <Link href="/people">Team</Link>
            <Link href="/publications">Publications</Link>
            <Link href="/news">Group News</Link>
          </div>
          <div>
            <p className="eyebrow">Around the lab</p>
            <Link href="/facilities">Instruments</Link>
            <Link href="/gallery">Group Photos</Link>
            <Link href="/teaching">Teaching</Link>
            <Link href="/join">Join Us</Link>
          </div>
          <div>
            <p className="eyebrow">Connect</p>
            <Link href="/contact">Contact & directions</Link>
            {(site.footerSettings ? site.footerSettings.email : site.email) && (
              <a
                href={`mailto:${site.footerSettings ? site.footerSettings.email : site.email}`}
              >
                {site.footerSettings ? site.footerSettings.email : site.email}
              </a>
            )}
            {(!site.footerSettings
              ? site.piLinks.length
                ? site.piLinks
                : professionalLinks
              : []
            ).map((link) => (
              <a href={link.href} key={link.href}>
                {link.label} ↗
              </a>
            ))}
            {site.footerSettings?.links && (
              <RichText html={site.footerSettings.links} />
            )}
            {!site.footerSettings && (
              <>
                <a href="https://people.smu.edu/daslab/">SMU lab website ↗</a>
                <a href="https://www.smu.edu/">
                  Southern Methodist University ↗
                </a>
                <a href="https://grad.smu.edu/graduate-studies-in-chemistry">
                  Chemistry graduate admissions ↗
                </a>
              </>
            )}
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            {site.footerSettings?.copyright ||
              'Das Research Group · SMU Chemistry'}
          </span>
          <span>Dallas, Texas</span>
          <Link className="footer-admin" href="/admin" rel="nofollow">
            Admin
          </Link>
        </div>
      </footer>
    </>
  );
}
