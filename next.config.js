
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.ytimg.com', 'upload.wikimedia.org', 'www.redditstatic.com', 'i.redd.it'],
  },
}

module.exports = nextConfig
