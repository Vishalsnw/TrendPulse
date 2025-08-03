
import puppeteer from 'puppeteer';
import axios from 'axios';

// Configure Puppeteer options for Replit environment
function getBrowserOptions() {
  return {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--window-size=1920,1080'
    ],
    ignoreDefaultArgs: ['--disable-extensions'],
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  };
}

// Google Trends Scraper using Puppeteer
export async function getGoogleTrending() {
  let browser;
  try {
    browser = await puppeteer.launch(getBrowserOptions());
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto('https://trends.google.com/trends/trendingsearches/daily?geo=IN', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await page.waitForSelector('.trending-searches-feed-item', { timeout: 15000 });

    const trends = await page.evaluate(() => {
      const items = document.querySelectorAll('.trending-searches-feed-item');
      const results = [];
      
      items.forEach((item, index) => {
        if (index < 10) {
          const titleElement = item.querySelector('.title a');
          const trafficElement = item.querySelector('.summary-text');
          
          const title = titleElement?.textContent?.trim();
          const traffic = trafficElement?.textContent?.trim();
          
          if (title && traffic) {
            results.push({
              title: title,
              traffic: traffic,
              thumbnail: null,
              relatedQueries: [],
              url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(title)}&geo=IN`
            });
          }
        }
      });
      
      return results;
    });

    return trends;
  } catch (error) {
    console.error('Google Trends error:', error);
    throw new Error('Failed to fetch Google Trends data');
  } finally {
    if (browser) await browser.close();
  }
}

// YouTube Trending Scraper using Puppeteer
export async function getYoutubeTrending() {
  let browser;
  try {
    browser = await puppeteer.launch(getBrowserOptions());
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto('https://www.youtube.com/feed/trending', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await page.waitForSelector('ytd-video-renderer', { timeout: 15000 });

    const trends = await page.evaluate(() => {
      const videos = document.querySelectorAll('ytd-video-renderer');
      const results = [];
      
      videos.forEach((video, index) => {
        if (index < 10) {
          const titleElement = video.querySelector('#video-title');
          const channelElement = video.querySelector('#channel-name a');
          const viewsElement = video.querySelector('#metadata-line span:first-child');
          const thumbnailElement = video.querySelector('img');
          
          const title = titleElement?.getAttribute('title');
          const channel = channelElement?.textContent?.trim();
          const views = viewsElement?.textContent?.trim();
          const thumbnail = thumbnailElement?.getAttribute('src');
          const href = titleElement?.getAttribute('href');
          
          if (title && channel && views && thumbnail && href) {
            results.push({
              title: title,
              views: views,
              published: 'Recently',
              thumbnail: thumbnail,
              channel: channel,
              url: href.startsWith('http') ? href : `https://youtube.com${href}`
            });
          }
        }
      });
      
      return results;
    });

    return trends;
  } catch (error) {
    console.error('YouTube Trending error:', error);
    throw new Error('Failed to fetch YouTube trending data');
  } finally {
    if (browser) await browser.close();
  }
}

// Twitter Trending Hashtags Scraper using Puppeteer
export async function getTwitterTrending() {
  let browser;
  try {
    browser = await puppeteer.launch(getBrowserOptions());
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto('https://getdaytrends.com/india', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await page.waitForSelector('.trend-card', { timeout: 15000 });

    const trends = await page.evaluate(() => {
      const trendElements = document.querySelectorAll('.trend-card .trend-name');
      const results = [];
      
      trendElements.forEach((element, index) => {
        if (index < 10) {
          const hashtag = element.textContent?.trim();
          
          if (hashtag && hashtag.length > 0) {
            results.push({
              hashtag: hashtag,
              rank: index + 1,
              url: `https://twitter.com/search?q=${encodeURIComponent(hashtag)}`
            });
          }
        }
      });
      
      return results;
    });

    return trends;
  } catch (error) {
    console.error('Twitter Trending error:', error);
    throw new Error('Failed to fetch Twitter trending data');
  } finally {
    if (browser) await browser.close();
  }
}

// Wikipedia Most Viewed Scraper (keep existing as it works)
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

// Reddit Popular Posts Scraper using Puppeteer
export async function getRedditPopular() {
  let browser;
  try {
    browser = await puppeteer.launch(getBrowserOptions());
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto('https://www.reddit.com/r/popular/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await page.waitForSelector('[data-testid="post-container"]', { timeout: 15000 });

    const trends = await page.evaluate(() => {
      const posts = document.querySelectorAll('[data-testid="post-container"]');
      const results = [];
      
      posts.forEach((post, index) => {
        if (index < 10) {
          const titleElement = post.querySelector('h3');
          const subredditElement = post.querySelector('[data-testid="subreddit-name"]');
          const upvotesElement = post.querySelector('[data-testid="vote-arrows"] button');
          const linkElement = post.querySelector('h3 a');
          
          const title = titleElement?.textContent?.trim();
          const subreddit = subredditElement?.textContent?.trim();
          const upvotes = upvotesElement?.getAttribute('aria-label');
          const href = linkElement?.getAttribute('href');
          
          if (title && subreddit && href) {
            results.push({
              title: title,
              subreddit: subreddit,
              upvotes: upvotes || 'N/A',
              comments: 'N/A',
              url: href.startsWith('http') ? href : `https://reddit.com${href}`
            });
          }
        }
      });
      
      return results;
    });

    return trends;
  } catch (error) {
    console.error('Reddit Popular error:', error);
    throw new Error('Failed to fetch Reddit trending data');
  } finally {
    if (browser) await browser.close();
  }
}

// Spotify Top Songs Scraper using Puppeteer
export async function getSpotifyTrending() {
  let browser;
  try {
    browser = await puppeteer.launch(getBrowserOptions());
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto('https://kworb.net/spotify/country/in.html', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await page.waitForSelector('table.sortable tbody tr', { timeout: 15000 });

    const trends = await page.evaluate(() => {
      const rows = document.querySelectorAll('table.sortable tbody tr');
      const results = [];
      
      rows.forEach((row, index) => {
        if (index < 10) {
          const rankElement = row.querySelector('td:nth-child(1)');
          const songArtistElement = row.querySelector('td:nth-child(2)');
          const streamsElement = row.querySelector('td:nth-child(3)');
          
          const rank = rankElement?.textContent?.trim();
          const songArtist = songArtistElement?.textContent?.trim();
          const streams = streamsElement?.textContent?.trim();
          
          if (songArtist && rank && streams) {
            const parts = songArtist.split(' - ');
            const artist = parts[0] || 'Unknown Artist';
            const song = parts[1] || songArtist;

            results.push({
              rank: rank,
              song: song,
              artist: artist,
              streams: streams,
              url: `https://open.spotify.com/search/${encodeURIComponent(songArtist)}`
            });
          }
        }
      });
      
      return results;
    });

    return trends;
  } catch (error) {
    console.error('Spotify Trending error:', error);
    throw new Error('Failed to fetch Spotify trending data');
  } finally {
    if (browser) await browser.close();
  }
}

// Netflix Top 10 Scraper using Puppeteer
export async function getNetflixTrending() {
  let browser;
  try {
    browser = await puppeteer.launch(getBrowserOptions());
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto('https://flixpatrol.com/top10/netflix/india/today/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await page.waitForSelector('.table-top10 tbody tr', { timeout: 15000 });

    const trends = await page.evaluate(() => {
      const rows = document.querySelectorAll('.table-top10 tbody tr');
      const results = [];
      
      rows.forEach((row, index) => {
        if (index < 10) {
          const rankElement = row.querySelector('.table-td:first-child');
          const titleElement = row.querySelector('.title');
          const posterElement = row.querySelector('img');
          
          const rank = rankElement?.textContent?.trim();
          const title = titleElement?.textContent?.trim();
          const poster = posterElement?.getAttribute('src');
          
          if (title && rank && poster) {
            results.push({
              rank: rank,
              title: title,
              poster: poster.startsWith('http') ? poster : `https://flixpatrol.com${poster}`,
              url: `https://www.netflix.com/search?q=${encodeURIComponent(title)}`
            });
          }
        }
      });
      
      return results;
    });

    return trends;
  } catch (error) {
    console.error('Netflix Trending error:', error);
    throw new Error('Failed to fetch Netflix trending data');
  } finally {
    if (browser) await browser.close();
  }
}
