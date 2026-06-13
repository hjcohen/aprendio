import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PATCH /api/transcripts/[id]/extracted - Mark extracted item as added to vocab
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { extractedItemId, addToVocab } = body;

    if (!extractedItemId) {
      return NextResponse.json(
        { error: 'extractedItemId is required' },
        { status: 400 }
      );
    }

    // Update the extracted item
    const extractedItem = await prisma.extractedItem.update({
      where: { id: extractedItemId },
      data: { isAddedToVocab: addToVocab !== false },
    });

    // If adding to vocab, also create a vocabulary item
    if (addToVocab !== false) {
      const transcript = await prisma.transcript.findUnique({
        where: { id },
      });

      if (transcript) {
        await prisma.vocabularyItem.create({
          data: {
            word: extractedItem.word,
            language: transcript.language,
            isKnown: false, // Newly discovered word
            context: extractedItem.context,
          },
        });
      }
    }

    return NextResponse.json(extractedItem);
  } catch (error) {
    console.error('Error updating extracted item:', error);
    return NextResponse.json(
      { error: 'Failed to update extracted item' },
      { status: 500 }
    );
  }
}
