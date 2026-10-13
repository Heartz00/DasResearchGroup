import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getSite } from '@/lib/content';
import { cleanHtml, text } from '@/lib/wordpress/adapters';
import { Empty, RichText, ScientificImage } from '@/components/content';
import PublicationList from '@/components/publication-list';
import ResearchExplainer from '@/components/research-explainer';
import TeamDirectory from '@/components/team-directory';
import { publicationJournal } from '@/lib/content/publication-presentation';
import Gallery from '@/components/gallery';
import InstrumentExhibition from '@/components/instrument-exhibition';
import NewsList from '@/components/news-list';
import { contactDetails } from '@/lib/content/contact-presentation';

const pages: Record<
  string,
  { title: string; label: string; description: string }
> = {
  research: {
    title: 'Research',
    label: 'Science with atomic precision',
    description:
      'Synthetic inorganic chemistry, coinage metal clusters and multifunctional hybrid materials.',
  },
  people: {
    title: 'Team',
    label: 'Team / Das Research Group',
    description:
      'The researchers behind the science at the Das Research Group.',
  },
  publications: {
    title: 'Publications',
    label: 'Ideas in print',
    description:
      'Research publications and preprints from the Das Research Group.',
  },
  news: {
    title: 'Group News',
    label: 'Group News / Lab notebook',
    description:
      'Research updates, awards and milestones from the Das Research Group.',
  },
  facilities: {
    title: 'Instruments',
    label: 'Instruments / Instrumentation',
    description:
      'Laboratory instrumentation and facilities at the Das Research Group.',
  },
  gallery: {
    title: 'Group Photos',
    label: 'Gallery / Life in the group',
    description: 'Photographs from the Das Research Group.',
  },
  join: {
    title: 'Join Us',
    label: 'Your next research question',
    description:
      'Find out how to contact the Das Research Group about research opportunities.',
  },
  contact: {
    title: 'Contact',
    label: 'Contact / SMU Chemistry',
    description:
      'Contact the Das Research Group at Southern Methodist University.',
  },
  teaching: {
    title: 'Teaching',
    label: 'Learning / SMU Chemistry',
    description: 'Teaching information from the Das Research Group.',
  },
};
export const revalidate = 300;
export function generateStaticParams() {
  return Object.keys(pages).map((section) => ({ section }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const info = pages[section];
  return info
    ? {
        title: info.title,
        description: info.description,
        alternates: { canonical: `/${section}` },
        openGraph: {
          title: `${info.title} | Das Research Group`,
          description: info.description,
          url: `/${section}`,
        },
      }
    : {};
}
export default async function ContentPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const info = pages[section];
  if (!info) notFound();
  const site = await getSite();
  const pageHeader =
    section === 'gallery'
      ? {
          photo:
            site.gallery.find((photo) => photo.width >= photo.height) ??
            site.gallery[0],
          lightText: true,
          title: '',
          description: '',
        }
      : site.pageHeaders[section];
  return (
    <main id="main">
      <section
        className={`page-intro${pageHeader?.photo ? ` page-intro--managed-photo${pageHeader.lightText ? ' page-intro--light-text' : ''}` : section === 'people' && site.peopleHeaderPhoto ? ' page-intro--people-photo' : ''}`}
      >
        {pageHeader?.photo && (
          <div className="page-header-photo" aria-hidden="true">
            <Image
              fill
              loading="eager"
              fetchPriority="high"
              src={pageHeader.photo.url}
              alt=""
              sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: 'center 55%' }}
            />
          </div>
        )}
        {section === 'people' && site.peopleHeaderPhoto && (
          <div className="people-intro-photo" aria-hidden="true">
            <Image
              fill
              loading="eager"
              fetchPriority="high"
              src={site.peopleHeaderPhoto.url}
              alt=""
              sizes="(max-width: 760px) 100vw, 65vw"
              style={{ objectFit: 'cover', objectPosition: 'center 54%' }}
            />
          </div>
        )}
        <div className="container">
          <p className="eyebrow">{info.label}</p>
          <h1>
            {pageHeader?.title || info.title}
            <span className="red-period">.</span>
          </h1>
          <p>{pageHeader?.description || info.description}</p>
          {section === 'people' && (
            <Link className="text-link people-photos-link" href="/gallery">
              View group photos <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </section>
      <div className={`container page-content page-content--${section}`}>
        {section === 'research' &&
          (site.research ? (
            <>
              {!site.areas.length && <ResearchExplainer focus={site.focus} />}
              {site.areas.length > 0 && (
                <nav className="section-navigation" aria-label="Research areas">
                  {site.areas.map((a) => (
                    <a key={a.id} href={`#research-${a.id}`}>
                      {text(a.title)}
                    </a>
                  ))}
                </nav>
              )}
              <div className="research-page-grid">
                <div>
                  <h2>Research overview</h2>
                  <details className="research-background">
                    <summary>Read the complete scientific overview</summary>
                    <RichText html={site.researchHtml} />
                  </details>
                  <p className="collection-note">
                    The complete overview provides scientific context. Related
                    papers provide detailed methods and results.
                  </p>
                </div>
                <div>
                  {site.researchPhoto && (
                    <div className="research-overview-figure">
                      <Gallery
                        photos={[
                          {
                            ...site.researchPhoto,
                            alt:
                              site.researchPhoto.alt ||
                              'Das lab molecular structures and experimental samples',
                            caption:
                              site.researchPhoto.caption ||
                              'Research visual from the group.',
                          },
                        ]}
                        label="Research visuals"
                        imageLabel="Research figure"
                        showToolbar={false}
                      />
                    </div>
                  )}
                  <Link className="text-link" href="/publications">
                    Explore related publications ↗
                  </Link>
                </div>
              </div>
              {site.areas.map((a) => (
                <section
                  className={`content-section research-area ${a.photo ? 'research-area--with-image' : ''}`}
                  key={a.id}
                  id={`research-${a.id}`}
                >
                  <h2>{text(a.title)}</h2>
                  {a.photo && <ScientificImage photo={a.photo} />}
                  <RichText html={cleanHtml(a.html)} />
                  {!!a.images.length && (
                    <div className="research-figure-gallery">
                      <Gallery
                        photos={a.images}
                        label="Research figures"
                        imageLabel="Research figure"
                      />
                    </div>
                  )}
                  <Link
                    className="text-link"
                    href="/publications"
                    aria-label={`Explore publications related to ${text(a.title)}`}
                  >
                    Explore publications <span aria-hidden="true">↗</span>
                  </Link>
                </section>
              ))}
            </>
          ) : (
            <Empty source="https://people.smu.edu/daslab/" />
          ))}
        {section === 'people' &&
          (site.pi || site.roster.length ? (
            <TeamDirectory
              roster={site.roster}
              searchText={Object.fromEntries(
                site.roster.map((p) => [p.id, text(p.html)]),
              )}
              leader={
                site.pi ? (
                  <section className="pi-preview" id="principal-investigator">
                    {site.piPhoto && (
                      <ScientificImage
                        photo={{
                          ...site.piPhoto,
                          alt: site.piPhoto.alt || 'Anindita (Dia) Das',
                        }}
                        priority
                      />
                    )}
                    <div>
                      <p className="eyebrow">Principal investigator</p>
                      <h2>{site.piName}</h2>
                      <p>Das Research Group · Southern Methodist University</p>
                      <Link
                        className="button button-dark"
                        href="/people/anindita-das"
                      >
                        About Dr. Das ↗
                      </Link>
                    </div>
                  </section>
                ) : null
              }
            />
          ) : (
            <Empty source="https://people.smu.edu/daslab/people/" />
          ))}
        {section === 'publications' &&
          (site.publications.length ? (
            <>
              <p className="collection-note">
                Browse the group’s publications by year, author or journal.
                Preprints and work under review are labeled separately.
                Undergraduate and equal-contribution markings are retained in
                citations.
              </p>
              <PublicationList
                publications={site.publications}
                journalLabels={Object.fromEntries(
                  site.publications.map((p) => [p.id, publicationJournal(p)]),
                )}
                searchText={Object.fromEntries(
                  site.publications.map((p) => [p.id, text(p.html)]),
                )}
              />
            </>
          ) : (
            <Empty source="https://people.smu.edu/daslab/publications/" />
          ))}
        {section === 'news' &&
          (site.news.length ? (
            <>
              {site.news.some((n) => !n.date) && (
                <p className="collection-note">
                  Updates appear in the order maintained by the group. Dates are
                  shown where provided by the source.
                </p>
              )}
              <NewsList news={site.news} />
            </>
          ) : (
            <Empty source="https://people.smu.edu/daslab/group-news/" />
          ))}
        {section === 'facilities' &&
          (site.instruments.length || site.instrumentPhotos.length ? (
            <InstrumentExhibition
              instruments={site.instruments}
              photos={site.instrumentPhotos}
            />
          ) : (
            <Empty source="https://people.smu.edu/daslab/instruments-2/" />
          ))}
        {section === 'gallery' &&
          (site.gallery.length ? (
            <Gallery photos={site.gallery} />
          ) : (
            <Empty source="https://people.smu.edu/daslab/lab-photos/" />
          ))}
        {section === 'join' &&
          (site.joinHtml ? (
            <div className="join-page">
              <div>
                <p className="eyebrow">Research opportunities</p>
                <h2>Bring your curiosity.</h2>
                <RichText
                  html={site.joinStructured ? site.joinIntro : site.joinHtml}
                />
                {site.joinStructured ? (
                  <section
                    className="opportunity-paths"
                    aria-label="Research opportunities by audience"
                  >
                    {site.joinPaths.map((path) => (
                      <article key={path.title}>
                        <h3>{path.title}</h3>
                        <RichText html={path.html} />
                      </article>
                    ))}
                  </section>
                ) : (
                  <section
                    className="opportunity-paths"
                    aria-labelledby="opportunity-paths-title"
                  >
                    <h2 id="opportunity-paths-title">Find your next step</h2>
                    <article>
                      <h3>Prospective PhD students</h3>
                      <p>
                        Explore the group’s research and contact Prof. Das about
                        your interests. Consult SMU for current program and
                        application information.
                      </p>
                      <a
                        className="text-link"
                        href="https://www.smu.edu/dedman/academics/departments/chemistry/graduate"
                      >
                        SMU Chemistry graduate programs ↗
                      </a>
                    </article>
                    <article>
                      <h3>Undergraduate researchers</h3>
                      <p>
                        Contact Prof. Das to ask about possible research
                        opportunities and how your interests connect with the
                        group’s work.
                      </p>
                    </article>
                    <article>
                      <h3>Postdoctoral researchers</h3>
                      <p>
                        Contact Prof. Das with your research background to
                        discuss possible opportunities.
                      </p>
                    </article>
                    <article>
                      <h3>Visiting researchers</h3>
                      <p>
                        Contact the group to ask whether a research visit can be
                        accommodated.
                      </p>
                    </article>
                    <article>
                      <h3>Collaborators</h3>
                      <p>
                        Review the research themes and publications, then
                        contact Prof. Das to discuss a potential scientific
                        collaboration.
                      </p>
                      <Link className="text-link" href="/publications">
                        Explore group publications →
                      </Link>
                    </article>
                  </section>
                )}
                {text(site.openPositions) && (
                  <section className="content-section">
                    <h2>Open positions</h2>
                    <RichText html={site.openPositions} />
                  </section>
                )}
              </div>
              <aside className="contact-panel">
                <h2>Start a conversation</h2>
                <p>Contact Prof. Das to discuss research opportunities.</p>
                {site.joinInstructions && (
                  <RichText html={site.joinInstructions} />
                )}
                {site.admissionsUrl && (
                  <a className="text-link" href={site.admissionsUrl}>
                    Graduate admissions ↗
                  </a>
                )}
                {site.departmentUrl && (
                  <a className="text-link" href={site.departmentUrl}>
                    Chemistry department ↗
                  </a>
                )}
                {/curriculum vitae/i.test(text(site.joinHtml)) && (
                  <p className="collection-note">
                    The group asks prospective researchers to include a
                    curriculum vitae when contacting Prof. Das.
                  </p>
                )}
                {site.email && (
                  <a
                    className="button button-red"
                    href={`mailto:${site.email}?subject=Research%20opportunities%20at%20the%20Das%20Research%20Group`}
                  >
                    Email Prof. Das ↗
                  </a>
                )}
                <Link className="text-link" href="/research">
                  Get to know our research →
                </Link>
              </aside>
            </div>
          ) : (
            <Empty source="https://people.smu.edu/daslab/news/" />
          ))}
        {section === 'contact' &&
          (site.pi ? (
            <div className="contact-grid">
              <div>
                <h2>{site.contactName}</h2>
                <p>
                  Principal investigator:{' '}
                  <Link href="/people/anindita-das">{site.contactPi}</Link>
                </p>
                <p>
                  {site.contactDepartment}
                  <br />
                  {site.contactUniversity}
                </p>
                {site.contactEmail && (
                  <p>
                    <a
                      className="contact-email"
                      href={`mailto:${site.contactEmail}`}
                    >
                      {site.contactEmail}
                    </a>
                  </p>
                )}
                <RichText html={contactDetails(site.contactHtml)} />
                {site.mapUrl && (
                  <a className="text-link" href={site.mapUrl}>
                    Directions ↗
                  </a>
                )}
              </div>
              <aside className="contact-panel">
                <p className="eyebrow">Research & collaboration</p>
                <h2>Let’s talk science.</h2>
                <p>Questions about our research or joining the group?</p>
                <Link className="text-link" href="/join">
                  Research opportunities →
                </Link>
                <a className="text-link" href={site.contactDepartmentUrl}>
                  SMU Department of Chemistry ↗
                </a>
              </aside>
            </div>
          ) : (
            <Empty source="https://people.smu.edu/daslab/news/" />
          ))}
        {section === 'teaching' &&
          (site.teaching ? (
            <div className="narrow-content">
              <h2>Courses listed by the group</h2>
              <RichText html={cleanHtml(site.teaching.html)} />
              <p className="collection-note">
                This is the group’s teaching record. Consult SMU for current
                course availability.
              </p>
            </div>
          ) : (
            <Empty source="https://people.smu.edu/daslab/teaching/" />
          ))}
      </div>
    </main>
  );
}
