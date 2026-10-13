import type { SiteContent } from './types';
import {
  allowedImage,
  mediaPhoto,
  sections,
  text,
} from '../wordpress/adapters';
import { fieldBoolean } from '../wordpress/fields';

export const headerSections = [
  'research',
  'publications',
  'news',
  'facilities',
] as const;
export const researchHeaderUrl =
  'https://people.smu.edu/daslab/files/2026/10/3055e08e-088b-4d1e-b728-83140090e026.jpg';
export const facilitiesHeaderUrl =
  'https://people.smu.edu/daslab/files/2026/10/facilities.jpg';
export function pageHeaders(source: SiteContent) {
  return Object.fromEntries(
    headerSections.map((section) => {
      const page = source.pages.find(
        (p) => p.slug === `frontend-header-${section}`,
      );
      const fields = sections(page?.html || '');
      const asset = source.media.find((m) => m.id === page?.featuredMedia);
      const preview = mediaPhoto(asset);
      const image = preview
        ? { ...preview, url: allowedImage(asset?.url) || preview.url }
        : undefined;
      // Apply the approved replacement to the existing, unchanged setup record.
      // Any subsequent admin save takes precedence, including clearing the photo.
      const initialFacilities =
        section === 'facilities' &&
        (!page ||
          (page.id === 518 &&
            page.featuredMedia === 512 &&
            page.modified === '2026-10-13T16:28:59'));
      const facilitiesPhoto = initialFacilities
        ? { url: facilitiesHeaderUrl, width: 1916, height: 821, alt: '' }
        : undefined;
      return [
        section,
        {
          photo: page
            ? fieldBoolean(fields['photo hidden'])
              ? undefined
              : facilitiesPhoto || image
            : section === 'research'
              ? { url: researchHeaderUrl, width: 1916, height: 821, alt: '' }
              : facilitiesPhoto,
          title: text(fields['header title'] || ''),
          description: text(fields['header description'] || ''),
          lightText: text(fields['text style'] || 'White text') !== 'Navy text',
        },
      ];
    }),
  );
}
