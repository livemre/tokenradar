import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = ['en', 'tr', 'es', 'pt', 'de', 'fr', 'ko', 'ja', 'zh'];

export async function POST(request: NextRequest) {
  const { locale } = await request.json();

  if (!SUPPORTED_LOCALES.includes(locale)) {
    return NextResponse.json({ error: 'Unsupported locale' }, { status: 400 });
  }

  const response = NextResponse.json({ locale });
  response.cookies.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });

  return response;
}
