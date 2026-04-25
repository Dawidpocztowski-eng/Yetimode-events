/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pauyvgfkqdqohthzmbtj.supabase.co' },
    ],
  },
}
module.exports = nextConfig
