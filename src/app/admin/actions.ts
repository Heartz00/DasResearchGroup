'use server';
import { redirect } from 'next/navigation';
import { randomBytes } from 'node:crypto';
import { accessRole, editableAccount } from '@/lib/admin/access';
import type { WPUser } from '@/lib/admin/wordpress';
import { revalidatePath } from 'next/cache';
import {
  configured,
  sameOrigin,
  createSession,
  clearSession,
  requireAdmin,
} from '@/lib/admin/auth';
import { currentUser, wp } from '@/lib/admin/wordpress';
import { allowLogin } from '@/lib/admin/login-limit';
import { adminSections } from '@/lib/admin/sections';
import {
  collection,
  recordId,
  payload,
  imageType,
  type WPRecord,
} from '@/lib/admin/records';
export type ActionState = { error?: string; success?: string };
const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'The request could not be completed.';
export async function login(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    await sameOrigin();
    if (!configured())
      throw new Error('Admin access is not configured. Follow ADMIN_SETUP.md.');
    const username = String(form.get('username') || '').trim();
    const password = String(form.get('password') || '').replace(/\s/g, '');
    if (
      !username ||
      username.length > 100 ||
      username.includes(':') ||
      !/^[A-Za-z0-9]{24}$/.test(password)
    )
      throw new Error('Enter your username and personal access key.');
    if (!allowLogin(username))
      throw new Error(
        'Too many sign-in attempts. Wait 15 minutes before trying again.',
      );
    const user = await currentUser({ username, password });
    await createSession(username, password, user.id);
  } catch (error) {
    return { error: errorMessage(error) };
  }
  redirect('/admin');
}
export async function logout() {
  await sameOrigin();
  await clearSession();
  redirect('/admin/login');
}
export async function changeAccess(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { session, user } = await requireAdmin();
  try {
    await sameOrigin();
    if (!user.capabilities.promote_users)
      throw new Error(
        'Your site account cannot assign roles. Ask the site owner or SMU administrator.',
      );
    const id = recordId(String(form.get('user_id')));
    const target = (await wp<WPUser>(`users/${id}?context=edit`, session)).data;
    editableAccount(id, user.id, target.roles || []);
    const role = accessRole(String(form.get('role')));
    await wp(`users/${id}`, session, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roles: [role] }),
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath('/admin/access');
  return {
    success: 'Access updated. account permissions apply immediately.',
  };
}
export async function createAccount(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { session, user } = await requireAdmin();
  try {
    await sameOrigin();
    if (!user.capabilities.create_users || !user.capabilities.promote_users)
      throw new Error(
        'Your site account cannot create and assign users. Ask the SMU administrator to add an authorized account.',
      );
    const username = String(form.get('username') || '').trim(),
      email = String(form.get('email') || '').trim(),
      name = String(form.get('name') || '').trim();
    if (
      !/^[A-Za-z0-9._-]{2,60}$/.test(username) ||
      !name ||
      name.length > 100 ||
      email.length > 254 ||
      !/^\S+@\S+\.\S+$/.test(email)
    )
      throw new Error(
        'Enter a name, valid email and a username of 2–60 letters, numbers, dots, hyphens or underscores.',
      );
    const role = accessRole(String(form.get('role')));
    await wp('users', session, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        email,
        name,
        roles: [role],
        password: randomBytes(32).toString('base64url'),
      }),
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath('/admin/access');
  return {
    success:
      'Account created in the content editor. The member must activate their approved sign-in method and create their own Application Password. No sign-in link has been sent by this workspace.',
  };
}
export async function saveRecord(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { session } = await requireAdmin();
  let destination = '/admin';
  try {
    await sameOrigin();
    const kind = collection(String(form.get('collection')));
    const rawId = String(form.get('id'));
    const id = rawId === 'new' ? null : recordId(rawId);
    if (!id && kind === 'media')
      throw new Error('Use the image upload form to add media.');
    if (id) {
      const { data: latest } = await wp<WPRecord>(
        `${kind}/${id}?context=edit`,
        session,
      );
      const modified = String(form.get('modified') || '');
      if (latest.modified_gmt && latest.modified_gmt !== modified)
        throw new Error(
          'This record changed in the content editor after you opened it. Copy your edits, reload and compare before saving.',
        );
      if (
        latest.status &&
        !['draft', 'pending', 'publish', 'private', 'inherit'].includes(
          latest.status,
        )
      )
        throw new Error(
          'Edit this scheduled or archived record in the content editor to preserve its status.',
        );
    }
    const body = payload(kind, form);
    const { data } = await wp<WPRecord>(
      `${kind}${id ? `/${id}` : ''}`,
      session,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    const section = adminSections.find(
      (item) => item.key === form.get('section'),
    );
    destination = `/admin/${kind}/${data.id}?saved=1${section ? `&section=${section.key}` : ''}`;
    revalidatePath('/', 'layout');
  } catch (error) {
    return { error: errorMessage(error) };
  }
  redirect(destination);
}
export async function uploadImage(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { session } = await requireAdmin();
  let id: number;
  try {
    await sameOrigin();
    const file = form.get('image');
    if (!(file instanceof File) || !file.size || file.size > 3 * 1024 * 1024)
      throw new Error('Select an image under 3 MB.');
    const buffer = new Uint8Array(await file.arrayBuffer());
    const type = imageType(buffer);
    const upload = new FormData();
    upload.append(
      'file',
      new Blob([buffer], { type: type.mime }),
      `lab-image-${Date.now()}.${type.extension}`,
    );
    upload.append(
      'alt_text',
      String(form.get('alt_text') || '').slice(0, 2000),
    );
    const { data } = await wp<WPRecord>('media', session, {
      method: 'POST',
      body: upload,
    });
    id = data.id;
    revalidatePath('/', 'layout');
  } catch (error) {
    return { error: errorMessage(error) };
  }
  redirect(`/admin/media/${id}?saved=1`);
}
