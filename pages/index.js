
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TrendCard from '../components/TrendCard';
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon,
  FunnelIcon 
} from '@heroicons/react/24/outline';

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
    if (searchQuery.trim() === '') {
      setFilteredData(currentData);
    } else {
      const filtered = currentData.filter(item => {
        const searchText = searchQuery.toLowerCase();
        
        // Search in different fields based on platform
        switch (activePlatform) {
          case 'google':
            return item.title?.toLowerCase().includes(searchText);
          case 'youtube':
            return item.title?.toLowerCase().includes(searchText) || 
                   item.channel?.toLowerCase().includes(searchText);
          case 'twitter':
            return item.hashtag?.toLowerCase().includes(searchText);
          case 'wikipedia':
            return item.title?.toLowerCase().includes(searchText);
          case 'reddit':
            return item.title?.toLowerCase().includes(searchText) || 
                   item.subreddit?.toLowerCase().includes(searchText);
          case 'spotify':
            return item.song?.toLowerCase().includes(searchText) || 
                   item.artist?.toLowerCase().includes(searchText);
          case 'netflix':
            return item.title?.toLowerCase().includes(searchText);
          default:
            return false;
        }
      });
      setFilteredData(filtered);
    }
  }, [searchQuery, trendsData, activePlatform]);

  const currentPlatform = platforms.find(p => p.id === activePlatform);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            What's Trending Right Now
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover the latest trends across multiple platforms in India. 
            Real-time data from Google, YouTube, Twitter, Reddit, Wikipedia, Spotify, and Netflix.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${currentPlatform?.name} trends...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
        <div className="flex justify-center">
          <button
            onClick={refreshTrends}
            disabled={loading[activePlatform]}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-lg transition-colors"
          >
            <ArrowPathIcon 
              className={`w-5 h-5 ${loading[activePlatform] ? 'animate-spin' : ''}`} 
            />
            Refresh
          </button>
        </div>

        {/* Search Results Count */}
        {searchQuery && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Found {filteredData.length} results for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Trends Content */}
        <div className="max-w-4xl mx-auto">
          {loading[activePlatform] ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <TrendCard
              data={filteredData}
              platform={activePlatform}
              icon={currentPlatform?.icon}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Data refreshed every time you visit. All platforms scraped using free, public methods.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Built with Next.js • Deployed on Replit
          </p>
        </div>
      </div>
    </Layout>
  );
}
