import axios from 'axios';
import * as cheerio from 'cheerio';

// Google Trends Scraper - Using Google Trends RSS
export async function getGoogleTrending() {
  try {
    const response = await axios.get('https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data, { xmlMode: true });
    const trends = [];

    $('item').slice(0, 10).each((i, elem) => {
      const title = $(elem).find('title').text();
      const traffic = $(elem).find('ht\\:approx_traffic, approx_traffic').text();
      const newsItem = $(elem).find('ht\\:news_item, news_item').first();
      const thumbnail = newsItem.find('ht\\:picture, picture').text();

      if (title && traffic) {
        trends.push({
          title: title,
          traffic: traffic,
          thumbnail: thumbnail,
          relatedQueries: [],
          url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(title)}&geo=IN`
        });
      }
    });

    return trends;
  } catch (error) {
    console.error('Google Trends error:', error);
    throw new Error('Failed to fetch Google Trends data');
  }
}

// YouTube Trending Scraper - Using YouTube Trending page
export async function getYoutubeTrending() {
  try {
    const response = await axios.get('https://www.youtube.com/feed/trending', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const trends = [];

    // Extract video data from YouTube's trending page
    $('script').each((i, elem) => {
      const scriptContent = $(elem).html();
      if (scriptContent && scriptContent.includes('ytInitialData')) {
        try {
          const dataMatch = scriptContent.match(/ytInitialData["']?\s*[:=]\s*(\{.+?\});/);
          if (dataMatch) {
            const data = JSON.parse(dataMatch[1]);
            const videos = data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.richGridRenderer?.contents;

            if (videos) {
              videos.slice(0, 10).forEach(video => {
                const videoData = video?.richItemRenderer?.content?.videoRenderer;
                const title = videoData.title?.runs?.[0]?.text;
                const views = videoData.viewCountText?.simpleText;
                const published = videoData.publishedTimeText?.simpleText;
                const thumbnail = videoData.thumbnail?.thumbnails?.[0]?.url;
                const channel = videoData.ownerText?.runs?.[0]?.text;
                const videoId = videoData.videoId;

                if (title && views && published && thumbnail && channel && videoId) {
                  trends.push({
                    title: title,
                    views: views,
                    published: published,
                    thumbnail: thumbnail,
                    channel: channel,
                    url: `https://youtube.com/watch?v=${videoId}`
                  });
                }
              });
            }
          }
        } catch (parseError) {
          console.error('Error parsing YouTube data:', parseError);
        }
      }
    });

    if (trends.length === 0) {
      throw new Error('No trending videos found');
    }

    return trends;
  } catch (error) {
    console.error('YouTube Trending error:', error);
    throw new Error('Failed to fetch YouTube trending data');
  }
}

// Twitter Trending Hashtags Scraper
export async function getTwitterTrending() {
  try {
    const response = await axios.get('https://trends24.in/india/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const trends = [];

    $('.trend-card__list li').slice(0, 10).each((i, elem) => {
      const hashtag = $(elem).find('a').text().trim();
      if (hashtag) {
        trends.push({
          hashtag: hashtag,
          rank: i + 1,
          url: `https://twitter.com/search?q=${encodeURIComponent(hashtag)}`
        });
      }
    });

    if (trends.length === 0) {
      throw new Error('No trending hashtags found');
    }

    return trends;
  } catch (error) {
    console.error('Twitter Trending error:', error);
    throw new Error('Failed to fetch Twitter trending data');
  }
}

// Wikipedia Most Viewed Scraper
export async function getWikipediaTrending() {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');

    const response = await axios.get(
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${year}/${month}/${day}`,
      {
        headers: {
          'User-Agent': 'TrendPulse/1.0 (https://trendpulse.example.com)'
        }
      }
    );

    const articles = response.data.items[0].articles
      .filter(article => !article.article.startsWith('Special:') && !article.article.startsWith('Main_Page'))
      .slice(0, 10);

    return articles.map(article => ({
      title: article.article.replace(/_/g, ' '),
      views: article.views.toLocaleString(),
      rank: article.rank,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(article.article)}`
    }));
  } catch (error) {
    console.error('Wikipedia Trending error:', error);
    throw new Error('Failed to fetch Wikipedia trending data');
  }
}

// Reddit Popular Posts Scraper
export async function getRedditPopular() {
  try {
    const response = await axios.get('https://www.reddit.com/r/popular.json', {
      headers: {
        'User-Agent': 'TrendPulse/1.0 (by /u/trendpulse)'
      },
      timeout: 10000
    });

    if (!response.data?.data?.children) {
      throw new Error('Invalid Reddit API response');
    }

    const posts = response.data.data.children
      .filter(post => post.data && post.data.title)
      .slice(0, 10);

    return posts.map(post => ({
      title: post.data.title,
      subreddit: post.data.subreddit_name_prefixed,
      upvotes: post.data.ups.toLocaleString(),
      comments: post.data.num_comments.toLocaleString(),
      url: `https://reddit.com${post.data.permalink}`
    }));
  } catch (error) {
    console.error('Reddit Popular error:', error);
    throw new Error('Failed to fetch Reddit trending data');
  }
}

// Spotify Top Songs Scraper - Using Spotify Charts
export async function getSpotifyTrending() {
  try {
    const response = await axios.get('https://spotifycharts.com/regional/in/daily/latest', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const trends = [];

    $('.chart-table tbody tr').slice(0, 10).each((i, elem) => {
      const rank = $(elem).find('.chart-table-position').text().trim();
      const trackInfo = $(elem).find('.chart-table-track strong').text().trim();
      const artistInfo = $(elem).find('.chart-table-track span').text().replace('by ', '').trim();
      const streams = $(elem).find('.chart-table-streams').text().trim();

      if (trackInfo && artistInfo && rank && streams) {
        trends.push({
          rank: rank,
          song: trackInfo,
          artist: artistInfo,
          streams: streams,
          url: `https://open.spotify.com/search/${encodeURIComponent(trackInfo + ' ' + artistInfo)}`
        });
      }
    });

    if (trends.length === 0) {
      throw new Error('No trending songs found');
    }

    return trends;
  } catch (error) {
    console.error('Spotify Trending error:', error);
    throw new Error('Failed to fetch Spotify trending data');
  }
}

// Netflix Top 10 Scraper
export async function getNetflixTrending() {
  try {
    const response = await axios.get('https://flixpatrol.com/top10/netflix/india/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const trends = [];

    $('.table-body .row').slice(0, 10).each((i, elem) => {
      const rank = $(elem).find('.table-td:first-child').text().trim();
      const title = $(elem).find('.table-td .title').text().trim();
      const poster = $(elem).find('.table-td img').attr('src');

      if (title && rank && poster) {
        trends.push({
          rank: rank,
          title: title,
          poster: poster,
          url: `https://www.netflix.com/search?q=${encodeURIComponent(title)}`
        });
      }
    });

    if (trends.length === 0) {
      throw new Error('No trending Netflix content found');
    }

    return trends;
  } catch (error) {
    console.error('Netflix Trending error:', error);
    throw new Error('Failed to fetch Netflix trending data');
  }
}