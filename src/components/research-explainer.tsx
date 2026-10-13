import Link from 'next/link';

type Focus = { title: string; phrase: string };

// Paraphrases of the existing Research page, shown only for source-backed themes.
const explanations: Record<string, string> = {
  'Coinage metal clusters':
    'Build atomically precise metal clusters and study how their structures relate to their properties.',
  'MOFs & COFs':
    'Study how metal clusters interact with MOFs and COFs to create multifunctional hybrid nanomaterials.',
  'Catalysis & biology':
    'Explore applications of these materials in catalysis and biology, with sustainable energy and human health as broader motivations.',
};

export function researchSummary(focus: Focus) {
  return explanations[focus.title] ?? focus.phrase;
}
const details: Record<
  string,
  { question: string; approach: string; importance: string }
> = {
  'Coinage metal clusters': {
    question:
      'How does a precisely defined atomic structure relate to material properties?',
    approach:
      'Use synthetic inorganic chemistry to create highly precise structures at the nanometer scale.',
    importance:
      'Precise structures support an atomic-level understanding of structure–property relationships.',
  },
  'MOFs & COFs': {
    question:
      'How do metal clusters interact with other atomically precise materials?',
    approach:
      'Study interactions with MOFs and COFs to design multifunctional hybrid nanomaterials.',
    importance:
      'Combining these materials connects defined structures with multifunctional properties.',
  },
  'Catalysis & biology': {
    question:
      'How can atomically precise materials be used in catalysis and biology?',
    approach:
      'Explore catalytic and biological applications of metal clusters and hybrid nanomaterials.',
    importance:
      'Sustainable energy and human health motivate the research; specific outcomes are described in the group’s papers.',
  },
};
const anchor = (title: string) =>
  `theme-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-$/, '')}`;

export default function ResearchExplainer({ focus }: { focus: Focus[] }) {
  if (!focus.length) return null;
  return (
    <section
      className="research-explainer"
      aria-labelledby="research-at-a-glance"
    >
      <div>
        <p className="eyebrow">What we study</p>
        <h2 id="research-at-a-glance">Our research at a glance.</h2>
        <p className="muted">
          Connecting precise structures with useful material properties.
        </p>
        <nav className="theme-navigation" aria-label="Research themes">
          {focus.map((theme) => (
            <a key={theme.title} href={`#${anchor(theme.title)}`}>
              {theme.title}
            </a>
          ))}
        </nav>
      </div>
      <div className="research-explanations">
        {focus.map((theme, index) => (
          <article key={theme.title} id={anchor(theme.title)}>
            <p className="research-theme-number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h3>{theme.title}</h3>
            <p>{researchSummary(theme)}</p>
            {details[theme.title] && (
              <details className="research-theme-detail">
                <summary>Question, approach & significance</summary>
                <dl className="theme-details">
                  <dt>Scientific question</dt>
                  <dd>{details[theme.title].question}</dd>
                  <dt>Approach</dt>
                  <dd>{details[theme.title].approach}</dd>
                  <dt>Why it matters</dt>
                  <dd>{details[theme.title].importance}</dd>
                </dl>
              </details>
            )}
          </article>
        ))}
        <Link className="text-link" href="/publications">
          Read the group’s publications <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
