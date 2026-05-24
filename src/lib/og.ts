import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const nunitoBold = readFileSync(join(process.cwd(), 'public/fonts/Nunito-Bold.ttf'));
const nunitoExtraBold = readFileSync(join(process.cwd(), 'public/fonts/Nunito-ExtraBold.ttf'));

interface OgImageParams {
  title: string;
  subtitle: string;
  episodeLabel: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  seriesLabel: string;
  icon?: string;
  isHomepage?: boolean;
}

export async function renderOgImage(params: OgImageParams): Promise<Uint8Array> {
  const {
    title,
    subtitle,
    episodeLabel,
    gradientFrom,
    gradientTo,
    accentColor,
    seriesLabel,
    icon,
    isHomepage = false,
  } = params;

  const topBarChildren: any[] = [
    {
      type: 'span',
      props: {
        style: {
          fontFamily: 'Nunito',
          fontSize: 14,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.8)',
          letterSpacing: 3,
          textTransform: 'uppercase' as const,
        },
        children: 'UNBOX THE BLACK BOX',
      },
    },
  ];

  const badges: any[] = [
    {
      type: 'span',
      props: {
        style: {
          fontSize: 12,
          fontWeight: 700,
          color: accentColor,
          border: `2px solid ${accentColor}`,
          borderRadius: 20,
          padding: '4px 12px',
          letterSpacing: 1.5,
        },
        children: seriesLabel,
      },
    },
  ];

  if (episodeLabel) {
    badges.push({
      type: 'span',
      props: {
        style: {
          fontSize: 12,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.9)',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 20,
          padding: '4px 12px',
          letterSpacing: 1,
        },
        children: episodeLabel,
      },
    });
  }

  topBarChildren.push({
    type: 'div',
    props: {
      style: { display: 'flex', gap: 8, alignItems: 'center' },
      children: badges,
    },
  });

  const bodyChildren: any[] = [];

  if (icon) {
    bodyChildren.push({
      type: 'div',
      props: {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 72,
          height: 72,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(255,255,255,0.25)',
          fontSize: 28,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: 2,
          marginBottom: 20,
        },
        children: icon,
      },
    });
  }

  if (!isHomepage) {
    bodyChildren.push({
      type: 'span',
      props: {
        style: {
          fontSize: 24,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.7)',
          marginBottom: 8,
        },
        children: subtitle,
      },
    });
  }

  bodyChildren.push({
    type: 'span',
    props: {
      style: {
        fontSize: isHomepage ? 56 : 48,
        fontWeight: 700,
        color: '#ffffff',
        lineHeight: 1.15,
        maxWidth: 900,
      },
      children: title,
    },
  });

  if (isHomepage) {
    bodyChildren.push({
      type: 'span',
      props: {
        style: {
          fontSize: 24,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.65)',
          marginTop: 12,
        },
        children: subtitle,
      },
    });
  }

  const node = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column' as const,
        width: '100%',
        height: '100%',
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        fontFamily: 'Nunito',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 40px',
              background: 'rgba(0,0,0,0.2)',
            },
            children: topBarChildren,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column' as const,
              flex: 1,
              padding: '40px 48px',
              justifyContent: 'center',
            },
            children: bodyChildren,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              padding: '0 48px 28px',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: 1,
                  },
                  children: 'gokulsp98.github.io/unbox-the-black-box',
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.4)',
                  },
                  children: 'From confusion to clarity',
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(node, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Nunito',
        data: nunitoBold.buffer as ArrayBuffer,
        weight: 700,
        style: 'normal' as const,
      },
      {
        name: 'Nunito',
        data: nunitoExtraBold.buffer as ArrayBuffer,
        weight: 800,
        style: 'normal' as const,
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width' as const, value: 1200 },
  });

  return resvg.render().asPng();
}
