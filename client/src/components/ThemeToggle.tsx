import { useTheme } from '../theme/ThemeProvider';
import { MoonIcon, SunIcon } from './Icons';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="grid min-h-touch min-w-touch place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-accent"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
