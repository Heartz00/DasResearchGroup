import type { normalizeSite } from '../content/normalize';
import { contentValues } from './content-values';
import { text, safeUrl } from '../wordpress/adapters';

// Seed missing settings from the same WordPress snapshot used by the website.
// Saved fields (including deliberately empty fields) always take precedence.
export function contentDefaults(
  area: string,
  site: ReturnType<typeof normalizeSite>,
): Record<string, string> {
  const pi = contentValues('profile', site.pi?.html || '');
  if (area === 'contact')
    return {
      'Lab Name': site.contactName,
      'PI Name': site.contactPi,
      Department: 'Department of Chemistry',
      University: 'Southern Methodist University',
      Email: site.contactEmail || '',
      'Mailing Address': pi['Mailing Address'] || '',
      Building: (pi.Office || '').split(/\s+Rm\s*/i)[0],
      Room: (pi.Office || '').match(/\s+Rm\s*(.+)$/i)?.[1] || '',
      'Department URL': site.contactDepartmentUrl,
      'Map URL': site.mapUrl || '',
    };
  if (area === 'footer') {
    const links = [...site.piHtml.matchAll(/<a\b[^>]*href="([^"]+)"/g)]
      .map((match) => safeUrl(match[1].replaceAll('&amp;', '&')))
      .filter(
        (url): url is string =>
          !!url && /linkedin|twitter|x\.com|orcid|scholar\.google/i.test(url),
      );
    return {
      'Lab Name': 'Das Research Group',
      Department: 'Department of Chemistry',
      University: 'Southern Methodist University',
      Address: '',
      'Contact Email': site.email || '',
      'Social / Professional Links': [...new Set(links)].join('\n'),
      'Institutional Links': [
        'https://people.smu.edu/daslab/',
        'https://www.smu.edu/',
        'https://grad.smu.edu/graduate-studies-in-chemistry',
      ].join('\n'),
      'Copyright Text': 'Das Research Group · SMU Chemistry',
    };
  }
  if (area === 'join')
    return {
      'Prospective PhD Students':
        'Explore the group’s research and contact Prof. Das about your interests. Consult SMU for current program and application information.',
      'Undergraduate Researchers':
        'Contact Prof. Das to ask about possible research opportunities and how your interests connect with the group’s work.',
      'Postdoctoral Researchers':
        'Contact Prof. Das with your research background to discuss possible opportunities.',
      'Visiting Researchers':
        'Contact the group to ask about a potential visit or research exchange.',
      Collaborators:
        'Review the research themes and publications, then contact Prof. Das to discuss a potential scientific collaboration.',
      Intro: text(site.joinHtml),
      'Contact Instructions': text(site.joinInstructions),
      'Graduate Admissions URL':
        site.admissionsUrl ||
        'https://www.smu.edu/dedman/academics/departments/chemistry/graduate',
      'Department URL': site.departmentUrl || '',
      ...Object.fromEntries(
        site.joinPaths.map((path) => [path.title, text(path.html)]),
      ),
    };
  return {};
}
