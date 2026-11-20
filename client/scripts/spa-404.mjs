// GitHub Pages serves 404.html for unknown paths; copying index.html lets React Router
// handle deep links and render the custom 404 page.
import { copyFileSync } from 'node:fs';
copyFileSync('dist/index.html', 'dist/404.html');
