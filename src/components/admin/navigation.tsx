'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const groups = [
  { label: 'Your website', items: [['Overview', '/admin']] },
  {
    label: 'Content',
    items: [
      ['PI Profile', '/admin/manage/profile'],
      ['Team Members', '/admin/manage/people'],
      ['Research', '/admin/manage/research'],
      ['Publications', '/admin/manage/publications'],
      ['Group News', '/admin/manage/updates'],
      ['Instruments', '/admin/manage/facilities'],
      ['Funding Support', '/admin/manage/funding'],
      ['Gallery', '/admin/manage/photos'],
      ['Join the Lab', '/admin/manage/join'],
      ['Teaching', '/admin/manage/teaching'],
    ],
  },
  {
    label: 'Site Settings',
    items: [
      ['Homepage', '/admin/manage/homepage'],
      ['Page Headers', '/admin/headers'],
      ['Contact', '/admin/manage/contact'],
      ['Footer', '/admin/manage/footer'],
    ],
  },
  {
    label: 'Administration',
    items: [
      ['Users & Access', '/admin/access'],
      ['Help', '/admin/extend'],
    ],
  },
] as const;

export default function AdminNavigation() {
  const path = usePathname();
  const currentSection = useSearchParams().get('section');
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const isCurrent = (href: string) =>
    path === href ||
    (href === '/admin/headers' &&
      /^\/admin\/manage\/(research|publications|news|facilities)-header$/.test(
        path,
      )) ||
    (href.startsWith('/admin/manage/') &&
      (path === href.replace('/manage/', '/content/') ||
        currentSection === href.split('/').at(-1)));
  const currentLabel = groups
    .flatMap((group) => [...group.items])
    .find(([, href]) => isCurrent(href))?.[0];
  return (
    <div
      className="admin-navigation"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <button
        ref={toggle}
        type="button"
        className="admin-section-toggle"
        aria-expanded={open}
        aria-controls="admin-section-navigation"
        onClick={() => setOpen(!open)}
      >
        <span>
          Choose a section
          {currentLabel && <small>Current: {currentLabel}</small>}
        </span>
        <span aria-hidden="true">{open ? '-' : '+'}</span>
      </button>
      <nav
        id="admin-section-navigation"
        className={`admin-sidebar ${open ? 'is-open' : ''}`}
        aria-label="Website management"
      >
        {groups.map((group, index) => (
          <section
            className="admin-nav-group"
            key={group.label}
            aria-labelledby={`admin-nav-group-${index}`}
          >
            <p className="eyebrow" id={`admin-nav-group-${index}`}>
              {group.label}
            </p>
            {group.items.map(([label, href]) => (
              <Link
                prefetch={false}
                key={href}
                href={href}
                aria-current={isCurrent(href) ? 'page' : undefined}
                onClick={() => {
                  setOpen(false);
                  if (open) toggle.current?.focus();
                }}
              >
                {label}
              </Link>
            ))}
          </section>
        ))}
      </nav>
    </div>
  );
}
