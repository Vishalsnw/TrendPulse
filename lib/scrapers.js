
import { Builder, By, until, Options } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import axios from 'axios';

// Configure Chrome options for headless browsing
function getChromeOptions() {
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1920,1080');
  options.addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  return options;
}

// Google Trends Scraper using Selenium
export async function getGoogleTrending() {
  let driver;
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(getChromeOptions())
      .build();

    await driver.get('https://trends.google.com/trends/trendingsearches/daily?geo=IN');
    await driver.wait(until.elementLocated(By.css('.trending-searches-feed-item')), 10000);

    const trendElements = await driver.findElements(By.css('.trending-searches-feed-item'));
    const trends = [];

    for (let i = 0; i < Math.min(trendElements.length, 10); i++) {
      const element = trendElements[i];
      const titleElement = await element.findElement(By.css('.title a'));
      const title = await titleElement.getText();
      const trafficElement = await element.findElement(By.css('.summary-text'));
      const traffic = await trafficElement.getText();

      if (title && traffic) {
        trends.push({
          title: title,
          traffic: traffic,
          thumbnail: null,
          relatedQueries: [],
          url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(title)}&geo=IN`
        });
      }
    }

    return trends;
  } catch (error) {
    console.error('Google Trends error:', error);
    throw new Error('Failed to fetch Google Trends data');
  } finally {
    if (driver) await driver.quit();
  }
}

// YouTube Trending Scraper using Selenium
export async function getYoutubeTrending() {
  let driver;
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(getChromeOptions())
      .build();

    await driver.get('https://www.youtube.com/feed/trending');
    await driver.wait(until.elementLocated(By.css('ytd-video-renderer')), 15000);

    const videoElements = await driver.findElements(By.css('ytd-video-renderer'));
    const trends = [];

    for (let i = 0; i < Math.min(videoElements.length, 10); i++) {
      const element = videoElements[i];
      
      const titleElement = await element.findElement(By.css('#video-title'));
      const title = await titleElement.getAttribute('title');
      
      const channelElement = await element.findElement(By.css('#channel-name a'));
      const channel = await channelElement.getText();
      
      const viewsElement = await element.findElement(By.css('#metadata-line span:first-child'));
      const views = await viewsElement.getText();
      
      const thumbnailElement = await element.findElement(By.css('img'));
      const thumbnail = await thumbnailElement.getAttribute('src');
      
      const linkElement = await element.findElement(By.css('#video-title'));
      const href = await linkElement.getAttribute('href');

      if (title && channel && views && thumbnail && href) {
        trends.push({
          title: title,
          views: views,
          published: 'Recently',
          thumbnail: thumbnail,
          channel: channel,
          url: href
        });
      }
    }

    return trends;
  } catch (error) {
    console.error('YouTube Trending error:', error);
    throw new Error('Failed to fetch YouTube trending data');
  } finally {
    if (driver) await driver.quit();
  }
}

// Twitter Trending Hashtags Scraper using Selenium
export async function getTwitterTrending() {
  let driver;
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(getChromeOptions())
      .build();

    await driver.get('https://getdaytrends.com/india');
    await driver.wait(until.elementLocated(By.css('.trend-card')), 10000);

    const trendElements = await driver.findElements(By.css('.trend-card .trend-name'));
    const trends = [];

    for (let i = 0; i < Math.min(trendElements.length, 10); i++) {
      const hashtag = await trendElements[i].getText();
      
      if (hashtag && hashtag.length > 0) {
        trends.push({
          hashtag: hashtag,
          rank: i + 1,
          url: `https://twitter.com/search?q=${encodeURIComponent(hashtag)}`
        });
      }
    }

    return trends;
  } catch (error) {
    console.error('Twitter Trending error:', error);
    throw new Error('Failed to fetch Twitter trending data');
  } finally {
    if (driver) await driver.quit();
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

// Reddit Popular Posts Scraper using Selenium
export async function getRedditPopular() {
  let driver;
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(getChromeOptions())
      .build();

    await driver.get('https://www.reddit.com/r/popular/');
    await driver.wait(until.elementLocated(By.css('[data-testid="post-container"]')), 10000);

    const postElements = await driver.findElements(By.css('[data-testid="post-container"]'));
    const trends = [];

    for (let i = 0; i < Math.min(postElements.length, 10); i++) {
      const element = postElements[i];
      
      const titleElement = await element.findElement(By.css('h3'));
      const title = await titleElement.getText();
      
      const subredditElement = await element.findElement(By.css('[data-testid="subreddit-name"]'));
      const subreddit = await subredditElement.getText();
      
      const upvotesElement = await element.findElement(By.css('[data-testid="vote-arrows"] button'));
      const upvotes = await upvotesElement.getAttribute('aria-label');
      
      const linkElement = await element.findElement(By.css('h3 a'));
      const href = await linkElement.getAttribute('href');

      if (title && subreddit && href) {
        trends.push({
          title: title,
          subreddit: subreddit,
          upvotes: upvotes || 'N/A',
          comments: 'N/A',
          url: href
        });
      }
    }

    return trends;
  } catch (error) {
    console.error('Reddit Popular error:', error);
    throw new Error('Failed to fetch Reddit trending data');
  } finally {
    if (driver) await driver.quit();
  }
}

// Spotify Top Songs Scraper using Selenium
export async function getSpotifyTrending() {
  let driver;
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(getChromeOptions())
      .build();

    await driver.get('https://kworb.net/spotify/country/in.html');
    await driver.wait(until.elementLocated(By.css('table.sortable tbody tr')), 10000);

    const rowElements = await driver.findElements(By.css('table.sortable tbody tr'));
    const trends = [];

    for (let i = 0; i < Math.min(rowElements.length, 10); i++) {
      const element = rowElements[i];
      
      const rankElement = await element.findElement(By.css('td:nth-child(1)'));
      const rank = await rankElement.getText();
      
      const songArtistElement = await element.findElement(By.css('td:nth-child(2)'));
      const songArtist = await songArtistElement.getText();
      
      const streamsElement = await element.findElement(By.css('td:nth-child(3)'));
      const streams = await streamsElement.getText();

      if (songArtist && rank && streams) {
        const parts = songArtist.split(' - ');
        const artist = parts[0] || 'Unknown Artist';
        const song = parts[1] || songArtist;

        trends.push({
          rank: rank,
          song: song,
          artist: artist,
          streams: streams,
          url: `https://open.spotify.com/search/${encodeURIComponent(songArtist)}`
        });
      }
    }

    return trends;
  } catch (error) {
    console.error('Spotify Trending error:', error);
    throw new Error('Failed to fetch Spotify trending data');
  } finally {
    if (driver) await driver.quit();
  }
}

// Netflix Top 10 Scraper using Selenium
export async function getNetflixTrending() {
  let driver;
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(getChromeOptions())
      .build();

    await driver.get('https://flixpatrol.com/top10/netflix/india/today/');
    await driver.wait(until.elementLocated(By.css('.table-top10 tbody tr')), 10000);

    const rowElements = await driver.findElements(By.css('.table-top10 tbody tr'));
    const trends = [];

    for (let i = 0; i < Math.min(rowElements.length, 10); i++) {
      const element = rowElements[i];
      
      const rankElement = await element.findElement(By.css('.table-td:first-child'));
      const rank = await rankElement.getText();
      
      const titleElement = await element.findElement(By.css('.title'));
      const title = await titleElement.getText();
      
      const posterElement = await element.findElement(By.css('img'));
      const poster = await posterElement.getAttribute('src');

      if (title && rank && poster) {
        trends.push({
          rank: rank,
          title: title,
          poster: poster.startsWith('http') ? poster : `https://flixpatrol.com${poster}`,
          url: `https://www.netflix.com/search?q=${encodeURIComponent(title)}`
        });
      }
    }

    return trends;
  } catch (error) {
    console.error('Netflix Trending error:', error);
    throw new Error('Failed to fetch Netflix trending data');
  } finally {
    if (driver) await driver.quit();
  }
}
