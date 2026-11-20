import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import Home from './pages/Home';

const NotFound = lazy(() => import('./pages/NotFound'));

/** Scrolls to the hash target after navigating from another route (e.g. 404 → /#contact). */
function HashScroll() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    // "user" makes every Framer Motion animation respect prefers-reduced-motion.
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="fixed left-2 top-2 z-50 flex min-h-touch -translate-y-16 items-center rounded-md bg-accent px-2 font-semibold text-on-accent transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <HashScroll />
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<div className="min-h-[80vh]" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </MotionConfig>
  );
}
