import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://gokulsp98.github.io',
  base: '/unbox-the-black-box/',
  build: { format: 'file' }
});
