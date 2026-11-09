// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // The whole stylesheet is under 10 KB, so it ships inside the page instead of blocking the first paint.
  build: { inlineStylesheets: 'always' },
});
