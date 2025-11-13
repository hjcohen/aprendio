import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/vocabulary - Get all vocabulary items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const isKnown = searchParams.get('isKnown');

    const where: any = {};
    if (language) where.language = language;
    if (isKnown !== null && isKnown !== undefined) {
      where.isKnown = isKnown === 'true';
    }

    const items = await prisma.vocabularyItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary' },
      { status: 500 }
    );
  }
}

// POST /api/vocabulary - Create a new vocabulary item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, translation, language, isKnown, context, notes } = body;

    if (!word || !language) {
      return NextResponse.json(
        { error: 'Word and language are required' },
        { status: 400 }
      );
    }

    const item = await prisma.vocabularyItem.create({
      data: {
        word,
        translation,
        language,
        isKnown: isKnown || false,
        context,
        notes,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating vocabulary item:', error);
    return NextResponse.json(
      { error: 'Failed to create vocabulary item' },
      { status: 500 }
    );
  }
}
