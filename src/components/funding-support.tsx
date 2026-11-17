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
