import { useEffect, useState } from 'react';
import { profile } from '../data/content';
import { useTypewriter } from '../hooks/useTypewriter';
import { usePrefersReducedMotion } from '../hooks/useMediaQuery';
import { SocialLinks } from '../components/SocialLinks';
import { ArrowRightIcon, MapPinIcon } from '../components/Icons';
import { HeroBackground } from '../three/HeroBackground';

/** Stagger delay for the CSS .enter animation. */
const delay = (s: number) => ({ animationDelay: `${s}s` });

/** Isolated so each keystroke re-renders only this span, not the whole hero. */
function TypedTagline() {
  const reduced = usePrefersReducedMotion();
  // Show the first phrase statically, then start typing once the page has settled.
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setStarted(true), 2500);
    return () => window.clearTimeout(id);
  }, []);
  const typed = useTypewriter(profile.taglines, started && !reduced);

  return (
    <span aria-hidden="true">
      <span className="text-accent">&gt;</span> {typed}
      <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse bg-accent" />
    </span>
  );
}

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-8">
      <HeroBackground />
      <div className="container-page relative py-8">
        <div className="max-w-3xl">
          <p style={delay(0.1)} className="enter mb-2 flex items-center gap-1 text-sm font-medium text-muted">
            <MapPinIcon width={16} height={16} /> {profile.location}
          </p>
          {/* Not faded in: it's the largest element, and hiding it would delay LCP. */}
          <h1 id="hero-title" className="text-display font-bold">
            Hi, I’m {profile.shortName}.
            <span className="block text-muted">I build reliable back ends and data pipelines.</span>
          </h1>

          <p style={delay(0.3)} className="enter mt-3 font-heading text-xl font-medium">
            <span className="sr-only">I work on: {profile.taglines.join(', ')}.</span>
            <TypedTagline />
          </p>

          <p style={delay(0.4)} className="enter mt-3 max-w-2xl text-lg text-muted">
            {profile.intro}
          </p>

          <div style={delay(0.5)} className="enter mt-5 flex flex-wrap items-center gap-2">
            <a href="#projects" className="btn-primary">
              View projects <ArrowRightIcon width={18} height={18} />
            </a>
            <a href="#contact" className="btn-ghost">
              Get in touch
            </a>
            <SocialLinks className="ml-0.5" />
          </div>
        </div>
      </div>
    </section>
  );
}
