import { profile } from '../data/content';
import { GitHubIcon, LinkedInIcon, MailIcon } from './Icons';

// GitHub/LinkedIn render only once their URLs are filled in (see TODOs in content.ts).
const links = [
  { href: `mailto:${profile.email}`, label: 'Email', Icon: MailIcon },
  profile.github && { href: profile.github, label: 'GitHub', Icon: GitHubIcon },
  profile.linkedin && { href: profile.linkedin, label: 'LinkedIn', Icon: LinkedInIcon },
].filter(Boolean) as { href: string; label: string; Icon: typeof MailIcon }[];

export function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-0.5 ${className}`}>
      {links.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            aria-label={label}
            title={label}
            {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="grid min-h-touch min-w-touch place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-accent"
          >
            <Icon />
          </a>
        </li>
      ))}
    </ul>
  );
}
