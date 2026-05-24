import type { APIRoute } from 'astro';
import { renderOgImage } from '../../lib/og';

export const GET: APIRoute = async () => {
  const png = await renderOgImage({
    title: 'Unbox the Black Box',
    subtitle: 'From confusion to clarity',
    episodeLabel: '',
    gradientFrom: '#0c2461',
    gradientTo: '#6c5ce7',
    accentColor: '#a29bfe',
    seriesLabel: "GOKUL'S LEARNING JOURNAL",
    isHomepage: true,
  });
  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
