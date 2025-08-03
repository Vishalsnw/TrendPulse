import Image from 'next/image';
import { ArrowTopRightOnSquareIcon, EyeIcon, HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

export default function TrendCard({ trend, platform, index }) {
  const renderTrendContent = () => {
    switch (platform.id) {
      case 'google':
        return (
          <>
            <div className="flex items-start gap-3 mb-4">
              {trend.thumbnail && (
                <Image
                  src={trend.thumbnail}
                  alt={trend.title}
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {trend.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {trend.traffic} searches
                </p>
              </div>
            </div>
            {trend.relatedQueries && trend.relatedQueries.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Related:</p>
                <div className="flex flex-wrap gap-1">
                  {trend.relatedQueries.slice(0, 3).map((query, i) => (
                    <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {query}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        );

      case 'youtube':
        return (
          <>
            <div className="flex items-start gap-3 mb-4">
              {trend.thumbnail && (
                <Image
                  src={trend.thumbnail}
                  alt={trend.title}
                  width={80}
                  height={60}
                  className="rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {trend.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {trend.channel}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <EyeIcon className="h-3 w-3" />
                    {trend.views}
                  </span>
                  <span>{trend.published}</span>
                </div>
              </div>
            </div>
          </>
        );

      case 'twitter':
        return (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-bold text-blue-500">#{trend.rank}</span>
              <span className="text-lg">🐦</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {trend.hashtag}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trending hashtag in India
            </p>
          </>
        );

      case 'wikipedia':
        return (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-bold text-gray-600">#{trend.rank}</span>
              <span className="text-lg">📚</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {trend.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <EyeIcon className="h-4 w-4" />
              <span>{trend.views?.toLocaleString()} views</span>
            </div>
          </>
        );

      case 'reddit':
        return (
          <>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {trend.title}
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              {trend.subreddit}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <HeartIcon className="h-3 w-3" />
                {trend.upvotes?.toLocaleString()} upvotes
              </span>
              <span className="flex items-center gap-1">
                <ChatBubbleLeftIcon className="h-3 w-3" />
                {trend.comments?.toLocaleString()} comments
              </span>
            </div>
          </>
        );

      case 'spotify':
        return (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-bold text-green-500">#{trend.rank}</span>
              <span className="text-lg">🎵</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {trend.song}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              by {trend.artist}
            </p>
            <p className="text-xs text-gray-500">
              {trend.streams} streams
            </p>
          </>
        );

      case 'netflix':
        return (
          <>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-red-600">#{trend.rank}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {trend.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎬</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Top in India
                  </span>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return (
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {trend.title || trend.hashtag || trend.song || 'Trending Item'}
          </h3>
        );
    }
  };

  return (
    <div className="trend-card p-6 hover:scale-105 transition-transform duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {platform.icon} {platform.name}
        </span>
      </div>

      {renderTrendContent()}

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <a
          href={trend.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          <span>View on {platform.name}</span>
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}