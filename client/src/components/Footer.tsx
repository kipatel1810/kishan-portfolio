import { profile } from '../data/content';
import { SocialLinks } from './SocialLinks';

export function Footer() {
  return (
    <footer className="border-t border-border py-4">
      <div className="container-page flex flex-col items-center justify-between gap-2 text-sm text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {profile.name}. Built with React, Three.js and Node.js.
        </p>
        <SocialLinks />
      </div>
    </footer>
  );
}
