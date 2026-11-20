import { useEffect, useState } from 'react';

/** Types each phrase, pauses, deletes it, then moves to the next. Shows the first phrase statically when disabled. */
export function useTypewriter(phrases: string[], enabled = true, { type = 60, erase = 30, hold = 1800 } = {}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(enabled ? '' : phrases[0]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setText(phrases[0]);
      return;
    }
    const full = phrases[index % phrases.length];
    let delay = deleting ? erase : type;
    if (!deleting && text === full) delay = hold;

    const id = setTimeout(() => {
      if (!deleting && text === full) setDeleting(true);
      else if (deleting && text === '') {
        setDeleting(false);
        setIndex((i) => i + 1);
      } else setText(full.slice(0, text.length + (deleting ? -1 : 1)));
    }, delay);
    return () => clearTimeout(id);
  }, [text, deleting, index, phrases, enabled, type, erase, hold]);

  return text;
}
