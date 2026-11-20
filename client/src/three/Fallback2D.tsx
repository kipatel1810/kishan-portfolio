/** CSS-only animated background used when WebGL is unavailable (or before the 3D scene loads). */
export function Fallback2D() {
  return (
    <div aria-hidden="true" className="fallback-2d pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <span className="blob blob-a" />
      <span className="blob blob-b" />
      <span className="grid-lines" />
    </div>
  );
}
