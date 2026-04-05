import { NextRequest, NextResponse } from 'next/server';

const FAL_KEY = process.env.FAL_KEY;

export async function POST(request: NextRequest) {
  const { name } = await request.json();

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ imageUrl: null }, { status: 400 });
  }

  if (!FAL_KEY) {
    return NextResponse.json({ imageUrl: null });
  }

  const prompt = `Food category cover photo for ${name} cuisine, top-down view, vibrant colors, professional food photography, clean background`;

  try {
    const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'square',
        num_images: 1,
        num_inference_steps: 4,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ imageUrl: null });
    }

    const data = await res.json();
    const imageUrl: string | null = data?.images?.[0]?.url ?? null;
    return NextResponse.json({ imageUrl });
  } catch {
    return NextResponse.json({ imageUrl: null });
  }
}
