
import axios from 'axios';
import cheerio from 'cheerio';
import googleTrends from 'google-trends-api';
import youtubeTrendingScraper from 'youtube-trending-scraper';

// Google Trends Scraper
export async function getGoogleTrending() {
  try {
    const result = await googleTrends.dailyTrends({
      geo: 'IN',
      category: 'all'
    });
    
    const data = JSON.parse(result);
    const trends = data.default.trendingSearchesDays[0].trendingSearches.slice(0, 10);
    
    return trends.map(trend => ({
      title: trend.title.query,
      traffic: trend.formattedTraffic,
      thumbnail: trend.image?.newsUrl || '/api/placeholder/100/100',
      relatedQueries: trend.relatedQueries?.map(q => q.query) || [],
      url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(trend.title.query)}&geo=IN`
    }));
  } catch (error) {
    console.error('Google Trends error:', error);
    return [];
  }
}

// YouTube Trending Scraper
export async function getYouTubeTrending() {
  try {
    const trends = await youtubeTrendingScraper.scrape_trending_page('IN');
    
    return trends.slice(0, 10).map(video => ({
      title: video.title,
      views: video.views,
      published: video.published,
      thumbnail: video.thumbnail,
      channel: video.channelName,
      url: `https://youtube.com/watch?v=${video.videoId}`
    }));
  } catch (error) {
    console.error('YouTube Trending error:', error);
    return [];
  }
}

// Twitter Trending Hashtags Scraper
export async function getTwitterTrending() {
  try {
    const response = await axios.get('https://trends24.in/india/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
    
    return trends;
  } catch (error) {
    console.error('Twitter Trending error:', error);
    return [];
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
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${year}/${month}/${day}`
    );
    
    return response.data.items[0].articles.slice(0, 10).map(article => ({
      title: article.article,
      views: article.views,
      rank: article.rank,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(article.article)}`
    }));
  } catch (error) {
    console.error('Wikipedia Trending error:', error);
    return [];
  }
}

// Reddit Popular Posts Scraper
export async function getRedditPopular() {
  try {
    const response = await axios.get('https://www.reddit.com/r/popular.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const posts = response.data.data.children.slice(0, 10);
    
    return posts.map(post => ({
      title: post.data.title,
      subreddit: post.data.subreddit_name_prefixed,
      upvotes: post.data.ups,
      comments: post.data.num_comments,
      url: `https://reddit.com${post.data.permalink}`
    }));
  } catch (error) {
    console.error('Reddit Popular error:', error);
    return [];
  }
}

// Spotify Top Songs Scraper
export async function getSpotifyTrending() {
  try {
    const response = await axios.get('https://spotifycharts.com/regional/in/daily/latest', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const trends = [];
    
    $('.chart-table tbody tr').slice(0, 10).each((i, elem) => {
      const rank = $(elem).find('.chart-table-position').text().trim();
      const song = $(elem).find('.chart-table-track strong').text().trim();
      const artist = $(elem).find('.chart-table-track span').text().trim().replace('by ', '');
      const streams = $(elem).find('.chart-table-streams').text().trim();
      
      if (song && artist) {
        trends.push({
          rank: rank || (i + 1),
          song: song,
          artist: artist,
          streams: streams,
          url: `https://open.spotify.com/search/${encodeURIComponent(song + ' ' + artist)}`
        });
      }
    });
    
    return trends;
  } catch (error) {
    console.error('Spotify Trending error:', error);
    return [];
  }
}

// Netflix Top 10 Scraper
export async function getNetflixTrending() {
  try {
    const response = await axios.get('https://flixpatrol.com/top10/netflix/india/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const trends = [];
    
    $('.table-body .row').slice(0, 10).each((i, elem) => {
      const rank = $(elem).find('.table-td:first-child').text().trim();
      const title = $(elem).find('.table-td .title').text().trim();
      const poster = $(elem).find('.table-td img').attr('src');
      
      if (title) {
        trends.push({
          rank: rank || (i + 1),
          title: title,
          poster: poster || '/api/placeholder/100/150',
          url: `https://www.netflix.com/search?q=${encodeURIComponent(title)}`
        });
      }
    });
    
    return trends;
  } catch (error) {
    console.error('Netflix Trending error:', error);
    return [];
  }
}
