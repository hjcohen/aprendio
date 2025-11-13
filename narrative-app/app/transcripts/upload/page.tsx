'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadTranscriptPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    language: 'Spanish',
    content: '',
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      const response = await fetch('/api/transcripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload transcript');
      }

      const transcript = await response.json();
      router.push(`/transcripts/${transcript.id}`);
    } catch (err: any) {
      setError(err.message);
      setUploading(false);
    }
  };

  const exampleTranscript = `Teacher: Hola, ¿cómo estás?
Student: I'm good, thanks. How do I say "I'm learning Spanish"?
Teacher: You say "Estoy aprendiendo español". The word "estoy" means "I am" in a temporary state.
Student: Estoy aprendiendo español.
Teacher: ¡Perfecto! Very good. Let's learn some more verbs. For example, "hablar" means "to speak".
Student: Hablar... to speak.
Teacher: Exactly. And "escribir" means "to write". Try to use both in a sentence.
Student: Yo hablo español y escribo en inglés.
Teacher: Excellent! But remember, we say "escribo en español" not "en inglés" if you want to say you write in Spanish.`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Transcript</h1>
          <p className="text-gray-600">
            Upload a diarized transcript from your language tutoring session
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">📝 Transcript Format</h3>
          <p className="text-blue-800 mb-3">
            Your transcript should have speaker labels. Each line should start with the speaker's name followed by a colon:
          </p>
          <pre className="bg-white p-4 rounded-lg text-sm text-gray-800 overflow-x-auto">
            {`Teacher: Hello, how are you?
Student: I'm good, thanks.
Teacher: Let's learn some vocabulary...`}
          </pre>
          <button
            onClick={() => setFormData({ ...formData, content: exampleTranscript })}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Load example transcript
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title (optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Spanish Lesson - Week 3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language *
            </label>
            <input
              type="text"
              required
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              placeholder="e.g., Spanish, French, German"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transcript Content *
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              placeholder="Paste your diarized transcript here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.content.split('\n').filter(l => l.trim()).length} lines
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  Processing...
                </span>
              ) : (
                'Upload & Analyze'
              )}
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-center"
            >
              Cancel
            </Link>
          </div>
        </form>

        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">1.</span>
              <span>We'll parse your transcript and identify each speaker</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">2.</span>
              <span>Our AI will analyze the conversation for teaching moments and vocabulary</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">3.</span>
              <span>You'll see extracted words and phrases with confidence scores</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">4.</span>
              <span>You can review and add words to your vocabulary list with one click</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
