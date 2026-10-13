import FundingSupport from '@/components/funding-support';
import Link from 'next/link';
import { getSite } from '@/lib/content';
import HeroCluster from '@/components/hero-cluster';
import {
  homepagePublications,
  publicationJournal,
} from '@/lib/content/publication-presentation';
import { researchSummary } from '@/components/research-explainer';
import { text } from '@/lib/wordpress/adapters';
import {
  NewsCard,
  PersonCard,
  PublicationCard,
  RichText,
  ScientificImage,
  SectionHeading,
} from '@/components/content';

export const revalidate = 300;
export const metadata = { alternates: { canonical: '/' } };
export default async function Home() {
  const site = await getSite();
  const homePeople = site.featuredPeople.length
    ? site.featuredPeople
    : site.roster.filter((p) => !p.alumni && p.name);
  const homeNews = site.featuredNews.length ? site.featuredNews : site.news;
  const homeAreas = site.areas.some((a) => a.featured)
    ? site.areas.filter((a) => a.featured)
    : site.areas;
  const featured = homepagePublications(site.publications);
  return (
    <main id="main">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="red-dot" />
              {site.heroEyebrow || site.heroSubtitle}
            </p>
            <h1>{site.heroTitle}</h1>
            {site.heroEyebrow && <p>{site.heroSubtitle}</p>}
            {site.heroDescription && (
              <p className="hero-description">{site.heroDescription}</p>
            )}
            <div className="hero-actions">
              <Link className="button button-red" href={site.primaryHref}>
                {site.primaryLabel} <span aria-hidden="true">↗</span>
              </Link>
              <Link className="button button-outline" href={site.secondaryHref}>
                {site.secondaryLabel} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <HeroCluster photo={site.heroPhoto} />
        </div>
        <div className="container hero-baseline">
          <span>Southern Methodist University</span>
          <span>
            Inorganic chemistry · Materials chemistry · Chemical biology
          </span>
        </div>
      </section>
      {site.research && (
        <section className="section container">
          <SectionHeading
            label="01 / Research"
            title="Understanding materials, atom by atom."
            href="/research"
            linkLabel="Our research"
          />
          <div className="research-grid research-grid--editorial">
            {homeAreas.length
              ? homeAreas.slice(0, 5).map((a, i) => (
                  <article className="research-card" key={a.id}>
                    {a.photo && (
                      <div className="research-image">
                        <ScientificImage photo={a.photo} />
                      </div>
                    )}
                    <span className="card-index">0{i + 1}</span>
                    <h3>{text(a.title)}</h3>
                    <p>{a.summary}</p>
                    <Link
                      className="text-link"
                      href={`/research#research-${a.id}`}
                      aria-label={`Explore ${text(a.title)}`}
                    >
                      Explore research ↗
                    </Link>
                  </article>
                ))
              : site.focus.map((f, i) => (
                  <article className="research-card" key={f.title}>
                    <span className="card-index">0{i + 1}</span>
                    <h3>{f.title}</h3>
                    <p>{researchSummary(f)}</p>
                    <Link
                      className="text-link"
                      href="/research"
                      aria-label={`Explore research in ${f.title}`}
                    >
                      Explore research ↗
                    </Link>
                  </article>
                ))}
          </div>
        </section>
      )}
      {featured.length > 0 && (
        <section className="section container">
          <SectionHeading
            label="02 / Publications"
            title="Selected publications."
            href="/publications"
            linkLabel="All publications"
          />
          <div className="featured-publications">
            {featured.map((p, i) => (
              <PublicationCard
                key={p.id}
                publication={p}
                compact={i !== 0}
                lead={i === 0}
                journal={publicationJournal(p)}
              />
            ))}
          </div>
        </section>
      )}
      {site.researchPhoto && (
        <section className="atomic-section">
          <div className="container atomic-grid">
            <figure>
              <ScientificImage
                photo={{
                  ...site.researchPhoto,
                  alt:
                    site.researchPhoto.alt ||
                    'Molecular structures and experimental samples from Das Research Group research',
                }}
              />
              <figcaption>
                Scientific visual from the Das Research Group.
              </figcaption>
            </figure>
            <div>
              <p className="eyebrow">Research at the atomic scale</p>
              <h2>
                Why atomic precision
                <br />
                matters.
              </h2>
              {site.atomicHtml ? (
                <RichText html={site.atomicHtml} />
              ) : (
                <p>
                  Explore the group’s work in atomically precise materials,
                  catalysis and biology.
                </p>
              )}
              <Link className="text-link" href="/research">
                Inside our research <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>
      )}
      {(site.pi || site.roster.length > 0) && (
        <section className="section group-section">
          <div className="container">
            <SectionHeading
              label="03 / Our team"
              title="Science is a collective effort."
              href="/people"
              linkLabel="Meet everyone"
            />
            <div className="people-preview">
              {site.pi && (
                <article className="person-card">
                  <div className="portrait-frame">
                    {site.piPhoto && (
                      <ScientificImage
                        photo={{
                          ...site.piPhoto,
                          alt: site.piPhoto.alt || 'Anindita (Dia) Das',
                        }}
                        sizes="(max-width: 600px) 104px, 400px"
                      />
                    )}
                  </div>
                  <div className="person-copy">
                    <h3>{site.piName}</h3>
                    <p className="muted">{site.piTitle}</p>
                    <Link className="text-link" href="/people/anindita-das">
                      Meet Dr. Das <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </article>
              )}
              {homePeople.slice(0, site.pi ? 2 : 3).map((p) => (
                <PersonCard person={p} key={p.id} compact />
              ))}
            </div>
          </div>
        </section>
      )}
      {site.news.length > 0 && (
        <section className="section container">
          <SectionHeading
            label="04 / Lab notebook"
            title="From the group."
            href="/news"
            linkLabel="All group news"
          />
          <div className="lab-highlights">
            {homeNews.slice(0, 3).map((n, i) => (
              <NewsCard
                news={n}
                index={i}
                key={n.id}
                compact
                preview={text(n.html)}
              />
            ))}
          </div>
        </section>
      )}
      <FundingSupport funding={site.funding} />
      <section className="join-section">
        <div className="container join-grid">
          <div>
            <p className="eyebrow">Curiosity belongs here</p>
            <h2>{site.joinCtaTitle}</h2>
            {site.joinCtaHtml && <RichText html={site.joinCtaHtml} />}
          </div>
          <Link className="button button-red" href={site.joinCtaHref}>
            {site.joinCtaLabel} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      {site.stats && (
        <section className="container content-section">
          <RichText html={site.stats} />
        </section>
      )}
    </main>
  );
}
