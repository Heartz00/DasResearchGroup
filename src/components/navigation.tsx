'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const links = [
  ['Home', '/'],
  ['Research', '/research'],
  ['Team', '/people'],
  ['Group Photos', '/gallery'],
  ['Publications', '/publications'],
  ['Group News', '/news'],
  ['Instruments', '/facilities'],
  ['Teaching', '/teaching'],
] as const;
export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const update = () => {
      if (header.current)
        header.current.dataset.scrolled = String(window.scrollY > 12);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    if (!open) return;
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener('keydown', escape);
    const dismissOutside = (e: Event) => {
      if (e.target instanceof Node && !header.current?.contains(e.target))
        setOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 1000px)');
    const dismissDesktop = () => {
      if (desktop.matches) {
        setOpen(false);
        if (document.activeElement === toggle.current)
          header.current?.querySelector<HTMLElement>('nav a')?.focus();
      }
    };
    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('focusin', dismissOutside);
    desktop.addEventListener('change', dismissDesktop);
    return () => {
      window.removeEventListener('keydown', escape);
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('focusin', dismissOutside);
      desktop.removeEventListener('change', dismissDesktop);
    };
  }, [open]);
  return (
    <header ref={header} className="site-header">
      <div className="header-inner">
        <Link
          className="brand"
          href="/"
          onClick={() => setOpen(false)}
          aria-label="Das Research Group home"
        >
          <span className="brand-mark">
            D<span>·</span>
          </span>
          <span>
            Das Research Group<small>Southern Methodist University</small>
          </span>
        </Link>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-controls="main-navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close' : 'Menu'}{' '}
          <span aria-hidden="true">{open ? '×' : '+'}</span>
        </button>
        <nav
          id="main-navigation"
          aria-label="Main navigation"
          className={open ? 'navigation is-open' : 'navigation'}
        >
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                (href === '/' ? pathname === '/' : pathname.startsWith(href))
                  ? 'page'
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            className="nav-join"
            href="/join"
            aria-current={pathname === '/join' ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            Join Us <span aria-hidden="true">↗</span>
          </Link>
          <Link
            href="/contact"
            aria-current={pathname === '/contact' ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
