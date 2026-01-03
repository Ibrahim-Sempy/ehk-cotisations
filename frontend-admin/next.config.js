/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // NEXT_PUBLIC_ variables are automatically available in the browser
  // No need to define them in env, they're already accessible via process.env.NEXT_PUBLIC_API_URL
}

module.exports = nextConfig

