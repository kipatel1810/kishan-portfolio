import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page not found | Kishankumar Patel';
    return () => {
      document.title = 'Kishankumar Patel | Software Developer';
    };
  }, []);

  return (
    <section className="container-page grid min-h-[80vh] place-items-center pt-8 text-center" aria-labelledby="nf-title">
      <div className="flex flex-col items-center gap-3">
        <p className="font-heading text-display font-bold text-accent" aria-hidden="true">
          404
        </p>
        <h1 id="nf-title" className="text-2xl font-semibold">
          This page doesn’t exist
        </h1>
        <p className="max-w-md text-muted">The link may be broken, or the page may have moved. Everything else is on the home page.</p>
        <Link to="/" className="btn-primary">
          Back to home
        </Link>
      </div>
    </section>
  );
}
