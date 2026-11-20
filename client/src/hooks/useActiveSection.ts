import { useEffect, useState } from 'react';

/** Returns the id of the section currently under the top third of the viewport. */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      // A thin band ~30% from the top: whichever section crosses it is "active".
      { rootMargin: '-30% 0px -69% 0px' },
    );
    elements.forEach((el) => observer.observe(el));

    // Clear highlight while the hero (above the first section) is in view.
    const onScroll = () => {
      if (window.scrollY < elements[0].offsetTop - window.innerHeight * 0.3) setActive(null);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [ids]);

  return active;
}
