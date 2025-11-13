import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Narrative
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered language learning from your tutoring sessions.
            Upload transcripts and discover what you've learned.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Upload Transcript Card */}
          <Link
            href="/transcripts/upload"
            className="block p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Upload Transcript
            </h2>
            <p className="text-gray-600">
              Upload a diarized transcript from your language tutoring session and let our AI extract the vocabulary you learned.
            </p>
          </Link>

          {/* View Transcripts Card */}
          <Link
            href="/transcripts"
            className="block p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-cyan-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              View Transcripts
            </h2>
            <p className="text-gray-600">
              Browse your past tutoring sessions and review the extracted vocabulary with intelligent highlights.
            </p>
          </Link>

          {/* Vocabulary List Card */}
          <Link
            href="/vocabulary"
            className="block p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              My Vocabulary
            </h2>
            <p className="text-gray-600">
              Manage your personal vocabulary list. Track which words you know and which ones you're still learning.
            </p>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h3>
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Upload Your Transcript
                </h4>
                <p className="text-gray-600">
                  Upload a diarized transcript (with speaker labels) from your tutoring session in a simple format like "Teacher: text" and "Student: text".
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  AI Extracts Vocabulary
                </h4>
                <p className="text-gray-600">
                  Our intelligent system identifies words and phrases your teacher taught you by detecting teaching patterns, repetition, and unknown vocabulary.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Build Your Vocabulary
                </h4>
                <p className="text-gray-600">
                  Review extracted words, add them to your vocabulary list, and track your progress over time as you learn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
