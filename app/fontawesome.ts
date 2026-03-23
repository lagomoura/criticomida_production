// Font Awesome base config + SVG stylesheet (no library.add: use direct
// icon imports in components so SSR and client always resolve the same glyph).
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

config.autoAddCss = false;
