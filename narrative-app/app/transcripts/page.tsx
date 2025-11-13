'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Transcript {
  id: string;
  title: string;
  language: string;
  uploadDate: string;
  _count: {
    lines: number;
    extractedItems: number;
  };
}

export default function TranscriptsPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTranscripts();
  }, []);

  const fetchTranscripts = async () => {
    try {
      const response = await fetch('/api/transcripts');
      const data = await response.json();
      setTranscripts(data);
    } catch (error) {
      console.error('Error fetching transcripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTranscript = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transcript?')) return;

    try {
      await fetch(`/api/transcripts/${id}`, { method: 'DELETE' });
      fetchTranscripts();
    } catch (error) {
      console.error('Error deleting transcript:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Transcripts</h1>
              <p className="text-gray-600">Browse your past tutoring sessions</p>
            </div>
            <Link
              href="/transcripts/upload"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              + Upload New
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : transcripts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg mb-4">No transcripts yet.</p>
            <p className="text-gray-400 mb-6">Upload your first tutoring session transcript to get started!</p>
            <Link
              href="/transcripts/upload"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Upload Transcript
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {transcripts.map((transcript) => (
              <div
                key={transcript.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/transcripts/${transcript.id}`}>
                      <h3 className="text-xl font-bold text-gray-900 hover:text-indigo-600 mb-2">
                        {transcript.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Language:</span>
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                          {transcript.language}
                        </span>
                      </span>
                      <span>
                        {transcript._count.lines} lines
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-green-600">
                          {transcript._count.extractedItems}
                        </span>
                        <span>words extracted</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Uploaded {new Date(transcript.uploadDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/transcripts/${transcript.id}`}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-medium"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => deleteTranscript(transcript.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
