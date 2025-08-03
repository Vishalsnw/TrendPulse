import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TrendCard from '../components/TrendCard';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const platforms = [
  { id: 'google', name: 'Google', icon: '🔍', color: 'bg-blue-500' },
  { id: 'youtube', name: 'YouTube', icon: '📹', color: 'bg-red-500' },
  { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-blue-400' },
  { id: 'wikipedia', name: 'Wikipedia', icon: '📚', color: 'bg-gray-600' },
  { id: 'reddit', name: 'Reddit', icon: '🔶', color: 'bg-orange-500' },
  { id: 'spotify', name: 'Spotify', icon: '🎵', color: 'bg-green-500' },
  { id: 'netflix', name: 'Netflix', icon: '🎬', color: 'bg-red-600' },
];

export default function Home() {
  const [activePlatform, setActivePlatform] = useState('google');
  const [trendsData, setTrendsData] = useState({});
  const [loading, setLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const fetchTrends = async (platform) => {
    setLoading(prev => ({ ...prev, [platform]: true }));
    try {
      const response = await fetch(`/api/${platform}`);
      const data = await response.json();
      setTrendsData(prev => ({ ...prev, [platform]: data }));
    } catch (error) {
      console.error(`Failed to fetch ${platform} trends:`, error);
      setTrendsData(prev => ({ ...prev, [platform]: [] }));
    } finally {
      setLoading(prev => ({ ...prev, [platform]: false }));
    }
  };

  const refreshTrends = () => {
    fetchTrends(activePlatform);
  };

  useEffect(() => {
    fetchTrends(activePlatform);
  }, [activePlatform]);

  useEffect(() => {
    const currentData = trendsData[activePlatform] || [];
    if (searchQuery) {
      const filtered = currentData.filter(item => {
        const searchFields = [
          item.title,
          item.hashtag,
          item.song,
          item.artist,
          item.channel,
          item.subreddit
        ].filter(Boolean).join(' ').toLowerCase();

        return searchFields.includes(searchQuery.toLowerCase());
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(currentData);
    }
  }, [searchQuery, trendsData, activePlatform]);

  const currentPlatform = platforms.find(p => p.id === activePlatform);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              TrendPulse
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Discover what's trending across the internet
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search trends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Platform Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setActivePlatform(platform.id)}
                className={`platform-tab ${
                  activePlatform === platform.id ? 'active' : 'inactive'
                }`}
              >
                <span className="text-lg">{platform.icon}</span>
                <span className="hidden sm:inline">{platform.name}</span>
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={refreshTrends}
              disabled={loading[activePlatform]}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-600 disabled:opacity-50"
            >
              <ArrowPathIcon 
                className={`h-5 w-5 ${loading[activePlatform] ? 'animate-spin' : ''}`} 
              />
              <span>Refresh {currentPlatform?.name} Trends</span>
            </button>
          </div>

          {/* Trends Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading[activePlatform] ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="trend-card p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))
            ) : filteredData.length > 0 ? (
              filteredData.map((trend, index) => (
                <TrendCard
                  key={index}
                  trend={trend}
                  platform={currentPlatform}
                  index={index}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No trends found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? 'Try a different search term' : 'Unable to fetch trends at the moment'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}