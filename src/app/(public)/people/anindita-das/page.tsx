import type { Metadata } from 'next';
import Link from 'next/link';
import { getSite } from '@/lib/content';
import { Empty, RichText, ScientificImage } from '@/components/content';
import { profileLinks } from '@/lib/content/profile-links';
import { sections } from '@/lib/wordpress/adapters';
import { contactDetails } from '@/lib/content/contact-presentation';
export const revalidate = 300;
export const metadata: Metadata = {
  title: 'About Dr. Das',
  description:
    'Biography and contact information for Anindita (Dia) Das at SMU.',
  alternates: { canonical: '/people/anindita-das' },
};
export default async function PIPage() {
  const site = await getSite();
  const sourceFields = sections(site.pi?.html || '');
  const professionalLinks = [
    ...site.piLinks,
    ...profileLinks(site.piHtml).filter(
      (link) => !Object.hasOwn(sourceFields, link.label.toLowerCase()),
    ),
  ];
  return (
    <main id="main">
      <section className="page-intro">
        <div className="container">
          <p className="eyebrow">Team / Principal investigator</p>
          <h1>
            {site.piName}
            <span className="red-period">.</span>
          </h1>
          <p>
            {site.piTitle} · Department of Chemistry · Southern Methodist
            University
          </p>
        </div>
      </section>
      <div className="container page-content">
        {site.pi ? (
          <div className="pi-profile">
            <aside
              className="profile-sidebar"
              aria-label="Professional information"
            >
              {site.piPhoto && (
                <ScientificImage
                  photo={{
                    ...site.piPhoto,
                    alt: site.piPhoto.alt || 'Anindita (Dia) Das',
                  }}
                  priority
                />
              )}
              <div className="profile-information">
                <h2>{site.piTitle}</h2>
                {site.piOffice && (
                  <p>
                    <strong>Office</strong>
                    <br />
                    {site.piOffice}
                  </p>
                )}
                {site.email && (
                  <p>
                    <a className="text-link" href={`mailto:${site.email}`}>
                      {site.email}
                    </a>
                  </p>
                )}
                {professionalLinks.length > 0 && (
                  <nav
                    className="profile-actions"
                    aria-label="Professional profiles"
                  >
                    {professionalLinks.map((link) => (
                      <a className="text-link" href={link.href} key={link.href}>
                        {link.label} ↗
                      </a>
                    ))}
                  </nav>
                )}
              </div>
            </aside>
            <div>
              <nav
                className="profile-actions"
                aria-label="Principal investigator actions"
              >
                {site.email && (
                  <a className="text-link" href={`mailto:${site.email}`}>
                    Email Prof. Das <span aria-hidden="true">↗</span>
                  </a>
                )}
                <Link className="text-link" href="/join">
                  Research opportunities <span aria-hidden="true">→</span>
                </Link>
              </nav>
              <section className="profile-section">
                <h2>Biography & research background</h2>
                <RichText html={site.piBiography} />
              </section>
              {site.piDetails.map((detail) => (
                <section key={detail.title} className="profile-section">
                  <h2>{detail.title}</h2>
                  <RichText html={detail.html} />
                </section>
              ))}
              <section className="profile-section">
                <h2>Research at SMU</h2>
                <p>
                  Explore the group’s research themes and publications to learn
                  about its work in atomically precise nanochemistry and hybrid
                  materials.
                </p>
                <nav
                  className="profile-actions"
                  aria-label="Explore the group's science"
                >
                  <Link className="text-link" href="/research">
                    Research themes →
                  </Link>
                  <Link className="text-link" href="/publications">
                    Group publications →
                  </Link>
                </nav>
              </section>
              <section className="profile-section">
                <h2>Contact & opportunities</h2>
                <RichText
                  html={contactDetails(
                    site.contactHtml,
                    professionalLinks.map((link) => link.href),
                    site.piOffice,
                  )}
                />
                <Link className="text-link" href="/join">
                  Information for prospective researchers →
                </Link>
              </section>
            </div>
          </div>
        ) : (
          <Empty source="https://people.smu.edu/daslab/news/" />
        )}
      </div>
    </main>
  );
}
