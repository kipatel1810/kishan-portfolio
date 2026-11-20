import { useEffect, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';

export interface SceneColors {
  accent: string;
  text: string;
  muted: string;
  border: string;
}

let webglSupport: boolean | null = null;
export function supportsWebGL() {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    webglSupport = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

function readColors(): SceneColors {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return { accent: v('--color-accent'), text: v('--color-text'), muted: v('--color-muted'), border: v('--color-border') };
}

/** Scene colors taken from the active theme's design tokens; updates when the theme changes. */
export function useSceneColors() {
  const { theme } = useTheme();
  const [colors, setColors] = useState<SceneColors>(readColors);
  useEffect(() => {
    // data-theme is applied in an effect, so read the tokens on the next frame.
    const id = requestAnimationFrame(() => setColors(readColors()));
    return () => cancelAnimationFrame(id);
  }, [theme]);
  return { colors, dark: theme === 'dark' };
}
