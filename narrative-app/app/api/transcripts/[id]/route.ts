import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/transcripts/[id] - Get a single transcript with all details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transcript = await prisma.transcript.findUnique({
      where: { id },
      include: {
        lines: {
          orderBy: { order: 'asc' },
        },
        extractedItems: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(transcript);
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
}

// DELETE /api/transcripts/[id] - Delete a transcript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.transcript.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting transcript:', error);
    return NextResponse.json(
      { error: 'Failed to delete transcript' },
      { status: 500 }
    );
  }
}
