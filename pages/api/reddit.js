
import { getRedditPopular } from '../../lib/scrapers';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const trends = await getRedditPopular();
    res.status(200).json(trends);
  } catch (error) {
    console.error('Reddit Popular API error:', error);
    res.status(500).json({ message: 'Failed to fetch Reddit trends' });
  }
}
