import type { fundingSupport } from '@/lib/content/funding';
import ScientificImage from './scientific-image';

export default function FundingSupport({
  funding,
}: {
  funding: ReturnType<typeof fundingSupport>;
}) {
  const funders = funding.funders.filter((p) => p.active);
  if (!funders.length) return null;
  return (
    <section
      className="funding-section container"
      id="funding-support"
      aria-labelledby="funding-title"
    >
      <p className="eyebrow">Research support</p>
      <h2 id="funding-title">Current Funding Support</h2>
      {funding.graphic && (
        <div className="funding-original">
          <ScientificImage
            photo={{
              ...funding.graphic,
              alt: 'Funding support: NSF, ACS Petroleum Research Fund, Research Corporation for Science Advancement, Alfred P. Sloan Foundation, U.S. Department of Energy, and The Welch Foundation.',
            }}
            sizes="(max-width: 760px) 90vw, 800px"
          />
          <p className="collection-note">
            Funding acknowledgments from the group.
          </p>
        </div>
      )}
      <ul className="funding-grid">
        {funders.map((p) => (
          <li key={p.id}>
            {p.photo && (
              <div className="funding-logo">
                <ScientificImage
                  photo={{ ...p.photo, alt: p.photo.alt || `${p.name} logo` }}
                  sizes="240px"
                />
              </div>
            )}
            <h3>
              {p.link ? (
                <a href={p.link}>
                  {p.name} <span aria-hidden="true">↗</span>
                </a>
              ) : (
                p.name
              )}
            </h3>
            {p.program && <p>{p.program}</p>}
            {p.award && <p className="funding-award">Award {p.award}</p>}
            {p.description && <p>{p.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
