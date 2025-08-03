
import { getTwitterTrending } from '../../lib/scrapers';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const trends = await getTwitterTrending();
    res.status(200).json(trends);
  } catch (error) {
    console.error('Twitter Trending API error:', error);
    res.status(500).json({ message: 'Failed to fetch Twitter trends' });
  }
}
