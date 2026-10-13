import { redirect, notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import { contentModel } from '@/lib/admin/content-model';
export default async function SectionEditor({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  await requireAdmin();
  const key = (await params).section;
  try {
    contentModel(key);
  } catch {
    notFound();
  }
  redirect(`/admin/manage/${key}`);
}
