import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseTranscript, extractVocabulary } from '@/lib/extractionService';

// GET /api/transcripts - Get all transcripts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');

    const where: any = {};
    if (language) where.language = language;

    const transcripts = await prisma.transcript.findMany({
      where,
      orderBy: { uploadDate: 'desc' },
      include: {
        _count: {
          select: {
            lines: true,
            extractedItems: true,
          },
        },
      },
    });

    return NextResponse.json(transcripts);
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcripts' },
      { status: 500 }
    );
  }
}

// POST /api/transcripts - Upload and process a new transcript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title, language } = body;

    if (!content || !language) {
      return NextResponse.json(
        { error: 'Content and language are required' },
        { status: 400 }
      );
    }

    // Parse the transcript
    const lines = parseTranscript(content);

    if (lines.length === 0) {
      return NextResponse.json(
        { error: 'Could not parse transcript. Expected format: "Speaker: text"' },
        { status: 400 }
      );
    }

    // Get known vocabulary for this language
    const knownVocab = await prisma.vocabularyItem.findMany({
      where: {
        language,
        isKnown: true,
      },
      select: { word: true },
    });

    const knownWords = knownVocab.map(v => v.word);

    // Extract vocabulary
    const extracted = extractVocabulary(lines, knownWords);

    // Create transcript with lines and extracted items
    const transcript = await prisma.transcript.create({
      data: {
        title: title || `Transcript - ${new Date().toLocaleDateString()}`,
        language,
        lines: {
          create: lines.map((line, index) => ({
            speaker: line.speaker,
            text: line.text,
            timestamp: line.timestamp,
            order: index,
          })),
        },
        extractedItems: {
          create: extracted.map(item => ({
            word: item.word,
            context: item.context,
            speaker: item.speaker,
            confidence: item.confidence,
            extractionReason: item.extractionReason,
          })),
        },
      },
      include: {
        lines: true,
        extractedItems: true,
      },
    });

    return NextResponse.json(transcript, { status: 201 });
  } catch (error) {
    console.error('Error creating transcript:', error);
    return NextResponse.json(
      { error: 'Failed to create transcript' },
      { status: 500 }
    );
  }
}
