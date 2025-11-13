'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface TranscriptLine {
  id: string;
  speaker: string;
  text: string;
  timestamp?: string;
  order: number;
}

interface ExtractedItem {
  id: string;
  word: string;
  context: string;
  speaker: string;
  confidence: 'high' | 'medium' | 'low';
  extractionReason: string;
  isAddedToVocab: boolean;
}

interface Transcript {
  id: string;
  title: string;
  language: string;
  uploadDate: string;
  lines: TranscriptLine[];
  extractedItems: ExtractedItem[];
}

export default function TranscriptDetailPage() {
  const params = useParams();
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'conversation' | 'extracted'>('extracted');

  useEffect(() => {
    fetchTranscript();
  }, [params.id]);

  const fetchTranscript = async () => {
    try {
      const response = await fetch(`/api/transcripts/${params.id}`);
      const data = await response.json();
      setTranscript(data);
    } catch (error) {
      console.error('Error fetching transcript:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToVocabulary = async (extractedItemId: string) => {
    try {
      await fetch(`/api/transcripts/${params.id}/extracted`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extractedItemId, addToVocab: true }),
      });
      fetchTranscript();
    } catch (error) {
      console.error('Error adding to vocabulary:', error);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Transcript not found</p>
          <Link href="/transcripts" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Transcripts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Link href="/transcripts" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
            ← Back to Transcripts
          </Link>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{transcript.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                {transcript.language}
              </span>
              <span>{transcript.lines.length} lines</span>
              <span>
                {transcript.extractedItems.length} words extracted
              </span>
              <span>
                {new Date(transcript.uploadDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-2 inline-flex gap-2">
            <button
              onClick={() => setActiveTab('extracted')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'extracted'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Extracted Vocabulary ({transcript.extractedItems.length})
            </button>
            <button
              onClick={() => setActiveTab('conversation')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'conversation'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Full Conversation
            </button>
          </div>
        </div>

        {activeTab === 'extracted' && (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>How it works:</strong> Our AI analyzes the conversation and identifies words/phrases your teacher taught you.
                Confidence levels indicate how certain we are that these were teaching moments.
              </p>
            </div>

            {transcript.extractedItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">No vocabulary extracted from this transcript.</p>
                <p className="text-gray-400 mt-2">The AI didn't detect any clear teaching moments.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transcript.extractedItems
                  .sort((a, b) => {
                    const confidenceOrder = { high: 3, medium: 2, low: 1 };
                    return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
                  })
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                        item.isAddedToVocab ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">{item.word}</h3>
                            <span
                              className={`text-xs px-3 py-1 rounded-full border ${getConfidenceColor(
                                item.confidence
                              )}`}
                            >
                              {item.confidence} confidence
                            </span>
                            {item.isAddedToVocab && (
                              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-300">
                                ✓ Added to vocab
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 italic mb-2 bg-gray-50 p-3 rounded">
                            "{item.context}"
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Reason:</strong> {item.extractionReason}
                          </p>
                        </div>
                        {!item.isAddedToVocab && (
                          <button
                            onClick={() => addToVocabulary(item.id)}
                            className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium whitespace-nowrap"
                          >
                            + Add to Vocabulary
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'conversation' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Full Conversation</h2>
            <div className="space-y-4">
              {transcript.lines.map((line) => (
                <div
                  key={line.id}
                  className={`flex ${
                    line.speaker.toLowerCase() === 'teacher' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`max-w-[70%] ${
                      line.speaker.toLowerCase() === 'teacher'
                        ? 'bg-indigo-50 border-indigo-200'
                        : 'bg-gray-50 border-gray-200'
                    } border rounded-lg p-4`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold ${
                          line.speaker.toLowerCase() === 'teacher'
                            ? 'text-indigo-700'
                            : 'text-gray-700'
                        }`}
                      >
                        {line.speaker}
                      </span>
                      {line.timestamp && (
                        <span className="text-xs text-gray-500">{line.timestamp}</span>
                      )}
                    </div>
                    <p className="text-gray-800">{line.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
