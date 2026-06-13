import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/vocabulary/[id] - Get a single vocabulary item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.vocabularyItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Vocabulary item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching vocabulary item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary item' },
      { status: 500 }
    );
  }
}

// PATCH /api/vocabulary/[id] - Update a vocabulary item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { word, translation, language, isKnown, context, notes } = body;

    const item = await prisma.vocabularyItem.update({
      where: { id },
      data: {
        ...(word !== undefined && { word }),
        ...(translation !== undefined && { translation }),
        ...(language !== undefined && { language }),
        ...(isKnown !== undefined && { isKnown }),
        ...(context !== undefined && { context }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating vocabulary item:', error);
    return NextResponse.json(
      { error: 'Failed to update vocabulary item' },
      { status: 500 }
    );
  }
}

// DELETE /api/vocabulary/[id] - Delete a vocabulary item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.vocabularyItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting vocabulary item:', error);
    return NextResponse.json(
      { error: 'Failed to delete vocabulary item' },
      { status: 500 }
    );
  }
}
