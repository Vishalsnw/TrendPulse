
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export default function TrendCard({ data, platform, icon }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpanded = (index) => {
    setExpanded(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const renderGoogleTrend = (trend, index) => (
    <div key={index} className="trend-card p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <img 
            src={trend.thumbnail} 
            alt={trend.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {trend.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Traffic: {trend.traffic}
          </p>
          <button
            onClick={() => toggleExpanded(index)}
            className="flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            Related Articles
            {expanded[index] ? 
              <ChevronUpIcon className="w-4 h-4 ml-1" /> : 
              <ChevronDownIcon className="w-4 h-4 ml-1" />
            }
          </button>
          {expanded[index] && (
            <div className="mt-2 space-y-1">
              {trend.articles.map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-blue-600 hover:text-blue-800 truncate"
                >
                  {article.title} - {article.source}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderYouTubeTrend = (trend, index) => (
    <div key={index} className="trend-card p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <img 
            src={trend.thumbnail} 
            alt={trend.title}
            className="w-20 h-14 rounded-lg object-cover"
          />
        </div>
        <div className="flex-1">
          <a 
            href={trend.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 block mb-1"
          >
            {trend.title}
          </a>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {trend.channel}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            <span>{trend.views} views</span>
            <span>{trend.publishedTime}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTwitterTrend = (trend, index) => (
    <div key={index} className="trend-card p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-primary-600">#{trend.rank}</span>
          <a
            href={trend.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 dark:text-white hover:text-primary-600"
          >
            {trend.hashtag}
          </a>
        </div>
        <span className="text-sm text-gray-500">Trending in India</span>
      </div>
    </div>
  );

  const renderWikipediaTrend = (trend, index) => (
    <div key={index} className="trend-card p-4 mb-4">
      <div className="flex items-center justify-between">
        <a
          href={trend.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 flex-1"
        >
          {trend.title}
        </a>
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-3">
          {trend.views} views
        </span>
      </div>
    </div>
  );

  const renderRedditTrend = (trend, index) => (
    <div key={index} className="trend-card p-4 mb-4">
      <div className="space-y-2">
        <a
          href={trend.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 block"
        >
          {trend.title}
        </a>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
            r/{trend.subreddit}
          </span>
          <div className="flex items-center gap-3">
            <span>↑ {trend.upvotes.toLocaleString()}</span>
            <span>{trend.comments} comments</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSpotifyTrend = (trend, index) => (
    <div key={index} className="trend-card p-4 mb-4">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-primary-600 w-8">#{trend.rank}</span>
        <div className="flex-1">
          <a
            href={trend.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 block"
          >
            {trend.song}
          </a>
          <p className="text-sm text-gray-600 dark:text-gray-400">by {trend.artist}</p>
          {trend.streams && (
            <p className="text-xs text-gray-500 mt-1">{trend.streams} streams</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderNetflixTrend = (trend, index) => (
    <div key={index} className="trend-card p-4 mb-4">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-primary-600 w-8">#{trend.rank}</span>
        <div className="flex-shrink-0">
          <img 
            src={trend.poster} 
            alt={trend.title}
            className="w-12 h-16 rounded object-cover"
          />
        </div>
        <div className="flex-1">
          <a
            href={trend.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 block"
          >
            {trend.title}
          </a>
          <p className="text-sm text-gray-600 dark:text-gray-400">Netflix India</p>
        </div>
      </div>
    </div>
  );

  const renderTrend = (trend, index) => {
    switch (platform) {
      case 'google':
        return renderGoogleTrend(trend, index);
      case 'youtube':
        return renderYouTubeTrend(trend, index);
      case 'twitter':
        return renderTwitterTrend(trend, index);
      case 'wikipedia':
        return renderWikipediaTrend(trend, index);
      case 'reddit':
        return renderRedditTrend(trend, index);
      case 'spotify':
        return renderSpotifyTrend(trend, index);
      case 'netflix':
        return renderNetflixTrend(trend, index);
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
          {platform} Trending
        </h2>
      </div>
      {data.length > 0 ? (
        data.map((trend, index) => renderTrend(trend, index))
      ) : (
        <div className="trend-card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No trending data available</p>
        </div>
      )}
    </div>
  );
}
