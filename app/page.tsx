'use client';

import { useState } from 'react';

interface DomainAnalysis {
  domain: string;
  score: number;
  roasts: string[];
  compliments: string[];
  suggestions: string[];
}

export default function Home() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DomainAnalysis | null>(null);
  const [error, setError] = useState('');
  const [showResult, setShowResult] = useState(false);

  const roastDomain = async () => {
    if (!domain.trim()) {
      setError('Enter a domain first!');
      return;
    }

    setLoading(true);
    setError('');
    setShowResult(false);

    try {
      const response = await fetch('/api/roast-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to roast domain');
      }

      setResult(data.data);
      setTimeout(() => setShowResult(true), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      roastDomain();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Legendary 🏆';
    if (score >= 80) return 'Excellent 🌟';
    if (score >= 70) return 'Pretty Good 👍';
    if (score >= 60) return 'Decent 😊';
    if (score >= 50) return 'Meh 😐';
    if (score >= 40) return 'Needs Work 😬';
    return 'Yikes 💀';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 text-white">
          <h1 className="text-6xl font-bold mb-4 drop-shadow-lg">
            🔥 Domain Roaster
          </h1>
          <p className="text-xl opacity-95">
            Get brutally honest AI-powered feedback about any domain
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl mb-8">
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="example.com"
              disabled={loading}
              className="flex-1 px-5 py-4 text-lg border-2 border-gray-200 rounded-xl text-black focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all disabled:opacity-50"
            />
            <button
              onClick={roastDomain}
              disabled={loading}
              className="px-8 py-4 text-lg font-bold text-white bg-linear-to-r from-orange-500 to-red-500 rounded-xl hover:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⚡</span>
                  Roasting...
                </span>
              ) : '🔥 Roast It!'}
            </button>
          </div>

          {error && (
            <div className="px-5 py-4 bg-red-50 text-red-800 rounded-xl border-l-4 border-red-500 font-medium animate-pulse">
              ❌ {error}
            </div>
          )}
        </div>

        {result && (
          <div className={`bg-white rounded-2xl p-8 shadow-2xl mb-8 transition-all duration-500 ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-gray-100">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  {result.domain}
                </h2>
                <p className={`text-xl font-semibold ${getScoreColor(result.score)}`}>
                  {getScoreLabel(result.score)}
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}
                </div>
                <div className="text-sm text-gray-500 font-semibold">
                  / 100
                </div>
              </div>
            </div>

            {result.roasts.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <h3 className="text-2xl font-bold text-red-500">
                    🔥 The Roasts
                  </h3>
                </div>
                <div className="bg-red-50 rounded-xl p-6 border-l-4 border-red-500">
                  {result.roasts.map((roast, i) => (
                    <div key={i} className={`py-3 text-lg text-red-900 leading-relaxed ${i < result.roasts.length - 1 ? 'border-b border-red-200' : ''}`}>
                      • {roast}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.compliments.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h3 className="text-2xl font-bold text-green-500">
                    ✅ What's Working
                  </h3>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
                  {result.compliments.map((comp, i) => (
                    <div key={i} className={`py-3 text-lg text-green-900 leading-relaxed ${i < result.compliments.length - 1 ? 'border-b border-green-200' : ''}`}>
                      • {comp}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* {result.suggestions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <h3 className="text-2xl font-bold text-blue-500">
                    💡 How to Improve
                  </h3>
                </div>
                <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                  {result.suggestions.map((suggestion, i) => (
                    <div key={i} className={`py-3 text-lg text-blue-900 leading-relaxed ${i < result.suggestions.length - 1 ? 'border-b border-blue-200' : ''}`}>
                      • {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )} */}
          </div>
        )}

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            🎯 Try these popular domains:
          </h3>
          <div className="flex gap-3 flex-wrap">
            {['google.com', 'github.com', 'twitter.com', 'netflix.com', 'amazon.com', 'spotify.com'].map((example) => (
              <button
                key={example}
                onClick={() => setDomain(example)}
                onDoubleClick={() => {
                  setDomain(example);
                  roastDomain();
                }}
                disabled={loading}
                className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-purple-600 hover:text-white hover:border-purple-600 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-white disabled:hover:text-gray-700"
              >
                {example}
              </button>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-500 italic">
            💡 Tip: Double-click to roast immediately
          </p>
        </div>
      </div>
    </div>
  );
}