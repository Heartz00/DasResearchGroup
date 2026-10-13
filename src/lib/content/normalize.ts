import { load } from 'cheerio';
import { pageHeaders } from './page-headers';
import { fundingSupport } from './funding';
import {
  profileKey,
  publicationKey,
  updateKey,
  contentKey,
  photoKey,
} from '../wordpress/content-keys';
import {
  cleanHtml,
  legacyNews,
  mediaPhoto,
  people,
  photos,
  publications,
  safeUrl,
  sections,
  text,
  labeledContent,
  publicHtml,
} from '../wordpress/adapters';
import type { CmsPage, News, Publication, SiteContent } from './types';
import {
  fieldEmail,
  fieldOrder,
  fieldYear,
  fieldLink,
  fieldDoi,
  fieldBoolean,
} from '../wordpress/fields';

export function normalizeSite(source: SiteContent) {
  const page = (slug: string) => source.pages.find((p) => p.slug === slug);
  const research = page('research');
  const pi = page('pi-profile') ?? page('news');
  const home = page('frontend-home');
  const homeSections = sections(home?.html ?? '');
  const piSections = sections(pi?.html ?? '');
  const piDocument = load(pi?.html ?? '');
  const piText = piDocument('body')
    .children()
    .toArray()
    .map((node) => piDocument(node).text())
    .join(' ');
  const email = Object.hasOwn(piSections, 'email')
    ? fieldEmail(text(piSections.email))
    : fieldEmail(piText.match(/[\w.+-]+@[\w.-]+\.[a-z]+/i)?.[0] ?? '');
  const legacyPi = load(pi?.html ?? '');
  const joinText = legacyPi('p')
    .filter((_, p) =>
      /^Interested undergraduate/i.test(legacyPi(p).text().trim()),
    )
    .first()
    .text();
  const contactStart = pi?.html.indexOf('Contact:') ?? -1;
  const joinStart = pi?.html.indexOf('Interested undergraduate') ?? -1;
  let legacyContact =
    contactStart >= 0 && pi
      ? pi.html.slice(
          pi.html.lastIndexOf('<p', contactStart),
          joinStart >= 0 ? pi.html.lastIndexOf('<p', joinStart) : undefined,
        )
      : '';
  if (legacyContact) {
    const contact = load(legacyContact, null, false);
    for (const label of ['Email', 'Office'])
      if (Object.hasOwn(piSections, label.toLowerCase()))
        contact('p')
          .filter((_, p) =>
            new RegExp(`^${label}:`, 'i').test(contact(p).text().trim()),
          )
          .text(`${label}: ${text(piSections[label.toLowerCase()])}`);
    if (Object.hasOwn(piSections, 'mailing address')) {
      const marker = contact('p')
        .filter((_, p) => /^Mailing Address:/i.test(contact(p).text().trim()))
        .first();
      let node = marker.next();
      while (node.length && !/^(Office:|https?:)/i.test(node.text().trim())) {
        const next = node.next();
        node.remove();
        node = next;
      }
      marker.after(cleanHtml(piSections['mailing address']));
    }
    legacyContact = contact.html();
  }
  const homeValue = (key: string, fallback: string) =>
    text(homeSections[key] ?? '') || fallback;
  const cmsLink = (key: string, fallback: string) => {
    const value = text(homeSections[key] ?? '');
    return /^\/(?!\/)[\w/#-]*$/.test(value)
      ? value
      : (safeUrl(value) ?? fallback);
  };
  const children = (parent?: CmsPage) =>
    source.pages
      .filter((p) => parent && p.parent === parent.id)
      .sort(
        (a, b) =>
          fieldOrder(sections(a.html)['display order']) -
            fieldOrder(sections(b.html)['display order']) || a.id - b.id,
      );
  let roster =
    homeValue('people source', 'legacy') === 'pages' &&
    !children(page('people')).length
      ? []
      : people(
          page('people'),
          source.media,
          homeValue('people source', 'legacy') === 'pages'
            ? children(page('people'))
            : [],
        );
  const categoryId = (slug: string) =>
    source.categories.find((c) => c.slug === slug)?.id;
  const featuredId = source.tags.find((t) => t.slug === 'featured')?.id;
  const newsCategory = categoryId('news');
  const publicationCategory = categoryId('publications');
  const news: News[] = source.posts
    .filter((p) => newsCategory && p.categories.includes(newsCategory))
    .map((p) => ({
      id: String(p.id),
      title: text(p.title),
      html:
        Object.hasOwn(sections(p.html), 'full story') ||
        fieldBoolean(sections(p.html)['managed update'])
          ? publicHtml(sections(p.html)['full story'] ?? '') +
            (['Related People', 'Related Publication'].some((label) =>
              text(sections(p.html)[label.toLowerCase()] ?? ''),
            )
              ? labeledContent(p.html, [
                  'Related People',
                  'Related Publication',
                ])
              : '')
          : publicHtml(p.html),
      date:
        (/^\d{4}-\d{2}-\d{2}$/.test(
          text(sections(p.html)['event date'] ?? ''),
        ) &&
        Number.isFinite(Date.parse(text(sections(p.html)['event date'] ?? '')))
          ? text(sections(p.html)['event date'] ?? '')
          : '') ||
        (text(sections(p.html)['legacy source'] ?? '') ? undefined : p.date),
      link:
        fieldLink(sections(p.html)['external link']) ?? `/news#story-${p.id}`,
      photo: (() => {
        if (fieldBoolean(sections(p.html)['photo hidden'])) return undefined;
        const photo = mediaPhoto(
          source.media.find((m) => m.id === p.featuredMedia),
        );
        return photo
          ? {
              ...photo,
              caption:
                text(sections(p.html)['photo caption'] || '') || photo.caption,
            }
          : undefined;
      })(),
      featured: featuredId !== undefined && p.tags.includes(featuredId),
      credit: text(sections(p.html)['author / credit'] || '') || undefined,
      summary: text(
        sections(p.html).summary ??
          (fieldBoolean(sections(p.html)['managed update']) ? '' : p.excerpt) ??
          '',
      ),
      categories: [
        ...new Set(
          [
            text(sections(p.html)['update type'] || ''),
            ...source.categories
              .filter((c) => p.categories.includes(c.id) && c.slug !== 'news')
              .map((c) => c.name),
          ].filter(Boolean),
        ),
      ],
    }));
  const structuredPublications: Publication[] = source.posts
    .filter(
      (p) => publicationCategory && p.categories.includes(publicationCategory),
    )
    .map((p) => {
      const s = sections(p.html);
      const year = fieldYear(s.year);
      const doi = fieldDoi(s.doi);
      const status = text(s.status ?? '') || 'Publication';
      return {
        id: String(p.id),
        title: text(p.title),
        year,
        html:
          !text(s.authors ?? '') &&
          !text(s.journal ?? '') &&
          s['original citation']
            ? cleanHtml(s['original citation'])
            : labeledContent(p.html, [
                'Authors',
                'Journal',
                'Volume',
                'Issue',
                'Pages',
                'Abstract',
                'Short Summary',
                'Research Category',
              ]),
        doi,
        link:
          safeUrl(text(s.link ?? '')) ??
          (doi && /^10\.\S+$/.test(doi)
            ? safeUrl(`https://doi.org/${doi}`)
            : undefined),
        photo: mediaPhoto(source.media.find((m) => m.id === p.featuredMedia)),
        prior: /prior/i.test(text(s.affiliation ?? '')),
        status,
        featured: featuredId !== undefined && p.tags.includes(featuredId),
        order: fieldOrder(s['display order']),
        type: text(s['publication type'] ?? '') || undefined,
      };
    })
    .sort(
      (a, b) =>
        (b.year ?? 0) - (a.year ?? 0) ||
        a.order - b.order ||
        Number(b.id) - Number(a.id),
    );
  let pubs =
    homeValue('publication source', 'legacy') === 'posts'
      ? structuredPublications
      : publications(page('publications'), source.media);
  if (homeValue('people source', 'legacy') !== 'pages') {
    const managed = children(page('people')).filter((p) =>
      fieldBoolean(sections(p.html)['managed profile']),
    );
    const overlays = people(undefined, source.media, managed);
    const legacyKeys = managed.map((p) =>
      contentKey(sections(p.html)['legacy source'] ?? ''),
    );
    roster = roster.map((person) => {
      const i = legacyKeys.indexOf(profileKey(person));
      const overlay =
        i >= 0
          ? overlays.find((p) => p.id === String(managed[i].id))
          : undefined;
      return overlay
        ? {
            ...overlay,
            photo: fieldBoolean(sections(managed[i].html)['photo hidden'])
              ? undefined
              : overlay.photo || person.photo,
          }
        : person;
    });
    roster.push(
      ...overlays.filter(
        (p) =>
          !legacyKeys[
            managed.findIndex((record) => String(record.id) === p.id)
          ],
      ),
    );
  }
  if (homeValue('publication source', 'legacy') !== 'posts') {
    const managed = source.posts.filter((p) =>
      fieldBoolean(sections(p.html)['managed publication']),
    );
    const overlayKeys = new Map(
      managed.map((p) => [
        String(p.id),
        contentKey(sections(p.html)['legacy source'] ?? ''),
      ]),
    );
    pubs = pubs.map((paper) => {
      const overlay = structuredPublications.find(
        (p) => overlayKeys.get(p.id) === publicationKey(paper),
      );
      return overlay
        ? {
            ...overlay,
            photo: fieldBoolean(
              sections(
                source.posts.find((p) => String(p.id) === overlay.id)?.html ||
                  '',
              )['photo hidden'],
            )
              ? undefined
              : overlay.photo || paper.photo,
          }
        : paper;
    });
    pubs.push(
      ...structuredPublications.filter(
        (p) => overlayKeys.has(p.id) && !overlayKeys.get(p.id),
      ),
    );
    pubs.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  }
  const legacyUpdates = legacyNews(page('group-news'));
  const mergedUpdates = legacyUpdates.map(
    (update) =>
      news.find((n) => {
        const p = source.posts.find((p) => String(p.id) === n.id);
        return (
          p &&
          fieldBoolean(sections(p.html)['managed update']) &&
          contentKey(sections(p.html)['legacy source'] ?? '') ===
            updateKey(update)
        );
      }) || update,
  );
  const matchedUpdateIds = new Set(
    mergedUpdates.filter((n) => !n.id.startsWith('archive-')).map((n) => n.id),
  );
  const publicNews = [
    ...news.filter(
      (n) =>
        !matchedUpdateIds.has(n.id) &&
        !text(
          sections(source.posts.find((p) => String(p.id) === n.id)?.html ?? '')[
            'legacy source'
          ] ?? '',
        ),
    ),
    ...mergedUpdates,
  ];
  const legacyGallery = photos(page('lab-photos')?.html ?? '', source.media);
  const legacyInstrumentPhotos = photos(
    page('instruments-2')?.html ?? '',
    source.media,
  );
  const instrumentRecords = children(page('instruments-2'));
  const galleryRecords = children(page('lab-photos'));
  const galleryPhoto = (
    p: CmsPage,
    fallback?: (typeof legacyGallery)[number],
  ) => {
    const s = sections(p.html);
    if (fieldBoolean(s['photo hidden'])) return undefined;
    const image =
      mediaPhoto(source.media.find((m) => m.id === p.featuredMedia)) ??
      photos(p.html, source.media)[0] ??
      fallback;
    return image
      ? {
          ...image,
          caption: [
            Object.hasOwn(s, 'caption') ? text(s.caption) : image.caption,
            text(s.event ?? ''),
            text(s.category ?? ''),
            text(s.date ?? ''),
            text(s.photographer ?? ''),
          ]
            .filter(Boolean)
            .join(' · '),
        }
      : undefined;
  };
  const gallery = [
    ...legacyGallery.flatMap((image) => {
      const edited = galleryRecords.find((p) => {
        const key = contentKey(sections(p.html)['legacy source'] ?? '');
        return key
          ? key === photoKey(image)
          : mediaPhoto(source.media.find((m) => m.id === p.featuredMedia))
              ?.url === image.url;
      });
      const result = edited ? galleryPhoto(edited, image) : image;
      return result ? [result] : [];
    }),
    ...galleryRecords
      .filter((p) => !text(sections(p.html)['legacy source'] ?? ''))
      .flatMap((p) => {
        const image = galleryPhoto(p);
        return image ? [image] : [];
      }),
  ].filter((p, i, all) => all.findIndex((other) => other.url === p.url) === i);
  const researchSections = sections(research?.html ?? '');
  const researchChildren = children(research).filter(
    (p) => !fieldBoolean(sections(p.html)['managed funder']),
  );
  const footer = page('frontend-footer');
  const footerSections = sections(footer?.html ?? '');
  const contact = page('frontend-contact');
  const contactSections = sections(contact?.html ?? '');
  const join = page('join-the-lab');
  const joinSections = sections(join?.html ?? '');
  const joinKeys = [
    'Prospective PhD Students',
    'Undergraduate Researchers',
    'Postdoctoral Researchers',
    'Visiting Researchers',
    'Collaborators',
  ];
  const joinPaths = joinKeys
    .map((title) => ({
      title,
      html: cleanHtml(joinSections[title.toLowerCase()] ?? ''),
    }))
    .filter((p) => text(p.html));
  const biography = load(publicHtml(pi?.html ?? ''), null, false);
  const contactMarker = biography('p')
    .filter((_, p) => /^Contact:$/i.test(biography(p).text().trim()))
    .first();
  if (contactMarker.length) {
    contactMarker.nextAll().remove();
    contactMarker.remove();
  }
  if (!Object.hasOwn(piSections, 'biography')) {
    const marker = biography('h2').first();
    if (marker.length) {
      marker.nextAll().remove();
      marker.remove();
    }
  }
  biography('p')
    .filter((_, p) => !biography(p).text().trim())
    .remove();
  const piName = text(piSections.name ?? '') || 'Anindita (Dia) Das';
  // Until child pages are added, the source's first two paragraphs supply the introduction.
  const introParagraphs =
    (research?.html ?? '').match(/<p\b[^>]*>[\s\S]*?<\/p>/gi)?.slice(0, 2) ??
    [];
  const researchText = text(research?.html ?? '');
  const focus = [
    {
      title: 'Coinage metal clusters',
      phrase: researchText.match(/we focus on coinage metal clusters/i)?.[0],
    },
    {
      title: 'MOFs & COFs',
      phrase: researchText.match(
        /study their interactions with other kinds[\s\S]*?multifunctional hybrid nanomaterials/i,
      )?.[0],
    },
    {
      title: 'Catalysis & biology',
      phrase: researchText.match(
        /for applications in catalysis and biology/i,
      )?.[0],
    },
  ].filter((f): f is { title: string; phrase: string } => !!f.phrase);
  return {
    ...source,
    pageHeaders: pageHeaders(source),
    funding: fundingSupport(research, source.pages, source.media),
    page,
    roster,
    featuredPeople: roster.filter((p) => !p.alumni && p.featured),
    publications: pubs,
    news: publicNews,
    featuredNews: publicNews.filter((n) => n.featured),
    focus,
    research,
    researchHtml: publicHtml(researchSections.overview ?? research?.html ?? ''),
    researchIntro: cleanHtml(introParagraphs.join('')),
    areas: researchChildren.map((p) => ({
      ...p,
      photo: fieldBoolean(sections(p.html)['photo hidden'])
        ? undefined
        : mediaPhoto(source.media.find((m) => m.id === p.featuredMedia)),
      summary: text(sections(p.html).summary ?? p.html).slice(0, 250),
      featured: fieldBoolean(sections(p.html)['featured on homepage']),
      html: labeledContent(p.html, [
        'Scientific question',
        'Approach',
        'Full Description',
        'Methods / Techniques',
        'Why it matters',
        'Related Publications',
      ]),
      images: photos(p.html, source.media).filter(
        (image) =>
          image.url !==
          mediaPhoto(source.media.find((m) => m.id === p.featuredMedia))?.url,
      ),
    })),
    researchSections,
    researchPhoto: fieldBoolean(researchSections['photo hidden'])
      ? undefined
      : mediaPhoto(source.media.find((m) => m.id === research?.featuredMedia)),
    heroPhoto: fieldBoolean(homeSections['photo hidden'])
      ? undefined
      : (mediaPhoto(source.media.find((m) => m.id === home?.featuredMedia)) ??
        (fieldBoolean(researchSections['photo hidden'])
          ? undefined
          : mediaPhoto(
              source.media.find((m) => m.id === research?.featuredMedia),
            ))),
    legacyGallery,
    gallery,
    peopleHeaderPhoto: (() => {
      const selected = galleryRecords
        .filter((p) => fieldBoolean(sections(p.html)['people header']))
        .sort((a, b) => b.modified.localeCompare(a.modified) || b.id - a.id)[0];
      return selected
        ? galleryPhoto(
            selected,
            legacyGallery.find(
              (image) =>
                photoKey(image) ===
                contentKey(sections(selected.html)['legacy source'] ?? ''),
            ),
          )
        : (() => {
            const original = legacyGallery.find((image) =>
              /\/IMG_5076(?:-\d+x\d+)?\.jpeg(?:\?|$)/i.test(image.url),
            );
            const settings =
              original &&
              galleryRecords.find(
                (p) =>
                  contentKey(sections(p.html)['legacy source'] ?? '') ===
                  photoKey(original),
              );
            if (
              settings &&
              /^no$/i.test(text(sections(settings.html)['people header'] ?? ''))
            )
              return undefined;
            return gallery.find((image) =>
              /\/IMG_5076(?:-\d+x\d+)?\.jpeg(?:\?|$)/i.test(image.url),
            );
          })();
    })(),
    legacyInstrumentPhotos,
    instruments: instrumentRecords.map((p) => ({
      ...p,
      displayName: text(p.title),
      manufacturer: text(sections(p.html)['manufacturer'] || ''),
      model: text(sections(p.html)['model'] || ''),
      purpose: text(sections(p.html)['purpose'] || ''),
      ownership: text(sections(p.html)['shared / lab-owned status'] || ''),
      searchText: text(p.html),
      photo: fieldBoolean(sections(p.html)['photo hidden'])
        ? undefined
        : (mediaPhoto(source.media.find((m) => m.id === p.featuredMedia)) ??
          legacyInstrumentPhotos.find(
            (image) =>
              photoKey(image) ===
              contentKey(sections(p.html)['legacy source'] ?? ''),
          )),
      html: labeledContent(p.html, [
        'Manufacturer',
        'Model',
        'Purpose',
        'Capabilities',
        'Related Research Areas',
        'Location',
        'Shared / Lab-Owned Status',
        'External Facility Link',
      ]),
      facilityUrl: fieldLink(sections(p.html)['external facility link']),
    })),
    instrumentPhotos: legacyInstrumentPhotos.filter(
      (image) =>
        !instrumentRecords.some(
          (p) =>
            contentKey(sections(p.html)['legacy source'] ?? '') ===
            photoKey(image),
        ),
    ),
    pi,
    piName,
    piOffice: Object.hasOwn(piSections, 'office')
      ? text(piSections.office)
      : piText
          .match(/Office:\s*(.+?)(?:https?:|Interested undergraduate|$)/i)?.[1]
          ?.trim() || '',
    piTitle: text(piSections.title ?? '') || 'Principal investigator',
    piBiography: Object.hasOwn(piSections, 'biography')
      ? cleanHtml(piSections.biography)
      : biography.html(),
    piDetails: [
      'Education',
      'Academic Appointments',
      'Research Interests',
      'Awards and Honors',
      'Selected Publications',
      'Professional Memberships',
    ]
      .map((title) => ({
        title,
        html: cleanHtml(piSections[title.toLowerCase()] ?? ''),
      }))
      .filter((s) => text(s.html)),
    piLinks: [
      'Google Scholar',
      'ORCID',
      'LinkedIn',
      'Personal Website',
      'Institutional Profile',
      'CV',
    ]
      .map((label) => ({
        label,
        href: fieldLink(piSections[label.toLowerCase()]),
      }))
      .filter((l): l is { label: string; href: string } => !!l.href),
    piHtml: publicHtml(pi?.html ?? ''),
    piPhoto: fieldBoolean(piSections['photo hidden'])
      ? undefined
      : (mediaPhoto(source.media.find((m) => m.id === pi?.featuredMedia)) ??
        photos(pi?.html ?? '', source.media)[0]),
    email,
    contactHtml: publicHtml(
      contact?.html ??
        (legacyContact ||
          labeledContent(pi?.html ?? '', [
            'Email',
            'Office',
            'Mailing Address',
          ])),
    ),
    contactEmail: Object.hasOwn(contactSections, 'email')
      ? fieldEmail(text(contactSections.email))
      : email,
    contactName:
      text(contactSections['lab name'] ?? '') || 'Das Research Group',
    contactPi: text(contactSections['pi name'] ?? '') || piName,
    contactDepartment: Object.hasOwn(contactSections, 'department')
      ? text(contactSections.department)
      : 'Department of Chemistry',
    contactUniversity: Object.hasOwn(contactSections, 'university')
      ? text(contactSections.university)
      : 'Southern Methodist University',
    contactDepartmentUrl:
      fieldLink(contactSections['department url']) ||
      'https://www.smu.edu/dedman/academics/departments/chemistry',
    mapUrl: fieldLink(contactSections['map url']),
    joinHtml: publicHtml(
      page('join-the-lab')?.html ?? (joinText ? `<p>${joinText}</p>` : ''),
    ),
    joinPaths,
    joinStructured: joinKeys.some((key) =>
      Object.hasOwn(joinSections, key.toLowerCase()),
    ),
    joinIntro: cleanHtml(joinSections.intro ?? ''),
    joinInstructions: cleanHtml(joinSections['contact instructions'] ?? ''),
    openPositions: cleanHtml(joinSections['open positions notice'] ?? ''),
    admissionsUrl: fieldLink(joinSections['graduate admissions url']),
    departmentUrl: fieldLink(joinSections['department url']),
    teaching:
      (page('contact') ?? page('teaching'))
        ? {
            ...(page('contact') ?? page('teaching'))!,
            html:
              sections((page('contact') ?? page('teaching'))!.html).courses ??
              (page('contact') ?? page('teaching'))!.html,
          }
        : undefined,
    heroTitle: homeValue(
      'hero title',
      'Synthetic nanoscience with atomic precision.',
    ),
    heroSubtitle: homeValue(
      'hero subtitle',
      'Das Research Group · SMU Chemistry',
    ),
    heroDescription: homeValue(
      'hero description',
      research
        ? 'Atomically precise nanomaterials for catalysis, biology, and advanced materials research.'
        : '',
    ),
    primaryLabel: homeValue('primary cta', 'Explore our research'),
    primaryHref: cmsLink('primary link', '/research'),
    secondaryLabel: homeValue('secondary cta', 'Meet the group'),
    secondaryHref: cmsLink('secondary link', '/people'),
    footerHtml: cleanHtml(homeSections.footer ?? ''),
    footerSettings: footer
      ? {
          name: text(footerSections['lab name'] ?? ''),
          affiliation: [
            text(footerSections.department ?? ''),
            text(footerSections.university ?? ''),
          ].filter(Boolean),
          address: cleanHtml(footerSections.address ?? ''),
          email: fieldEmail(text(footerSections['contact email'] ?? '')),
          links:
            cleanHtml(footerSections['social / professional links'] ?? '') +
            cleanHtml(footerSections['institutional links'] ?? ''),
          copyright: text(footerSections['copyright text'] ?? ''),
        }
      : undefined,
    joinCtaTitle: homeValue(
      'join us cta title',
      'Explore your next research question with us.',
    ),
    joinCtaHtml: cleanHtml(
      homeSections['join us cta description'] ??
        (joinSections.intro ||
          (join ? '' : joinText ? `<p>${joinText}</p>` : '')),
    ),
    joinCtaLabel: homeValue('join us cta button', 'Join the lab'),
    joinCtaHref: cmsLink('join us cta link', '/join'),
    heroEyebrow: homeValue('hero eyebrow', ''),
    stats: cleanHtml(homeSections.statistics ?? ''),
    atomicHtml: cleanHtml(homeSections['atomic scale'] ?? ''),
  };
}
