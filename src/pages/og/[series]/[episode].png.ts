import type { APIRoute, GetStaticPaths } from 'astro';
import { allSeries } from '../../../data/series';
import { renderOgImage } from '../../../lib/og';

export const getStaticPaths: GetStaticPaths = () => {
  return allSeries.flatMap((series) =>
    series.episodes.map((episode) => ({
      params: { series: series.id, episode: episode.slug },
      props: { series, episode },
    }))
  );
};

export const GET: APIRoute = async ({ props }: any) => {
  const { series, episode } = props;
  const png = await renderOgImage({
    title: episode.title,
    subtitle: series.name,
    episodeLabel: `Ep ${episode.num} of ${series.episodes.length}`,
    gradientFrom: series.theme.gradientFrom,
    gradientTo: series.theme.gradientTo,
    accentColor: series.theme.accentColor,
    seriesLabel: series.theme.seriesLabel,
    icon: series.theme.icon,
  });
  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
