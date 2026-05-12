/* eslint-disable @next/next/no-img-element */
// Satori (next/og) sólo soporta <img>; next/image no funciona acá.

import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';
import sharp from 'sharp';

// nodejs runtime: necesitamos sharp para convertir webp → PNG (Satori no soporta webp).
export const runtime = 'nodejs';

const WIDTH = 1080;
const HEIGHT = 1920;

// Satori (next/og) no soporta CSS vars — los hex deben coincidir con la paleta
// canónica en `app/globals.css` (Terracota & Dorado, v2.1).
const COLOR_CREMA = '#F7F1E8';
const COLOR_CREMA_DARK = '#EFE4D2';
const COLOR_ESPRESSO = '#2A211C';
const COLOR_ESPRESSO_MID = '#7A6A5D';
const COLOR_TERRACOTA = '#C96A4B';

interface PillarValue {
  presentation: 1 | 2 | 3 | null;
  value_prop: 1 | 2 | 3 | null;
  execution: 1 | 2 | 3 | null;
}

interface ReviewDTO {
  id: string;
  author: { display_name: string; handle: string | null };
  dish: { name: string; restaurant_name: string };
  score: number;
  media: { url: string; alt: string | null }[];
  extras: (PillarValue & { is_anonymous: boolean | null }) | null;
}

function pillarLabel(v: 1 | 2 | 3 | null | undefined): string {
  if (v === 3) return 'Excepcional';
  if (v === 2) return 'Sólida';
  return '—';
}

function pillarColor(v: 1 | 2 | 3 | null | undefined): string {
  if (v === 3) return COLOR_TERRACOTA;
  if (v === 2) return COLOR_ESPRESSO;
  return COLOR_ESPRESSO_MID;
}

function absoluteUrl(url: string, apiBase: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${apiBase}${url}`;
  return url;
}

const PHOTO_SIZE = 920;

async function resolvePhotoSrc(
  rawUrl: string | undefined,
  apiBase: string,
): Promise<string | null> {
  if (!rawUrl) return null;
  const absolute = absoluteUrl(rawUrl, apiBase);
  const isWebp = /\.webp(\?|$)/i.test(rawUrl);
  if (!isWebp) return absolute;

  try {
    const res = await fetch(absolute);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const png = await sharp(buf)
      .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: 'cover' })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? COLOR_TERRACOTA : COLOR_CREMA_DARK}
      />
    </svg>
  );
}

function Pillar({
  label,
  value,
}: {
  label: string;
  value: 1 | 2 | 3 | null | undefined;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        height: 200,
        backgroundColor: '#FFFFFF',
        border: `2px solid ${value === 3 ? COLOR_TERRACOTA : COLOR_CREMA_DARK}`,
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div
        style={{
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: COLOR_ESPRESSO_MID,
          textAlign: 'center',
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: 'Cormorant Garamond',
          fontSize: 52,
          fontWeight: 600,
          color: pillarColor(value),
          lineHeight: 1,
        }}
      >
        {pillarLabel(value)}
      </div>
    </div>
  );
}

function FallbackPhoto() {
  return (
    <div
      style={{
        width: 920,
        height: 920,
        backgroundColor: COLOR_CREMA_DARK,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        fontFamily: 'Cormorant Garamond',
        fontSize: 96,
        fontStyle: 'italic',
        color: COLOR_TERRACOTA,
      }}
    >
      Sin foto
    </div>
  );
}

function ErrorCard() {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: COLOR_CREMA,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: 80,
      }}
    >
      <div
        style={{
          fontFamily: 'Cormorant Garamond',
          fontSize: 96,
          color: COLOR_ESPRESSO,
          textAlign: 'center',
          lineHeight: 1.1,
        }}
      >
        Palato
      </div>
      <div
        style={{
          marginTop: 32,
          fontFamily: 'Inter',
          fontSize: 36,
          color: COLOR_ESPRESSO_MID,
          textAlign: 'center',
        }}
      >
        Reseña no disponible
      </div>
    </div>
  );
}

async function loadFonts(origin: string) {
  const fetchTtf = (path: string) =>
    fetch(`${origin}${path}`).then((r) => {
      if (!r.ok) throw new Error(`Font fetch failed: ${path}`);
      return r.arrayBuffer();
    });
  const [cormorant, cormorantItalic, cormorantSemi, inter, interMedium] =
    await Promise.all([
      fetchTtf('/fonts/CormorantGaramond-Regular.ttf'),
      fetchTtf('/fonts/CormorantGaramond-Italic.ttf'),
      fetchTtf('/fonts/CormorantGaramond-SemiBold.ttf'),
      fetchTtf('/fonts/Inter-Regular.ttf'),
      fetchTtf('/fonts/Inter-Medium.ttf'),
    ]);
  return [
    { name: 'Cormorant Garamond', data: cormorant, weight: 400 as const, style: 'normal' as const },
    { name: 'Cormorant Garamond', data: cormorantItalic, weight: 400 as const, style: 'italic' as const },
    { name: 'Cormorant Garamond', data: cormorantSemi, weight: 600 as const, style: 'normal' as const },
    { name: 'Inter', data: inter, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: interMedium, weight: 500 as const, style: 'normal' as const },
  ];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8002';
  const origin = req.nextUrl.origin;

  const fonts = await loadFonts(origin);

  let review: ReviewDTO | null = null;
  try {
    const res = await fetch(`${apiBase}/api/reviews/${encodeURIComponent(id)}`);
    if (res.ok) {
      review = (await res.json()) as ReviewDTO;
    }
  } catch {
    // dejamos review=null para caer al ErrorCard
  }

  if (!review) {
    return new ImageResponse(<ErrorCard />, {
      width: WIDTH,
      height: HEIGHT,
      fonts,
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    });
  }

  const photoUrl = await resolvePhotoSrc(review.media[0]?.url, apiBase);
  const stars = Math.max(0, Math.min(5, Math.round(review.score)));
  const handle = review.extras?.is_anonymous
    ? null
    : review.author.handle ?? review.author.display_name;
  const allPillarsNull =
    !review.extras ||
    (review.extras.presentation == null &&
      review.extras.value_prop == null &&
      review.extras.execution == null);

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          backgroundColor: COLOR_CREMA,
          display: 'flex',
          flexDirection: 'column',
          padding: 80,
          fontFamily: 'Inter',
        }}
      >
        {/* Top strip: wordmark Palato (asset light, fondo crema). El asset
            ya incluye el texto, así que no se repite. */}
        <div style={{ display: 'flex', alignItems: 'center', height: 80 }}>
          <img
            src={`${origin}/img/palato_logo_light.png`}
            height={80}
            alt="Palato"
            style={{ height: 80, width: 'auto' }}
          />
        </div>

        {/* Foto del plato (cuadrada) */}
        <div
          style={{
            marginTop: 40,
            width: 920,
            height: 920,
            display: 'flex',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              width={920}
              height={920}
              alt=""
              style={{ objectFit: 'cover', width: 920, height: 920 }}
            />
          ) : (
            <FallbackPhoto />
          )}
        </div>

        {/* Nombre del plato + restaurante */}
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontFamily: 'Cormorant Garamond',
              fontSize: 88,
              fontWeight: 600,
              color: COLOR_ESPRESSO,
              lineHeight: 1.05,
              maxWidth: 920,
            }}
          >
            {review.dish.name}
          </div>
          <div
            style={{
              marginTop: 12,
              display: 'flex',
              alignItems: 'baseline',
            }}
          >
            <div
              style={{
                fontFamily: 'Cormorant Garamond',
                fontStyle: 'italic',
                fontSize: 36,
                color: COLOR_ESPRESSO_MID,
              }}
            >
              en&nbsp;
            </div>
            <div
              style={{
                fontFamily: 'Inter',
                fontSize: 36,
                color: COLOR_ESPRESSO_MID,
              }}
            >
              {review.dish.restaurant_name}
            </div>
          </div>
        </div>

        {/* Rating estrellas */}
        <div
          style={{
            marginTop: 32,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} filled={i < stars} />
          ))}
          <div
            style={{
              marginLeft: 20,
              fontFamily: 'Cormorant Garamond',
              fontSize: 56,
              fontWeight: 600,
              color: COLOR_ESPRESSO,
            }}
          >
            {review.score.toFixed(1)}
          </div>
        </div>

        {/* 3 sellos de pilares */}
        {!allPillarsNull && (
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              flexDirection: 'row',
              width: 920,
            }}
          >
            <div style={{ display: 'flex', flex: 1, marginRight: 16 }}>
              <Pillar label="Presentación" value={review.extras?.presentation} />
            </div>
            <div style={{ display: 'flex', flex: 1, marginRight: 16 }}>
              <Pillar label="Ejecución" value={review.extras?.execution} />
            </div>
            <div style={{ display: 'flex', flex: 1 }}>
              <Pillar label="Costo-Benef." value={review.extras?.value_prop} />
            </div>
          </div>
        )}

        {/* Footer con handle */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'center',
            fontFamily: 'Inter',
            fontSize: 28,
            color: COLOR_ESPRESSO_MID,
          }}
        >
          {handle ? `@${handle.replace(/^@/, '')}` : 'Reseña anónima'}
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts,
      headers: {
        'Cache-Control':
          'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  );
}
