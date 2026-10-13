'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin, sameOrigin } from '@/lib/admin/auth';
import { managedData } from '@/lib/admin/content-data';
import { contentModel, hasPhoto } from '@/lib/admin/content-model';
import {
  contentValues,
  updateContentFields,
  profileKey,
  publicationKey,
  updateKey,
} from '@/lib/admin/content-values';
import { wp } from '@/lib/admin/wordpress';
import {
  imageType,
  recordId,
  rawTitle,
  type WPRecord,
} from '@/lib/admin/records';
import { text, sections } from '@/lib/wordpress/adapters';
import { photoKey } from '@/lib/wordpress/content-keys';
export async function saveContent(
  _: { error?: string },
  form: FormData,
): Promise<{ error?: string }> {
  const { session, user } = await requireAdmin();
  let destination = '/admin';
  try {
    await sameOrigin();
    const area = String(form.get('area') || '');
    const model = contentModel(area);
    if (
      !user.capabilities[model.kind === 'pages' ? 'edit_pages' : 'edit_posts']
    )
      throw new Error(
        'Your account cannot edit this content. Ask the website manager for access.',
      );
    const data = await managedData(area, session, user.capabilities);
    const item = String(form.get('item') || 'new');
    if (
      item !== 'new' &&
      item !== 'overview' &&
      !/^(?:\d+|legacy-\d+|archive-\d+)$/.test(item)
    )
      throw new Error('Choose an existing item or add a new one.');
    const existing =
      item === 'overview' && area === 'research'
        ? data.parent
        : /^\d+$/.test(item)
          ? data.records.find((r) => r.id === recordId(item))
          : undefined;
    if (/^\d+$/.test(item) && !existing)
      throw new Error('This item does not belong to this section.');
    if (
      existing?.modified_gmt !== undefined &&
      existing.modified_gmt !== String(form.get('modified') || '')
    )
      throw new Error(
        'Someone updated this item while you were editing. Your changes are still here; reload in another tab to compare.',
      );
    if (existing?.status === 'future')
      throw new Error(
        'This item has a scheduled publication. Its schedule must be reviewed before changing it here.',
      );
    let original = existing?.content?.raw || '';
    let originalTitle = existing ? rawTitle(existing) : model.label;
    let originalPhoto =
      existing?.featured_media ||
      (hasPhoto(area)
        ? Number(existing?.content?.raw?.match(/wp-image-(\d+)/)?.[1])
        : 0) ||
      0;
    const metadata: Record<string, string> = {};
    if (model.parent && !data.parent)
      throw new Error(
        'This section needs its initial setup. Ask the website manager; no changes were saved.',
      );
    if (model.single && !existing) {
      const fallback = data.pages.find(
        (p) => p.slug === (model.fallback || model.slug),
      );
      if (fallback) {
        original = fallback.content?.raw || '';
        originalPhoto =
          fallback.featured_media ||
          (hasPhoto(area)
            ? Number(fallback.content?.raw?.match(/wp-image-(\d+)/)?.[1])
            : 0) ||
          0;
      }
    }
    if (item.startsWith('legacy-') || item.startsWith('archive-')) {
      if (area === 'people') {
        const person = data.site.roster.find((p) => p.id === item);
        if (!person)
          throw new Error('This member has changed. Reload the list.');
        metadata['Legacy Source'] = profileKey(person);
        originalTitle = person.name;
        originalPhoto =
          data.media.find(
            (m) =>
              m.source_url === person.photo?.url ||
              m.media_details?.sizes?.large?.source_url === person.photo?.url,
          )?.id || 0;
      } else if (area === 'publications') {
        const paper = data.site.publications.find((p) => p.id === item);
        if (!paper)
          throw new Error('This publication has changed. Reload the list.');
        metadata['Legacy Source'] = publicationKey(paper);
        originalTitle = paper.title;
        original = `<h2>Original Citation</h2>${paper.html}`;
      } else if (area === 'photos' || area === 'facilities') {
        const images =
          area === 'photos'
            ? data.site.legacyGallery
            : data.site.legacyInstrumentPhotos;
        const photo = images[Number(item.slice(7))];
        if (!photo)
          throw new Error('This photograph has changed. Reload the list.');
        metadata['Legacy Source'] = photoKey(photo);
        originalTitle = photo.caption || 'Lab photograph';
        originalPhoto =
          data.media.find(
            (m) =>
              m.source_url === photo.url ||
              m.media_details?.sizes?.large?.source_url === photo.url,
          )?.id || 0;
      } else if (area === 'funding') {
        const funder = data.site.funding.funders.find((p) => p.id === item);
        if (!funder)
          throw new Error('This funder has changed. Reload the list.');
        metadata['Legacy Source'] = funder.sourceKey;
        metadata['Funding Key'] = funder.sourceKey;
        originalTitle = funder.name;
      } else if (area === 'updates') {
        const update = data.site.news.find((n) => n.id === item);
        if (!update)
          throw new Error('This update has changed. Reload the list.');
        metadata['Legacy Source'] = updateKey(update);
        originalTitle = update.title;
      } else throw new Error('Unknown item.');
      if (metadata['Legacy Source'] !== String(form.get('sourceKey') || ''))
        throw new Error(
          'This item changed since you opened it. Keep your text and reload the list to compare.',
        );
    }
    if (area === 'people') metadata['Managed Profile'] = 'Yes';
    if (area === 'publications') metadata['Managed Publication'] = 'Yes';
    if (area === 'updates') metadata['Managed Update'] = 'Yes';
    if (area === 'funding') {
      metadata['Managed Funder'] = 'Yes';
      const key = text(
        sections(existing?.content?.raw || '')['funding key'] || '',
      );
      if (key) metadata['Funding Key'] = key;
    }
    if (existing) {
      const stored = sections(existing.content?.raw || '');
      if (stored['legacy source'])
        metadata['Legacy Source'] = text(stored['legacy source']);
    }
    const values = Object.fromEntries(
      model.fields.map((f) => [
        f.label,
        String(form.get(f.label) || '').trim(),
      ]),
    );
    if (model.single && area === 'profile' && !values.Name)
      throw new Error('Enter the PI name.');
    const title = (
      model.single || item === 'overview'
        ? area === 'profile'
          ? values.Name
          : originalTitle
        : String(form.get('title') ?? '')
    ).trim();
    if (!title || title.length > 500) throw new Error('Enter a name or title.');
    const status = String(form.get('status') || 'draft');
    if (!['draft', 'pending', 'publish'].includes(status))
      throw new Error('Choose Draft, Review or Published.');
    if (
      status === 'publish' &&
      !user.capabilities[
        model.kind === 'pages' ? 'publish_pages' : 'publish_posts'
      ]
    )
      throw new Error(
        'Your account can submit a draft for review, but cannot publish it.',
      );
    const chosenPhoto = hasPhoto(area)
      ? recordId(String(form.get('photo') || originalPhoto), true)
      : originalPhoto;
    if (hasPhoto(area))
      metadata['Photo Hidden'] = area.endsWith('-header')
        ? chosenPhoto === 0
          ? 'Yes'
          : 'No'
        : chosenPhoto === 0 && originalPhoto > 0
          ? 'Yes'
          : chosenPhoto > 0
            ? 'No'
            : text(sections(original)['photo hidden'] ?? '') || 'No';
    updateContentFields(area, original, values, metadata);
    let image = chosenPhoto;
    const upload = form.get('upload');
    if (!hasPhoto(area) && upload instanceof File && upload.size)
      throw new Error('This section does not use a photo.');
    if (upload instanceof File && upload.size) {
      if (!user.capabilities.upload_files)
        throw new Error('Your account cannot upload photos.');
      if (upload.size > 3 * 1024 * 1024)
        throw new Error('Choose a JPEG, PNG or WebP image under 3 MB.');
      const alt = String(form.get('photoAlt') || '').trim();
      if (!alt) throw new Error('Describe the photo before uploading it.');
      const bytes = new Uint8Array(await upload.arrayBuffer());
      const type = imageType(bytes);
      const payload = new FormData();
      payload.append(
        'file',
        new Blob([bytes], { type: type.mime }),
        `lab-photo-${Date.now()}.${type.extension}`,
      );
      payload.append('alt_text', alt);
      image = (
        await wp<WPRecord>('media', session, { method: 'POST', body: payload })
      ).data.id;
    }
    if (
      image &&
      image !== originalPhoto &&
      !data.media.some((m) => m.id === image) &&
      !(upload instanceof File && upload.size)
    )
      throw new Error('Choose a photo from the library.');
    const categoryIds = existing?.categories || [];
    const tagIds = existing?.tags || [];
    const ensureTerm = async (
      kind: 'categories' | 'tags',
      slug: string,
      name: string,
    ) => {
      const known = data[kind].find((term) => term.slug === slug);
      if (known) return known.id;
      if (!user.capabilities.manage_categories)
        throw new Error(
          'Ask the website manager to finish the one-time publishing setup. Your typed changes have not been published.',
        );
      return (
        await wp<WPRecord>(kind, session, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, slug }),
        })
      ).data.id;
    };
    if (model.category) {
      const category = await ensureTerm(
        'categories',
        model.category,
        model.label,
      );
      if (!categoryIds.includes(category)) categoryIds.push(category);
    }
    const featured = data.tags.find((t) => t.slug === 'featured');
    let tags = tagIds.filter((id) => id !== featured?.id);
    if (model.kind === 'posts' && form.get('featured') === 'on')
      tags = [...tags, await ensureTerm('tags', 'featured', 'Featured')];
    if (upload instanceof File && upload.size) metadata['Photo Hidden'] = 'No';
    const content = updateContentFields(area, original, values, metadata);
    const body = {
      title,
      content,
      status,
      featured_media: image,
      ...(model.kind === 'pages'
        ? {
            parent: existing?.parent || data.parent?.id || 0,
            ...(model.slug ? { slug: model.slug } : {}),
          }
        : { categories: categoryIds, tags }),
    };
    const saved = (
      await wp<WPRecord>(
        `${model.kind}${existing ? `/${existing.id}` : ''}`,
        session,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      )
    ).data;
    if (!saved.id)
      throw new Error('The content service did not confirm the saved item.');
    revalidatePath('/', 'layout');
    destination = `/admin/manage/${area}?item=${item === 'overview' ? 'overview' : saved.id}&saved=1`;
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Could not save your changes. Try again.',
    };
  }
  redirect(destination);
}

export async function restoreContent(
  _: { error?: string },
  form: FormData,
): Promise<{ error?: string }> {
  const { session, user } = await requireAdmin();
  let destination = '/admin';
  try {
    await sameOrigin();
    const area = String(form.get('area'));
    const data = await managedData(area, session, user.capabilities);
    const model = contentModel(area);
    const item = String(form.get('item'));
    const current =
      item === 'overview' && area === 'research'
        ? data.parent
        : data.records.find((r) => String(r.id) === item);
    if (
      !current ||
      !user.capabilities[model.kind === 'pages' ? 'edit_pages' : 'edit_posts']
    )
      throw new Error('You cannot restore this item.');
    if (current.modified_gmt !== String(form.get('modified')))
      throw new Error(
        'This item changed. Reload its history before restoring a version.',
      );
    if (current.status === 'future')
      throw new Error(
        'Review the publication schedule before restoring this item.',
      );
    const revisionId = recordId(String(form.get('revision')));
    const versions = (
      await wp<WPRecord[]>(
        `${model.kind}/${current.id}/revisions?context=edit&per_page=5`,
        session,
      )
    ).data;
    const revision = versions.find((r) => r.id === revisionId);
    if (!revision || typeof revision.content?.raw !== 'string')
      throw new Error('This saved version is no longer available.');
    const s = sections(current.content?.raw || '');
    const markers = Object.fromEntries(
      [
        'Managed Profile',
        'Managed Publication',
        'Managed Update',
        'Legacy Source',
        'Photo Hidden',
      ]
        .filter((key) => s[key.toLowerCase()])
        .map((key) => [key, text(s[key.toLowerCase()])]),
    );
    const content = updateContentFields(
      area,
      revision.content.raw,
      contentValues(area, revision.content.raw),
      markers,
    );
    await wp(`${model.kind}/${current.id}`, session, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, title: rawTitle(revision) }),
    });
    revalidatePath('/', 'layout');
    destination = `/admin/manage/${area}?item=${item}&saved=1`;
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Could not restore this version.',
    };
  }
  redirect(destination);
}
