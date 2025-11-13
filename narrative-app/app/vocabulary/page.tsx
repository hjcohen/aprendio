'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface VocabularyItem {
  id: string;
  word: string;
  translation?: string;
  language: string;
  isKnown: boolean;
  context?: string;
  notes?: string;
  createdAt: string;
}

export default function VocabularyPage() {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'known' | 'learning'>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItem, setNewItem] = useState({
    word: '',
    translation: '',
    language: 'Spanish',
    isKnown: false,
    context: '',
    notes: '',
  });

  useEffect(() => {
    fetchVocabulary();
  }, [filter]);

  const fetchVocabulary = async () => {
    try {
      const params = new URLSearchParams();
      if (filter === 'known') params.append('isKnown', 'true');
      if (filter === 'learning') params.append('isKnown', 'false');

      const response = await fetch(`/api/vocabulary?${params}`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        setNewItem({
          word: '',
          translation: '',
          language: 'Spanish',
          isKnown: false,
          context: '',
          notes: '',
        });
        setIsAddingNew(false);
        fetchVocabulary();
      }
    } catch (error) {
      console.error('Error adding vocabulary:', error);
    }
  };

  const toggleKnown = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/vocabulary/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isKnown: !currentStatus }),
      });
      fetchVocabulary();
    } catch (error) {
      console.error('Error updating vocabulary:', error);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await fetch(`/api/vocabulary/${id}`, { method: 'DELETE' });
      fetchVocabulary();
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Vocabulary</h1>
          <p className="text-gray-600">Manage your personal vocabulary list</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('learning')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'learning'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Learning
              </button>
              <button
                onClick={() => setFilter('known')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'known'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Known
              </button>
            </div>
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              + Add Word
            </button>
          </div>
        </div>

        {isAddingNew && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Word</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Word *
                  </label>
                  <input
                    type="text"
                    required
                    value={newItem.word}
                    onChange={(e) => setNewItem({ ...newItem, word: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Translation
                  </label>
                  <input
                    type="text"
                    value={newItem.translation}
                    onChange={(e) => setNewItem({ ...newItem, translation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language *
                  </label>
                  <input
                    type="text"
                    required
                    value={newItem.language}
                    onChange={(e) => setNewItem({ ...newItem, language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItem.isKnown}
                      onChange={(e) => setNewItem({ ...newItem, isKnown: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      I already know this word
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Context / Example
                </label>
                <textarea
                  value={newItem.context}
                  onChange={(e) => setNewItem({ ...newItem, context: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Add Word
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">No vocabulary items yet.</p>
            <p className="text-gray-400 mt-2">Add words manually or upload a transcript to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{item.word}</h3>
                      {item.translation && (
                        <span className="text-gray-600">→ {item.translation}</span>
                      )}
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.language}
                      </span>
                      <span
                        className={`text-sm px-3 py-1 rounded-full ${
                          item.isKnown
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {item.isKnown ? 'Known' : 'Learning'}
                      </span>
                    </div>
                    {item.context && (
                      <p className="text-gray-600 italic mb-2">{item.context}</p>
                    )}
                    {item.notes && (
                      <p className="text-gray-500 text-sm">{item.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => toggleKnown(item.id, item.isKnown)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title={item.isKnown ? 'Mark as learning' : 'Mark as known'}
                    >
                      {item.isKnown ? '📚' : '✓'}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
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
