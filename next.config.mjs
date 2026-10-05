// The app is served from https://www.woztech.world/Esteban
const basePath = "/Esteban"

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  reactCompiler: true,
  // basePath isn't applied to fetch() automatically, so expose it to the client.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath
  },
  // Send the bare domain path to the app root.
  async redirects() {
    return [
      {
        source: "/",
        destination: "/Esteban",
        basePath: false,
        permanent: false
      }
    ]
  }
};

export default nextConfig;
