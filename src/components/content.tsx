import Link from 'next/link';
import type { News, Person, Publication } from '@/lib/content/types';
import { peopleRole } from '@/lib/content/people-role';
import ScientificImage from './scientific-image';
import CitationCopy from './citation-copy';
export { default as ScientificImage } from './scientific-image';

export function RichText({
  html,
  className = '',
}: {
  html: string;
  className?: string;
}) {
  // Image-only source links can become empty when images are rendered separately.
  const renderedHtml = html.replace(
    /<a\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/a>/gi,
    '',
  );
  return (
    <div
      className={`prose ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
export function SectionHeading({
  label,
  title,
  href,
  linkLabel = 'Explore',
}: {
  label: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{label}</p>
        <h2>{title}</h2>
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {linkLabel} <span aria-hidden="true">↗</span>
        </Link>
      )}
    </div>
  );
}
export function PublicationCard({
  publication: p,
  compact = false,
  showYear = true,
  lead = false,
  journal,
  row = false,
  citationText,
  number,
  bibliography = false,
}: {
  publication: Publication;
  compact?: boolean;
  showYear?: boolean;
  lead?: boolean;
  journal?: string;
  row?: boolean;
  citationText?: string;
  number?: number;
  bibliography?: boolean;
}) {
  const journalBase = journal?.replace(/[.,;]+$/, '');
  const displayTitle = journalBase
    ? p.title.replace(
        new RegExp(
          `\\.?\\s+${journalBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.?$`,
          'i',
        ),
        '',
      )
    : p.title;
  return (
    <article
      className={`publication-card ${p.photo ? 'with-image' : ''} ${p.featured ? 'publication-card--featured' : ''} ${compact ? 'publication-card--compact' : ''} ${lead ? 'publication-card--lead' : ''} ${row ? 'publication-card--row' : ''} ${bibliography ? 'publication-card--bibliography' : ''}`}
    >
      <div className="publication-body">
        {number !== undefined && (
          <p
            className="bibliography-number"
            aria-label={`Publication ${number}`}
          >
            {String(number).padStart(2, '0')}
          </p>
        )}
        <div className="publication-meta">
          {journal && <span className="publication-journal">{journal}</span>}
          {p.featured && (
            <span className="featured-label">
              {bibliography ? 'Highlighted publication' : 'Featured research'}
            </span>
          )}
          {showYear && (
            <span className="publication-year">
              {p.year ?? 'Year not listed'}
            </span>
          )}
          {(!bibliography || p.status !== 'Published') && (
            <span className="status-badge">{p.status}</span>
          )}
          {p.type && <span>{p.type}</span>}
          {p.prior && <span className="affiliation-label">Prior to SMU</span>}
        </div>
        <h3>{displayTitle}</h3>
        {compact ? (
          <details className="citation-details">
            <summary>
              Full citation
              <span className="visually-hidden"> for {p.title}</span>
            </summary>
            <RichText html={p.html} />
          </details>
        ) : (
          <RichText html={p.html} />
        )}
        <div className="publication-actions">
          {citationText && (
            <CitationCopy citation={citationText} title={displayTitle} />
          )}
          {p.link && (
            <a
              className="text-link"
              href={p.link}
              aria-label={`View ${p.status === 'Under review' ? 'preprint' : 'publication'}: ${p.title}`}
            >
              View {p.status === 'Under review' ? 'preprint' : 'publication'}{' '}
              <span aria-hidden="true">↗</span>
            </a>
          )}
          {p.doi && /^10\.\d{4,9}\//.test(p.doi) && (
            <a
              className="text-link doi-link"
              href={`https://doi.org/${p.doi}`}
              aria-label={`DOI for ${p.title}`}
            >
              DOI <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
      {p.photo && (
        <div className="publication-image">
          <ScientificImage
            photo={p.photo}
            sizes={
              lead
                ? '(max-width: 760px) calc(100vw - 40px), 480px'
                : '(max-width: 600px) calc(100vw - 40px), 240px'
            }
          />
        </div>
      )}
    </article>
  );
}
export function PersonCard({
  person: p,
  compact = false,
}: {
  person: Person;
  compact?: boolean;
}) {
  return (
    <article className={`person-card ${!p.name ? 'legacy-profile' : ''}`}>
      <div className="portrait-frame">
        {p.photo ? (
          <ScientificImage
            sizes={
              p.name
                ? '(max-width: 600px) 104px, (max-width: 1050px) 45vw, 400px'
                : '(max-width: 600px) calc(100vw - 40px), (max-width: 1050px) 45vw, 600px'
            }
            photo={{
              ...p.photo,
              alt:
                p.photo.alt ||
                (p.name
                  ? `Profile of ${p.name}`
                  : `${p.role} profile from the lab website`),
            }}
          />
        ) : (
          <div className="portrait-placeholder" aria-hidden="true">
            {p.name
              .split(' ')
              .filter(Boolean)
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
        )}
      </div>
      <div className="person-copy">
        {p.name && <h3>{p.name}</h3>}
        <p className="muted">{peopleRole(p.role)}</p>
        {p.interests && (
          <div className="person-interests">
            <p className="profile-label">Research interests</p>
            <p>{p.interests}</p>
          </div>
        )}
        {p.html && !compact && (
          <details className="member-biography">
            <summary>
              Biography
              <span className="visually-hidden">
                {' '}
                of {p.name || 'this group member'}
              </span>
            </summary>
            <RichText html={p.html} />
          </details>
        )}
        {p.email && (
          <a className="text-link" href={`mailto:${p.email}`}>
            Email {p.name || 'this researcher'}
            <span aria-hidden="true">↗</span>
          </a>
        )}
        {p.links?.length ? (
          <nav
            className="profile-actions"
            aria-label={`Professional links for ${p.name}`}
          >
            {p.links.map((link) => (
              <a key={link.label} className="text-link" href={link.href}>
                {link.label} ↗
              </a>
            ))}
          </nav>
        ) : null}
      </div>
    </article>
  );
}
export function NewsCard({
  news: n,
  index,
  headingLevel = 3,
  compact = false,
  preview = '',
}: {
  news: News;
  index?: number;
  headingLevel?: 2 | 3;
  compact?: boolean;
  preview?: string;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article
      className="news-card"
      id={index !== undefined ? `news-update-${index + 1}` : undefined}
    >
      <div className="news-number">
        {n.date ? (
          <time dateTime={n.date}>
            {new Intl.DateTimeFormat('en-US', {
              month: 'short',
              year: 'numeric',
              timeZone: 'UTC',
            }).format(new Date(n.date))}
          </time>
        ) : (
          'Group update'
        )}
      </div>
      <div>
        {n.photo && (
          <figure className="news-photo">
            <ScientificImage
              photo={n.photo}
              sizes="(max-width: 700px) 90vw, 600px"
            />
            {n.photo.caption && <figcaption>{n.photo.caption}</figcaption>}
          </figure>
        )}
        {!!n.categories?.length && (
          <p className="news-topics">{n.categories.join(' · ')}</p>
        )}
        <Heading id={`story-${n.id}`}>{n.title}</Heading>
        {n.credit && <p className="news-credit">{n.credit}</p>}
        {compact && n.date ? (
          <p>
            {n.summary || preview.slice(0, 220)}
            {!n.summary && preview.length > 220 ? '…' : ''}
          </p>
        ) : (
          <>
            {n.summary && <p>{n.summary}</p>}
            {n.html ? (
              <details className="news-story">
                <summary>
                  Read full update
                  <span className="visually-hidden">: {n.title}</span>
                </summary>
                <RichText html={n.html} />
              </details>
            ) : null}
          </>
        )}
        {n.link && (compact || !n.link.startsWith('/news#')) && (
          <a
            className="text-link"
            href={n.link}
            aria-label={`Read more: ${n.title}`}
          >
            Read more <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  );
}
export function Empty({ source }: { source?: string }) {
  return (
    <div className="empty-state">
      <h2>Content is currently unavailable</h2>
      <p>Please check back shortly.</p>
      {source && (
        <a className="text-link" href={source}>
          Visit the official lab page ↗
        </a>
      )}
    </div>
  );
}
