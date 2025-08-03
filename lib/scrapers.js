
import axios from 'axios';
import * as cheerio from 'cheerio';

// Google Trends Scraper - Using alternative trending searches
export async function getGoogleTrending() {
  try {
    const response = await axios.get('https://trends.google.com/trends/hottrends/visualize/internal/data', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://trends.google.com/'
      },
      timeout: 10000
    });

    if (response.data && response.data.default && response.data.default.trendingSearchesDays) {
      const latestDay = response.data.default.trendingSearchesDays[0];
      const searches = latestDay.trendingSearches.slice(0, 10);
      
      return searches.map((search, index) => ({
        title: search.title.query,
        traffic: search.formattedTraffic || 'N/A',
        thumbnail: search.image ? search.image.imageUrl : null,
        relatedQueries: search.relatedQueries || [],
        url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(search.title.query)}`
      }));
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Google Trends error:', error);
    throw new Error('Failed to fetch Google Trends data');
  }
}

// YouTube Trending Scraper - Using alternative method
export async function getYoutubeTrending() {
  try {
    const response = await axios.get('https://www.youtube.com/feed/trending?bp=6gQJRkVleHBsb3Jl', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const trends = [];

    // Look for video data in script tags
    $('script').each((i, elem) => {
      const scriptContent = $(elem).html();
      if (scriptContent && scriptContent.includes('var ytInitialData = ')) {
        try {
          const match = scriptContent.match(/var ytInitialData = ({.+?});/);
          if (match) {
            const data = JSON.parse(match[1]);
            const contents = data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.richGridRenderer?.contents;
            
            if (contents) {
              contents.slice(0, 10).forEach(item => {
                const video = item?.richItemRenderer?.content?.videoRenderer;
                if (video && video.title && video.viewCountText && video.videoId) {
                  trends.push({
                    title: video.title.runs?.[0]?.text || video.title.simpleText,
                    views: video.viewCountText.simpleText,
                    published: video.publishedTimeText?.simpleText || 'Recently',
                    thumbnail: video.thumbnail?.thumbnails?.[0]?.url,
                    channel: video.ownerText?.runs?.[0]?.text || 'Unknown',
                    url: `https://youtube.com/watch?v=${video.videoId}`
                  });
                }
              });
            }
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
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

// Twitter Trending Hashtags Scraper - Using getdaytrends.com
export async function getTwitterTrending() {
  try {
    const response = await axios.get('https://getdaytrends.com/india', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const trends = [];

    $('.trend-card .trend-name, .trend .trend-name, .trend-item .trend-name').slice(0, 10).each((i, elem) => {
      const hashtag = $(elem).text().trim();
      if (hashtag && hashtag.length > 0) {
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
          'User-Agent': 'TrendPulse/1.0 (https://trendpulse.app)',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    if (!response.data?.items?.[0]?.articles) {
      throw new Error('Invalid Wikipedia API response');
    }

    const articles = response.data.items[0].articles
      .filter(article => 
        !article.article.startsWith('Special:') && 
        !article.article.startsWith('Main_Page') &&
        article.article !== '-' &&
        article.views > 1000
      )
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
    const response = await axios.get('https://www.reddit.com/r/popular.json?limit=15', {
      headers: {
        'User-Agent': 'TrendPulse:v1.0 (by /u/trendpulse)',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    if (!response.data?.data?.children) {
      throw new Error('Invalid Reddit API response');
    }

    const posts = response.data.data.children
      .filter(post => 
        post.data && 
        post.data.title && 
        !post.data.stickied &&
        !post.data.over_18
      )
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

// Spotify Top Songs Scraper - Using Kworb.net
export async function getSpotifyTrending() {
  try {
    const response = await axios.get('https://kworb.net/spotify/country/in.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const trends = [];

    $('table.sortable tbody tr').slice(0, 10).each((i, elem) => {
      const rank = $(elem).find('td:nth-child(1)').text().trim();
      const artistAndSong = $(elem).find('td:nth-child(2)').text().trim();
      const streams = $(elem).find('td:nth-child(3)').text().trim();

      if (artistAndSong && rank && streams) {
        const parts = artistAndSong.split(' - ');
        const artist = parts[0] || 'Unknown Artist';
        const song = parts[1] || artistAndSong;

        trends.push({
          rank: rank,
          song: song,
          artist: artist,
          streams: streams,
          url: `https://open.spotify.com/search/${encodeURIComponent(artistAndSong)}`
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

// Netflix Top 10 Scraper - Using FlixPatrol
export async function getNetflixTrending() {
  try {
    const response = await axios.get('https://flixpatrol.com/top10/netflix/india/today/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const trends = [];

    $('.table-top10 tbody tr, .table tbody tr').slice(0, 10).each((i, elem) => {
      const rank = $(elem).find('.table-td:first-child, td:first-child').text().trim();
      const title = $(elem).find('.title, .table-td .title').text().trim();
      const poster = $(elem).find('img').attr('src');

      if (title && rank && poster) {
        trends.push({
          rank: rank,
          title: title,
          poster: poster.startsWith('http') ? poster : `https://flixpatrol.com${poster}`,
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
