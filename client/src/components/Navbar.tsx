import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navLinks, profile } from '../data/content';
import { useActiveSection } from '../hooks/useActiveSection';
import { ThemeToggle } from './ThemeToggle';
import { CloseIcon, MenuIcon } from './Icons';

const ids = navLinks.map((l) => l.id);

export function Navbar() {
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const active = useActiveSection(onHome ? ids : []);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on Escape or when resizing up to desktop.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const mq = window.matchMedia('(min-width: 768px)');
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [open]);

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  const linkClass = (id: string) =>
    `relative flex min-h-touch items-center px-1 text-sm font-medium transition-colors hover:text-accent ${
      active === id ? 'text-accent' : 'text-muted'
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300 ${
        scrolled || open ? 'border-border backdrop-blur-md' : 'border-transparent bg-transparent'
      }`}
      style={scrolled || open ? { backgroundColor: 'color-mix(in srgb, var(--color-bg) 88%, transparent)' } : undefined}
    >
      <nav aria-label="Main" className="container-page flex h-8 items-center justify-between">
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0 })}
          className="flex min-h-touch items-center gap-1 font-heading text-lg font-bold"
        >
          <span className="grid h-5 w-5 place-items-center rounded-sm bg-accent text-sm text-on-accent" aria-hidden="true">
            {profile.initials}
          </span>
          {/* Screen-reader-only below 1024px, so the link always has the full name as its accessible text. */}
          <span className="sr-only whitespace-nowrap lg:not-sr-only">{profile.name}</span>
        </Link>

        <ul className="hidden items-center gap-2 md:flex">
          {navLinks.map((l) => (
            <li key={l.id}>
              <a href={href(l.id)} className={linkClass(l.id)} aria-current={active === l.id ? 'location' : undefined}>
                {l.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-1 bottom-1 h-px origin-left bg-accent transition-transform duration-300 ${
                    active === l.id ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            className="grid min-h-touch min-w-touch place-items-center rounded-md text-text md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      <div id="mobile-menu" hidden={!open} className="border-t border-border md:hidden">
        <ul className="container-page flex flex-col py-1">
          {navLinks.map((l) => (
            <li key={l.id}>
              <a
                href={href(l.id)}
                onClick={() => setOpen(false)}
                className={`${linkClass(l.id)} w-full text-base`}
                aria-current={active === l.id ? 'location' : undefined}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
